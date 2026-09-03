import {
  ROUND_2_IDS,
  ROUND_3_IDS,
  VALUE_CREATION_ID,
  buildFullDiscoveryQueue,
  buildRound1Queue,
  getOffshoringQuestion,
  phaseForQuestionId,
} from "@/data/offshoringQuestions";
import { getCompanyById } from "@/lib/companies";
import { getMockOffshoringReport } from "@/data/offshoringReport";
import { createId } from "@/lib/id";
import { defaultSector, seedFunctionsForSector } from "@/lib/offshoring/functions";
import { buildPreviewSnapshot, previewToText } from "@/lib/offshoring/preview";
import type { AnswerValue } from "@/types/question";
import type { UploadedFile } from "@/types/file";
import type { Sector } from "@/types/company";
import type {
  DetectedFunction,
  OffshoringAnswer,
  OffshoringChatMessage,
  OffshoringClarificationRule,
  OffshoringDataTier,
  OffshoringQuestion,
  OffshoringSession,
} from "@/types/offshoring";
import type { AssessmentRecord } from "@/types/record";
import type { ConfidenceLevel } from "@/types/sales-assessment";

function nowIso(): string {
  return new Date().toISOString();
}

function messageId(prefix: string): string {
  return createId(prefix);
}

export function createMessage(
  role: OffshoringChatMessage["role"],
  kind: OffshoringChatMessage["kind"],
  content: string,
  questionId?: string,
): OffshoringChatMessage {
  return {
    id: messageId(role),
    role,
    kind,
    content,
    timestamp: nowIso(),
    questionId,
  };
}

export const INTRO_COPY =
  "Let's run a Workforce Sourcing Assessment. I'll start with the company and payroll sheet, then three short discovery rounds.";

export const COMPANY_PROMPT = "Which portfolio company would you like to assess?";

export const PAYROLL_PROMPT =
  "Upload the company payroll sheet. I'll use roles, locations, and cost structure to judge which work could move offshore.";

export const AFTER_PAYROLL_COPY =
  "Thanks. I've mapped a starter function list from the sector. Three discovery questions next.";

export const SKIP_PAYROLL_COPY =
  "We'll continue without a payroll sheet (Tier C — potential only until bands are supplied). Three discovery questions next.";

export const ROUND_2_INTRO =
  "Next: offshore cost assumptions, transition costs, and hard constraints.";

export const COMPLETION_COPY =
  "That's everything I need for the sourcing assessment. Analysis and the executive dashboard come next.";

export function createInitialOffshoringSession(): OffshoringSession {
  const startedAt = nowIso();
  return {
    id: `offshoring-${startedAt}`,
    phase: "company",
    messages: [
      createMessage("agent", "intro", INTRO_COPY),
      createMessage("agent", "company-prompt", COMPANY_PROMPT),
    ],
    files: [],
    skippedPayroll: false,
    detectedFunctions: [],
    answers: {},
    queue: [],
    status: "in-progress",
    startedAt,
    updatedAt: startedAt,
  };
}

export function resolveAnswerLabel(
  question: OffshoringQuestion,
  value: AnswerValue,
  functions?: DetectedFunction[],
): string {
  if (value === null || value === undefined) return "";

  if (Array.isArray(value)) {
    return value
      .map((id) => {
        const fromQuestion = question.options?.find((option) => option.id === id)?.label;
        if (fromQuestion) return fromQuestion;
        return functions?.find((fn) => fn.id === id)?.label ?? id;
      })
      .join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (typeof value === "string") {
    const option = question.options?.find((entry) => entry.id === value);
    if (option) return option.label;
    return functions?.find((fn) => fn.id === value)?.label ?? value;
  }

  return String(value);
}

export function findClarification(
  question: OffshoringQuestion,
  value: AnswerValue,
  label: string,
): OffshoringClarificationRule | undefined {
  if (!question.clarifications?.length) return undefined;

  const text = label.toLowerCase();
  const optionIds = Array.isArray(value)
    ? value.map(String)
    : typeof value === "string"
      ? [value]
      : [];

  // Multi-select with only "none" should not trigger constraint follow-up.
  if (
    Array.isArray(value) &&
    value.length === 1 &&
    value[0] === "none"
  ) {
    return undefined;
  }

  return question.clarifications.find((rule) => {
    if (rule.whenOptionIds?.some((id) => optionIds.includes(id))) return true;
    if (rule.whenIncludes?.some((token) => text.includes(token.toLowerCase()))) {
      return true;
    }
    return false;
  });
}

export function getActiveClarification(
  session: OffshoringSession,
): OffshoringClarificationRule | undefined {
  if (!session.clarificationId || !session.currentQuestionId) return undefined;
  const question = getOffshoringQuestion(session.currentQuestionId);
  return question?.clarifications?.find((rule) => rule.id === session.clarificationId);
}

export function resolveQuestionForSession(
  session: OffshoringSession,
  questionId: string,
): OffshoringQuestion | undefined {
  const question = getOffshoringQuestion(questionId);
  if (!question) return undefined;

  if (questionId === "d1-q1-scope" && session.detectedFunctions.length > 0) {
    const count = session.detectedFunctions.length;
    return {
      ...question,
      question: `I mapped ${count} functions. Assess all of them, or narrow the scope?`,
    };
  }

  return question;
}

function appendQuestionMessage(
  messages: OffshoringChatMessage[],
  session: OffshoringSession,
  questionId: string,
): OffshoringChatMessage[] {
  const question = resolveQuestionForSession(session, questionId);
  if (!question) return messages;
  return [
    ...messages,
    createMessage("agent", "question", question.question, question.id),
  ];
}

function resolveSector(companyId?: string, companySector?: Sector): Sector {
  if (companySector) return companySector;
  if (companyId) {
    const company = getCompanyById(companyId);
    if (company) return company.sector;
  }
  return defaultSector();
}

function buildPreviewMessage(functions: DetectedFunction[]): string {
  return previewToText(buildPreviewSnapshot(functions));
}

function startDiscovery(
  session: OffshoringSession,
  extraMessages: OffshoringChatMessage[],
  dataTier: OffshoringDataTier,
): OffshoringSession {
  const sector = resolveSector(session.companyId, session.companySector);
  const detectedFunctions = seedFunctionsForSector(sector);
  const queue = buildFullDiscoveryQueue(dataTier);
  const first = queue[0];
  const withMeta: OffshoringSession = {
    ...session,
    dataTier,
    companySector: sector,
    detectedFunctions,
    skippedPayroll: dataTier === "C",
  };

  let messages = [...session.messages, ...extraMessages];
  if (first) {
    messages = appendQuestionMessage(messages, withMeta, first);
  }

  return {
    ...withMeta,
    phase: first ? phaseForQuestionId(first) : "complete",
    queue,
    currentQuestionId: first,
    messages,
    status: first ? "in-progress" : "complete",
    updatedAt: nowIso(),
  };
}

export function selectCompany(
  session: OffshoringSession,
  companyId: string,
  companyName: string,
): OffshoringSession {
  const company = getCompanyById(companyId);
  return {
    ...session,
    companyId,
    companyName,
    companySector: company?.sector ?? defaultSector(),
    phase: "payroll",
    messages: [
      ...session.messages,
      createMessage("user", "company-answer", companyName),
      createMessage("agent", "document-prompt", PAYROLL_PROMPT),
    ],
    updatedAt: nowIso(),
  };
}

export function persistPayrollFiles(
  session: OffshoringSession,
  files: UploadedFile[],
): OffshoringSession {
  return {
    ...session,
    files,
    updatedAt: nowIso(),
  };
}

export function submitPayroll(
  session: OffshoringSession,
  files: UploadedFile[],
): OffshoringSession {
  const names = files.map((file) => file.name).join(", ");
  const label = files.length === 1 ? names : `${files.length} files: ${names}`;

  return startDiscovery(
    { ...session, files, skippedPayroll: false },
    [
      createMessage("user", "document-answer", label),
      createMessage("agent", "system", AFTER_PAYROLL_COPY),
    ],
    "A",
  );
}

export function skipPayroll(session: OffshoringSession): OffshoringSession {
  return startDiscovery(
    { ...session, files: [], skippedPayroll: true },
    [
      createMessage("user", "document-answer", "Continue without a sheet"),
      createMessage("agent", "system", SKIP_PAYROLL_COPY),
    ],
    "C",
  );
}

export function submitAnswer(
  session: OffshoringSession,
  value: AnswerValue,
  options?: {
    confidence?: ConfidenceLevel;
    whoWouldKnow?: string;
    freeLabel?: string;
  },
): OffshoringSession {
  const questionId = session.currentQuestionId;
  if (!questionId) return session;

  const question = resolveQuestionForSession(session, questionId);
  if (!question) return session;

  const label =
    options?.freeLabel?.trim() ||
    resolveAnswerLabel(question, value, session.detectedFunctions);
  if (!label && question.required) return session;

  const answer: OffshoringAnswer = {
    value,
    label: label || "Skipped",
    confidence: options?.confidence,
    whoWouldKnow: options?.whoWouldKnow,
  };

  const answers = { ...session.answers, [questionId]: answer };
  let messages = [
    ...session.messages,
    createMessage("user", "answer", answer.label, questionId),
  ];

  const clarification = findClarification(question, value, answer.label);
  if (clarification && !session.answers[clarification.id]) {
    messages = [
      ...messages,
      createMessage("agent", "clarification", clarification.prompt, clarification.id),
    ];
    return {
      ...session,
      answers,
      clarificationId: clarification.id,
      messages,
      updatedAt: nowIso(),
    };
  }

  return advanceAfterAnswer({ ...session, answers, messages });
}

export function submitClarification(
  session: OffshoringSession,
  value: AnswerValue,
  freeLabel?: string,
): OffshoringSession {
  const clarificationId = session.clarificationId;
  if (!clarificationId) return session;

  const rule = getActiveClarification(session);
  const question = session.currentQuestionId
    ? resolveQuestionForSession(session, session.currentQuestionId)
    : undefined;

  const label =
    freeLabel?.trim() ||
    (question
      ? resolveAnswerLabel(
          {
            ...question,
            options: rule?.optionsFromFunctions
              ? session.detectedFunctions.map((fn) => ({ id: fn.id, label: fn.label }))
              : rule?.options ?? question.options,
          },
          value,
          session.detectedFunctions,
        )
      : String(value));

  if (!label) return session;

  const answers = {
    ...session.answers,
    [clarificationId]: { value, label },
  };

  const messages = [
    ...session.messages,
    createMessage("user", "answer", label, clarificationId),
  ];

  return advanceAfterAnswer({
    ...session,
    answers,
    messages,
    clarificationId: undefined,
  });
}

function advanceAfterAnswer(session: OffshoringSession): OffshoringSession {
  const questionId = session.currentQuestionId;
  if (!questionId) return session;

  const queue = session.queue.length
    ? session.queue
    : buildFullDiscoveryQueue(session.dataTier ?? (session.skippedPayroll ? "C" : "A"));

  const index = queue.indexOf(questionId);
  const next = index >= 0 ? queue[index + 1] : undefined;
  const remaining = index >= 0 ? queue.slice(index + 1) : queue.filter((id) => id !== questionId);

  // End of Round 2 → inject mock preview before Round 3
  const round2Last = ROUND_2_IDS[ROUND_2_IDS.length - 1];
  if (questionId === round2Last && next && ROUND_3_IDS.includes(next as (typeof ROUND_3_IDS)[number])) {
    const preview = buildPreviewMessage(session.detectedFunctions);
    let messages = [
      ...session.messages,
      createMessage("agent", "preview", preview),
    ];
    messages = appendQuestionMessage(messages, session, next);
    return {
      ...session,
      phase: "round3",
      queue: remaining,
      currentQuestionId: next,
      messages,
      updatedAt: nowIso(),
    };
  }

  // End of Round 1 → brief Round 2 intro
  const round1Queue = buildRound1Queue(session.dataTier ?? "A");
  const round1Last = round1Queue[round1Queue.length - 1];
  if (questionId === round1Last && next) {
    let messages = [
      ...session.messages,
      createMessage("agent", "system", ROUND_2_INTRO),
    ];
    messages = appendQuestionMessage(messages, session, next);
    return {
      ...session,
      phase: phaseForQuestionId(next),
      queue: remaining,
      currentQuestionId: next,
      messages,
      updatedAt: nowIso(),
    };
  }

  if (!next) {
    return {
      ...session,
      phase: "complete",
      queue: [],
      currentQuestionId: undefined,
      status: "complete",
      messages: [
        ...session.messages,
        createMessage("agent", "complete", COMPLETION_COPY),
      ],
      updatedAt: nowIso(),
    };
  }

  return {
    ...session,
    phase: phaseForQuestionId(next),
    queue: remaining,
    currentQuestionId: next,
    messages: appendQuestionMessage(session.messages, session, next),
    updatedAt: nowIso(),
  };
}

export function jumpToQuestion(
  session: OffshoringSession,
  questionId: string,
): OffshoringSession {
  const question = resolveQuestionForSession(session, questionId);
  if (!question) return session;

  const fullQueue = buildFullDiscoveryQueue(
    session.dataTier ?? (session.skippedPayroll ? "C" : "A"),
  );
  const index = fullQueue.indexOf(questionId);
  if (index < 0) return session;

  return {
    ...session,
    phase: phaseForQuestionId(questionId),
    queue: fullQueue.slice(index),
    currentQuestionId: questionId,
    clarificationId: undefined,
    messages: [
      ...session.messages,
      createMessage("agent", "system", "Let's revisit that answer."),
      createMessage("agent", "question", question.question, question.id),
    ],
    status: "in-progress",
    updatedAt: nowIso(),
  };
}

export function markProcessing(session: OffshoringSession): OffshoringSession {
  return {
    ...session,
    status: "processing",
    updatedAt: nowIso(),
  };
}

/**
 * Snapshot a finished assessment for the records archive.
 *
 * Pure — the caller persists it, matching how the chat components already own
 * writes. Chat messages are dropped: the report never reads them and they are
 * the bulk of the session's storage footprint.
 */
export function buildOffshoringRecord(
  session: OffshoringSession,
  companyName: string,
  sector: Sector,
): AssessmentRecord {
  const report = getMockOffshoringReport(companyName, sector);
  const completedAt = nowIso();

  return {
    id: createId("rec"),
    agent: "offshoring",
    title: "Workforce Sourcing Assessment",
    companyId: session.companyId,
    companyName,
    completedAt,
    summary: `${report.answerHeadlineValue} ${report.answerHeadlineRest}`,
    metrics: report.kpis
      .slice(0, 3)
      .map((kpi) => ({ label: kpi.label, value: kpi.value })),
    payload: {
      kind: "offshoring",
      session: { ...session, messages: [], status: "complete" },
      sector,
    },
  };
}

export function mockOffshoringTranscript(question: OffshoringQuestion): string {
  const samples: Record<string, string> = {
    "d1-q2-sector": "Education services, mid-hold — year three of the investment.",
    "d1-q3-addon": "We're folding in a 40-person enrollment add-on in Q4.",
    "d2-q1-per-function": "Support 35%, IT Apps 40%, Finance Ops 30%, Enrollment 40%.",
    "d2-q3-where": "FERPA on Enrollment and Support; client MSAs on IT Applications.",
    "d3-q1-adjust": "Support Center looks a touch high — drop a few Med to Low.",
    "d4-value-creation": "EBITDA about $8.2M, revenue $62M, exit multiple 11x.",
  };

  return (
    samples[question.id] ??
    `For ${question.question.replace(/\?$/, "")}, here is our current view.`
  );
}

export { VALUE_CREATION_ID };
