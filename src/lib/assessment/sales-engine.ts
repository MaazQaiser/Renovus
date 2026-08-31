import { CHANNELS, getSalesQuestion } from "@/data/sales";
import { createId } from "@/lib/id";
import type { AnswerValue } from "@/types/question";
import type {
  ChannelEntry,
  ChannelMap,
  ChatMessage,
  Classification,
  ConfidenceLevel,
  SalesAnswer,
  SalesAssessmentSession,
  SalesFollowUpRule,
  SalesQuestion,
  SalesSessionKey,
} from "@/types/sales-assessment";
import { UNMEASURED_CONFIDENCE } from "@/types/sales-assessment";
import {
  buildCeoCloseQueue,
  buildMarketingQueue,
  buildPhase1Queue,
  buildPhase2Queue,
  classificationLabel,
  classify,
  expandLoop,
  hasMarketingOwner,
} from "./sales-routing";

/** The spec allows at most two follow-ups per question. */
const MAX_FOLLOWUPS = 2;
/** And at most three interview requests across the assessment. */
const MAX_INTERVIEW_REQUESTS = 3;

function nowIso(): string {
  return new Date().toISOString();
}

export function createMessage(
  role: ChatMessage["role"],
  kind: ChatMessage["kind"],
  content: string,
  questionId?: string,
): ChatMessage {
  return {
    id: createId(role),
    role,
    kind,
    content,
    timestamp: nowIso(),
    questionId,
  };
}

export const INTRO_COPY =
  "Let's establish a baseline for your sales function. I'll ask a few questions about how opportunities are generated, pursued, and won.";

export const COMPANY_PROMPT = "Which portfolio company would you like to assess?";

export const RESPONDENT_PROMPT =
  "Before we start — who's answering this part, and what's their role?";

export const WHO_PROBE = "Who in the company would know that?";

export const GATE_COPY =
  "That's Phase 1. Here's the snapshot so far — tell me if anything's wrong, then we'll go deeper on the channels you actually use.";

export const COMPLETION_COPY =
  "That's everything I need. I'll pull the baseline report together now.";

const SESSION_INTRO: Record<SalesSessionKey, string> = {
  phase1: "Phase 1 — the business, the sales engine, and the channel map.",
  deepdive: "Phase 2 — a deeper look at the channels you actually use.",
  marketing: "Marketing session — how demand is created and measured.",
  "ceo-close": "Last few questions, back to you as CEO.",
};

export function createInitialSession(): SalesAssessmentSession {
  const startedAt = nowIso();
  return {
    id: createId("sales"),
    departmentId: "sales",
    phase: "company",
    activeSession: "phase1",
    respondents: [],
    wantedSegments: [],
    gate: { status: "not-reached", corrections: [] },
    answers: {},
    followUpsUsed: {},
    whoRegistry: {},
    interviewRequests: [],
    handoffNotes: [],
    timings: [],
    messages: [
      createMessage("agent", "intro", INTRO_COPY),
      createMessage("agent", "company-prompt", COMPANY_PROMPT),
    ],
    queue: [],
    status: "in-progress",
    startedAt,
    updatedAt: startedAt,
    qbankVersion: "v4",
  };
}

/** Interpolates the `{{company}}` / `{{pe_firm}}` tokens the spec's copy uses. */
export function renderQuestionText(
  question: SalesQuestion,
  session: SalesAssessmentSession,
): SalesQuestion {
  const company = session.companyName ?? "the company";
  const text = question.question
    .replaceAll("{{company}}", company)
    .replaceAll("{{pe_firm}}", "Renovus");
  return text === question.question ? question : { ...question, question: text };
}

/**
 * Resolves a queue id to a question, including loop instances, and injects the
 * runtime options CH1b needs (the channels the company said it uses).
 */
export function resolveQuestion(
  session: SalesAssessmentSession,
  questionId: string,
): SalesQuestion | undefined {
  const question = getSalesQuestion(questionId);
  if (!question) return undefined;

  if (question.id === "CH1b") {
    const using = (session.channelMap?.entries ?? []).filter(
      (entry) => entry.status === "using",
    );
    return renderQuestionText(
      {
        ...question,
        options: using.map((entry) => ({
          id: entry.channel,
          label: CHANNELS.find((c) => c.id === entry.channel)?.label ?? entry.channel,
        })),
      },
      session,
    );
  }

  return renderQuestionText(question, session);
}

export function resolveAnswerLabel(question: SalesQuestion, value: AnswerValue): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((id) => question.options?.find((option) => option.id === id)?.label ?? id)
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") {
    return question.options?.find((option) => option.id === value)?.label ?? value;
  }
  return String(value);
}

function matchesTrigger(
  rule: SalesFollowUpRule,
  value: AnswerValue,
  label: string,
): boolean {
  const text = label.toLowerCase();
  const ids = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? [value]
      : [];

  switch (rule.when.kind) {
    case "always":
      return true;
    case "optionIds":
      return rule.when.ids.some((id) => ids.includes(id));
    case "includes":
      return rule.when.tokens.some((token) => text.includes(token.toLowerCase()));
    case "multiValue":
      return Array.isArray(value) && value.length >= rule.when.min;
  }
}

/** The follow-ups a given answer earns, capped at the spec's two per question. */
function followUpsFor(
  session: SalesAssessmentSession,
  question: SalesQuestion,
  value: AnswerValue,
  label: string,
): string[] {
  const used = session.followUpsUsed[question.id] ?? 0;
  const remaining = MAX_FOLLOWUPS - used;
  if (remaining <= 0) return [];

  return (question.followUps ?? [])
    .filter((rule) => matchesTrigger(rule, value, label))
    .slice(0, remaining)
    .map((rule) => rule.id);
}

function currentRespondentId(session: SalesAssessmentSession): string | undefined {
  return session.respondents.find(
    (respondent) => respondent.sessionKey === session.activeSession,
  )?.id;
}

// ── Setup ──────────────────────────────────────────────────────────────────

export function selectCompany(
  session: SalesAssessmentSession,
  companyId: string,
  companyName: string,
): SalesAssessmentSession {
  return {
    ...session,
    companyId,
    companyName,
    phase: "respondent",
    messages: [
      ...session.messages,
      createMessage("user", "company-answer", companyName),
      createMessage("agent", "respondent-prompt", RESPONDENT_PROMPT),
    ],
    updatedAt: nowIso(),
  };
}

/** Records who is answering the current session, then starts its queue. */
export function submitRespondent(
  session: SalesAssessmentSession,
  name: string,
  role: string,
): SalesAssessmentSession {
  const respondent = {
    id: createId("person"),
    name,
    role,
    sessionKey: session.activeSession,
  };

  const queue = queueForSession(session, session.activeSession);
  const [first, ...rest] = queue;
  const phase = phaseForSession(session.activeSession);

  let messages = [
    ...session.messages,
    createMessage("user", "answer", `${name} · ${role}`),
    createMessage("agent", "session-intro", SESSION_INTRO[session.activeSession]),
  ];
  if (first) {
    const question = resolveQuestion(session, first);
    if (question) {
      messages = [
        ...messages,
        createMessage("agent", "question", question.question, first),
      ];
    }
  }

  return {
    ...session,
    phase,
    respondents: [...session.respondents, respondent],
    timings: [
      ...session.timings,
      { sessionKey: session.activeSession, startedAt: nowIso() },
    ],
    queue: rest,
    currentQuestionId: first,
    messages,
    updatedAt: nowIso(),
  };
}

function phaseForSession(key: SalesSessionKey): SalesAssessmentSession["phase"] {
  switch (key) {
    case "phase1":
      return "phase1";
    case "deepdive":
      return "phase2";
    case "marketing":
      return "marketing";
    case "ceo-close":
      return "ceo-close";
  }
}

function queueForSession(
  session: SalesAssessmentSession,
  key: SalesSessionKey,
): string[] {
  switch (key) {
    case "phase1":
      return buildPhase1Queue();
    case "deepdive":
      return buildPhase2Queue(session.channelMap, effectiveClassification(session));
    case "marketing":
      return buildMarketingQueue();
    case "ceo-close":
      return buildCeoCloseQueue();
  }
}

export function effectiveClassification(
  session: SalesAssessmentSession,
): Classification | undefined {
  // The respondent's override always wins — the spec is explicit about this.
  return session.classificationOverride ?? session.classification;
}

// ── Answering ──────────────────────────────────────────────────────────────

/**
 * Records an answer, then decides what comes next: the mandatory →WHO probe for
 * an unmeasured answer, any earned follow-ups, or the next queued question.
 */
export function submitAnswer(
  session: SalesAssessmentSession,
  value: AnswerValue,
  options: { freeLabel?: string; confidence?: ConfidenceLevel } = {},
): SalesAssessmentSession {
  const questionId = session.currentQuestionId;
  if (!questionId) return session;
  const question = resolveQuestion(session, questionId);
  if (!question) return session;

  const label = options.freeLabel?.trim() || resolveAnswerLabel(question, value);
  const answer: SalesAnswer = {
    value,
    label,
    confidence: question.asksConfidence ? options.confidence : undefined,
    respondentId: currentRespondentId(session),
  };

  let next: SalesAssessmentSession = {
    ...session,
    answers: { ...session.answers, [questionId]: answer },
    messages: [...session.messages, createMessage("user", "answer", label, questionId)],
    updatedAt: nowIso(),
  };

  // CH1 defines the channel map, which in turn seeds the CH2 loop.
  if (question.type === "channel-matrix") {
    next = applyChannelMap(next, value);
  }
  if (question.id === "CH3") {
    next = applySegments(next, label);
  }

  // The →WHO probe is mandatory and comes before any follow-up.
  if (
    answer.confidence &&
    UNMEASURED_CONFIDENCE.includes(answer.confidence) &&
    !answer.whoWouldKnow
  ) {
    return {
      ...next,
      pendingWhoFor: questionId,
      messages: [...next.messages, createMessage("agent", "who-probe", WHO_PROBE, questionId)],
    };
  }

  const followUps = followUpsFor(next, question, value, label);
  return advance(next, followUps, question.id);
}

/** Answers the mandatory "who would know?" probe. */
export function submitWho(
  session: SalesAssessmentSession,
  personOrRole: string,
): SalesAssessmentSession {
  const questionId = session.pendingWhoFor;
  if (!questionId) return session;

  const name = personOrRole.trim();
  const existing = session.answers[questionId];
  const questionIds = [...(session.whoRegistry[name] ?? [])];
  if (!questionIds.includes(questionId)) questionIds.push(questionId);

  // Two distinct questions pointing at the same person becomes an interview ask.
  const alreadyRequested = session.interviewRequests.some(
    (request) => request.personOrRole === name,
  );
  const interviewRequests =
    questionIds.length >= 2 &&
    !alreadyRequested &&
    session.interviewRequests.length < MAX_INTERVIEW_REQUESTS
      ? [
          ...session.interviewRequests,
          {
            id: createId("interview"),
            personOrRole: name,
            questionIds,
            reason: `Named as the source for ${questionIds.length} unmeasured answers.`,
            status: "requested" as const,
          },
        ]
      : session.interviewRequests;

  const next: SalesAssessmentSession = {
    ...session,
    pendingWhoFor: undefined,
    answers: existing
      ? { ...session.answers, [questionId]: { ...existing, whoWouldKnow: name } }
      : session.answers,
    whoRegistry: { ...session.whoRegistry, [name]: questionIds },
    interviewRequests,
    messages: [...session.messages, createMessage("user", "answer", name, questionId)],
    updatedAt: nowIso(),
  };

  const question = resolveQuestion(next, questionId);
  const followUps = question
    ? followUpsFor(next, question, existing?.value ?? null, existing?.label ?? "")
    : [];
  return advance(next, followUps, questionId);
}

function applyChannelMap(
  session: SalesAssessmentSession,
  value: AnswerValue,
): SalesAssessmentSession {
  // The matrix answer arrives as "channel:status" pairs.
  const entries: ChannelEntry[] = CHANNELS.map((channel) => {
    const raw = Array.isArray(value)
      ? value.find((item) => String(item).startsWith(`${channel.id}:`))
      : undefined;
    const status = raw ? String(raw).split(":")[1] : "not-using";
    return {
      channel: channel.id,
      status: (status === "using" || status === "want" ? status : "not-using") as
        | "using"
        | "want"
        | "not-using",
    };
  });

  const channelMap: ChannelMap = { entries, dominant: [] };
  const wanted = entries.filter((entry) => entry.status === "want");

  return {
    ...session,
    channelMap,
    // CH2 is asked once per wanted channel — spliced in right after CH1b.
    queue: [...session.queue.slice(0, 1), ...expandLoop("CH2", wanted.map((e) => e.channel)), ...session.queue.slice(1)],
  };
}

function applySegments(
  session: SalesAssessmentSession,
  label: string,
): SalesAssessmentSession {
  const segments = label
    .split(/[,;]|\band\b/)
    .map((part) => part.trim())
    .filter((part) => part.length > 2)
    .slice(0, 3);

  return {
    ...session,
    wantedSegments: segments.map((segment, index) => ({
      id: `seg-${index + 1}`,
      label: segment,
    })),
  };
}

function applyDominant(
  session: SalesAssessmentSession,
  value: AnswerValue,
): SalesAssessmentSession {
  if (!session.channelMap) return session;
  const dominant = (Array.isArray(value) ? value.map(String) : [String(value)])
    .filter((id) => session.channelMap?.entries.some((entry) => entry.channel === id))
    .slice(0, 2) as ChannelMap["dominant"];
  return { ...session, channelMap: { ...session.channelMap, dominant } };
}

/** Moves to the next question, opening the gate or closing out when the queue empties. */
function advance(
  session: SalesAssessmentSession,
  followUpIds: string[],
  answeredId: string,
): SalesAssessmentSession {
  let next = session;

  if (answeredId === "CH1b") {
    next = applyDominant(next, next.answers["CH1b"]?.value ?? []);
  }

  const followUpsUsed = followUpIds.length
    ? {
        ...next.followUpsUsed,
        [answeredId]: (next.followUpsUsed[answeredId] ?? 0) + followUpIds.length,
      }
    : next.followUpsUsed;

  const queue = [...followUpIds, ...next.queue];
  const [head, ...rest] = queue;

  if (!head) {
    return closeSession({ ...next, followUpsUsed, queue: [], currentQuestionId: undefined });
  }

  const question = resolveQuestion(next, head);
  return {
    ...next,
    followUpsUsed,
    queue: rest,
    currentQuestionId: head,
    messages: question
      ? [...next.messages, createMessage("agent", "question", question.question, head)]
      : next.messages,
  };
}

/** Called when a session's queue runs dry — decides what the next stage is. */
function closeSession(session: SalesAssessmentSession): SalesAssessmentSession {
  const timings = session.timings.map((timing) =>
    timing.sessionKey === session.activeSession && !timing.endedAt
      ? { ...timing, endedAt: nowIso() }
      : timing,
  );

  if (session.activeSession === "phase1") {
    const classification = classify(session.answers, session.channelMap);
    return {
      ...session,
      timings,
      phase: "gate",
      classification,
      gate: { ...session.gate, status: "open" },
      messages: [...session.messages, createMessage("agent", "gate", GATE_COPY)],
    };
  }

  const nextSession = nextSessionAfter(session);
  if (!nextSession) {
    return {
      ...session,
      timings,
      phase: "complete",
      messages: [...session.messages, createMessage("agent", "complete", COMPLETION_COPY)],
    };
  }

  return {
    ...session,
    timings,
    activeSession: nextSession,
    phase: "respondent",
    messages: [
      ...session.messages,
      createMessage("agent", "respondent-prompt", RESPONDENT_PROMPT),
    ],
  };
}

function nextSessionAfter(session: SalesAssessmentSession): SalesSessionKey | undefined {
  if (session.activeSession === "deepdive") {
    return hasMarketingOwner(session.answers) ? "marketing" : "ceo-close";
  }
  if (session.activeSession === "marketing") return "ceo-close";
  return undefined;
}

// ── The Phase 1 gate ───────────────────────────────────────────────────────

export function submitGateCorrection(
  session: SalesAssessmentSession,
  correction: string,
): SalesAssessmentSession {
  const text = correction.trim();
  if (!text) return session;
  return {
    ...session,
    gate: { ...session.gate, corrections: [...session.gate.corrections, text] },
    messages: [...session.messages, createMessage("user", "answer", text)],
    updatedAt: nowIso(),
  };
}

export function overrideClassification(
  session: SalesAssessmentSession,
  classification: Classification,
): SalesAssessmentSession {
  return {
    ...session,
    classificationOverride: classification,
    messages: [
      ...session.messages,
      createMessage("user", "answer", classificationLabel(classification)),
    ],
    updatedAt: nowIso(),
  };
}

/** Accepts the snapshot and opens the deep-dive session. */
export function acceptGate(session: SalesAssessmentSession): SalesAssessmentSession {
  return {
    ...session,
    gate: { ...session.gate, status: "accepted", acceptedAt: nowIso() },
    activeSession: "deepdive",
    phase: "respondent",
    messages: [
      ...session.messages,
      createMessage("agent", "respondent-prompt", RESPONDENT_PROMPT),
    ],
    updatedAt: nowIso(),
  };
}

// ── Misc ───────────────────────────────────────────────────────────────────

export function addHandoffNote(
  session: SalesAssessmentSession,
  note: { topic: string; quote: string; suggestedAgent: string; sourceQuestionId?: string },
): SalesAssessmentSession {
  return {
    ...session,
    handoffNotes: [...session.handoffNotes, { id: createId("handoff"), ...note }],
    updatedAt: nowIso(),
  };
}

/** Re-asks a question the respondent wants to revise. Never re-asks answered ones otherwise. */
export function jumpToQuestion(
  session: SalesAssessmentSession,
  questionId: string,
): SalesAssessmentSession {
  const question = resolveQuestion(session, questionId);
  if (!question) return session;

  return {
    ...session,
    currentQuestionId: questionId,
    queue: session.currentQuestionId
      ? [session.currentQuestionId, ...session.queue]
      : session.queue,
    messages: [
      ...session.messages,
      createMessage("agent", "question", question.question, questionId),
    ],
    updatedAt: nowIso(),
  };
}

export function markProcessing(session: SalesAssessmentSession): SalesAssessmentSession {
  return { ...session, status: "processing", updatedAt: nowIso() };
}

export function mockSpeechTranscript(question: SalesQuestion): string {
  const samples: Record<string, string> = {
    B1: "We sell managed IT services, mostly to mid-market healthcare and a few state agencies.",
    B2: "Average is around $180K; smallest was maybe $40K, largest just over $1M.",
    E1: "Honestly it's mostly referrals and a handful of RFP portals.",
    E6: "Probably half of next year would be at risk. That's the uncomfortable bit.",
    T2: "Maybe 30% real selling, 40% proposals, the rest admin and helping delivery.",
  };
  return (
    samples[question.id] ??
    `For ${question.question.replace(/\?$/, "").slice(0, 60)}, here's our current view.`
  );
}
