import { getSalesQuestion } from "@/data/sales";
import {
  buildCeoCloseQueue,
  buildMarketingQueue,
  buildPhase1Queue,
  buildPhase2Queue,
  hasMarketingOwner,
} from "@/lib/assessment/sales-routing";
import type {
  ChannelEntry,
  ChannelId,
  Classification,
  ConfidenceLevel,
  Respondent,
  SalesAnswer,
  SalesAssessmentSession,
} from "@/types/sales-assessment";

/**
 * Completed sales assessments for demo purposes.
 *
 * Not every PortCo appears here. Halden deliberately has no posture: it is the
 * portfolio's untouched company, so the product can be shown starting a
 * baseline from nothing rather than only re-opening finished ones.
 *
 * These are real `SalesAssessmentSession` objects, not hand-written reports:
 * they run through the same `buildSalesReport` the live chat uses, so every
 * figure, gap row and AI candidate is derived exactly as it would be from a
 * genuine interview. Change a posture here and the report changes with it.
 *
 * Each company gets a deliberately different shape — channel mix,
 * classification, and how much they actually measure — so a demo across the
 * portfolio shows four distinct diagnoses rather than one template.
 */

/** An answer as authored: option id (or free text), confidence, who-would-know. */
type Spec = string | [string, ConfidenceLevel] | [string, ConfidenceLevel, string];

interface CompanyPosture {
  companyId: string;
  companyName: string;
  respondents: { name: string; role: string }[];
  channels: Record<ChannelId, ChannelEntry["status"]>;
  dominant: ChannelId[];
  classification: Classification;
  /** Fallback option index for questions this posture does not name. */
  defaultOptionIndex: number;
  /** Confidence used for tagged questions with no explicit answer. */
  defaultConfidence: ConfidenceLevel;
  /** Who gets named when an answer is a guess or untracked. */
  whoBench: string[];
  answers: Record<string, Spec>;
  /** Days before "now" the assessment completed, for a plausible archive. */
  completedDaysAgo: number;
  handoffNotes?: { topic: string; quote: string; suggestedAgent: string }[];
}

function channelMap(
  channels: Record<ChannelId, ChannelEntry["status"]>,
  blockers: Partial<Record<ChannelId, ChannelEntry["blocker"]>> = {},
): ChannelEntry[] {
  return (Object.keys(channels) as ChannelId[]).map((channel) => ({
    channel,
    status: channels[channel],
    blocker: channels[channel] === "want" ? (blockers[channel] ?? "time") : undefined,
  }));
}

/** Resolves an authored spec into a stored answer, taking labels from the bank. */
function toAnswer(qid: string, spec: Spec, respondentId: string): SalesAnswer {
  const [raw, confidence, who] = Array.isArray(spec) ? spec : [spec, undefined, undefined];
  const question = getSalesQuestion(qid);
  const option = question?.options?.find((entry) => entry.id === raw);

  return {
    value: option ? option.id : raw,
    label: option ? option.label : raw,
    ...(confidence ? { confidence } : {}),
    ...(who ? { whoWouldKnow: who } : {}),
    respondentId,
  };
}

const POSTURES: CompanyPosture[] = [
  // ── Pipeline-driven, well instrumented. The "good" baseline. ─────────────
  {
    companyId: "profit-optics",
    companyName: "Profit Optics",
    respondents: [
      { name: "Dana Whitfield", role: "CEO" },
      { name: "Marcus Reed", role: "VP Sales" },
    ],
    channels: {
      field: "not-using",
      inside: "using",
      rfp: "using",
      referrals: "using",
      events: "want",
      linkedin: "using",
      content: "using",
      paid: "not-using",
      marketplaces: "not-using",
      expansion: "using",
    },
    dominant: ["rfp", "inside"],
    classification: "pipeline-driven",
    defaultOptionIndex: 0,
    defaultConfidence: "E",
    whoBench: ["Marcus Reed, VP Sales", "Priya Nair, Sales Ops"],
    completedDaysAgo: 6,
    answers: {
      B1a: "analytics and revenue-operations services for distribution businesses",
      B1b: "mid-market",
      B1c: "different",
      B2a: ["100k-500k", "A"],
      B2b: ["Smallest was $60k, largest $1.4m", "A"],
      B3: ["3-6m", "A"],
      B4a: ["25m-50m", "A"],
      B4b: ["25m-50m", "A"],
      B4c: "$46m, up about 14%.",
      E1: "mixed",
      E2: "dedicated",
      E3a: "portals",
      E3b: "Two Sales Ops analysts sweep four portals every morning.",
      E4a: "sales-team",
      E4b: "yes-dedicated",
      E5: "yes",
      E6: ["10-25", "E"],
      T1: ["6-15", "A"],
      T2: ["proposals", "G", "Priya Nair, Sales Ops"],
      T3a: "full-stack",
      T3b: "unofficial",
      T4: "capacity",
      L1: "team",
      L2: "several",
      L3a: "conversion",
      L3b: "The board asked for a coverage plan before the next raise.",
      "CH2:events": "time",
      "M-RFP.1a": ["25-75", "A"],
      "M-RFP.1b": ["double", "G", "Priya Nair, Sales Ops"],
      "M-RFP.2a": ["some", "A"],
      "M-RFP.2b": ["one-two", "A"],
      "M-RFP.3": "formal-early",
      "M-RFP.4a": ["20-50", "A"],
      "M-RFP.4b": ["5-10", "A"],
      "M-RFP.5a": ["mostly-reused", "G", "Priya Nair, Sales Ops"],
      "M-RFP.5b": "searchable",
      "M-RFP.6a": ["15-40", "A"],
      "M-RFP.6b": ["decided", "A"],
      "M-RFP.6c": "structured",
      "M-RFP.7a": ["light", "G", "Marcus Reed, VP Sales"],
      "M-RFP.7b": ["weeks", "E"],
      "M-OUT.1": "A three-person SDR pod, LinkedIn plus email, about 250 attempts a week.",
      "M-OUT.2": ["4 in 100 become a real conversation", "A"],
      "M-OUT.3": "The rep sets a task and the sequence re-enters them next quarter.",
      "M-OUT.4": ["Under two hours in business hours", "A"],
      "M-OUT.5": "Case studies and a scoped pilot plan, from a shared library.",
      "CAP.1": "Two delivery leads spend about a day a week on pursuits.",
      "CAP.2": ["About 20% more delivery without hiring", "G", "Marcus Reed, VP Sales"],
      S1: "CRM and the outreach tool daily; the proposal tool is paid for and ignored.",
      S2: "Pricing history still lives in a Sales Ops spreadsheet.",
      S3: "unofficial",
      S4: "First-draft RFP responses.",
      MK1: "Content, SEO and a monthly webinar.",
      MK2: "We can trace two closed deals to the webinar series.",
      MK3a: ["20-50", "A"],
      MK3b: "routed",
      MK4: "pipeline",
      MK5a: "yes",
      MK5b: "Vertical-specific proof points for distribution.",
      MK6: ["20k-50k", "A"],
      X1: "Delivery would break first — we'd need six more consultants.",
      X2: "Comfortable for drafts with a human approving before it goes out.",
      X3: "Marcus champions it; two senior consultants will resist.",
      X4: "Cut proposal turnaround in half.",
    },
  },

  // ── Relationship-driven, barely instrumented. The "hard" case. ───────────
  {
    companyId: "behaviour-framework",
    companyName: "Behaviour Framework",
    respondents: [{ name: "Dr. Alan Reyes", role: "CEO / Founder" }],
    channels: {
      field: "using",
      inside: "not-using",
      rfp: "using",
      referrals: "using",
      events: "using",
      linkedin: "want",
      content: "want",
      paid: "not-using",
      marketplaces: "not-using",
      expansion: "using",
    },
    dominant: ["referrals", "field"],
    classification: "relationship-driven",
    defaultOptionIndex: 2,
    defaultConfidence: "G",
    whoBench: ["Marianne Cole, Practice Director", "Marianne Cole, Practice Director"],
    completedDaysAgo: 13,
    handoffNotes: [
      {
        topic: "Clinician recruitment is the real growth constraint",
        quote: "We turn away referrals because we cannot staff them.",
        suggestedAgent: "Offshoring / workforce",
      },
    ],
    answers: {
      B1a: "behavioral health services delivered through clinic and in-home programs",
      B1b: "mixed",
      B1c: "same",
      B2a: ["25k-100k", "G", "Marianne Cole, Practice Director"],
      B2b: ["No idea honestly — payer contracts vary", "N", "Marianne Cole, Practice Director"],
      B3: ["6-12m", "G", "Marianne Cole, Practice Director"],
      B4a: ["50m-100m", "E"],
      B4b: ["50m-100m", "G"],
      B4c: "We want $70m but it depends entirely on hiring.",
      E1: "referrals",
      E2: "just-comes",
      E3a: "clients",
      E3b: "Nobody watches them. We hear from payers when it is nearly closed.",
      E4a: "founder",
      E4b: "no",
      E5: "no-crm",
      E6: ["over-50", "G", "Marianne Cole, Practice Director"],
      T1: ["none", "E"],
      T2: ["delivery", "G", "Marianne Cole, Practice Director"],
      T3a: "office",
      T3b: "no",
      T4: "several",
      L1: "both",
      L2: "fizzled",
      L3a: "dependence",
      L3b: "Renovus asked how we would double without me in every deal.",
      "CH2:linkedin": "skill",
      "CH2:content": "time",
      "M-REL.1":
        "Three of the last four came through Dr. Reyes personally; one from a payer introduction.",
      "M-REL.2": "In people's heads, mostly mine. Be blunt — nothing is written down.",
      "M-REL.3a": "never",
      "M-REL.3b": "client-asks",
      "M-REL.4a": "at-risk",
      "M-REL.4b": "no",
      "M-REL.5": "never",
      "M-FLD.1": ["About eight conferences a year, maybe $18k each", "G"],
      "M-FLD.2": ["Contacts, nothing traceable", "N", "Marianne Cole, Practice Director"],
      "M-FLD.3": "They sit in someone's bag until the next event.",
      "M-RFP.1a": ["under-10", "G", "Marianne Cole, Practice Director"],
      "M-RFP.1b": ["unknown", "N", "Marianne Cole, Practice Director"],
      "M-RFP.4a": ["50-100", "G"],
      "M-RFP.6a": ["under-5", "G"],
      "CAP.1": "Clinical directors are pulled into every payer conversation.",
      "CAP.2": ["Almost none without hiring clinicians", "G", "Marianne Cole, Practice Director"],
      S1: "Email and a shared drive. That is the system.",
      S2: "Everything. Payer terms, referral history, all of it in inboxes.",
      S3: "no",
      S4: "Chasing payer paperwork.",
      X1: "Hiring breaks first, then quality.",
      X2: "Not for anything a family sees. Internal drafts, maybe.",
      X3: "I would champion it. The clinical directors will resist hard.",
      X4: "Get referrals off my desk and into a process.",
    },
  },

  // ── Mixed, mid-instrumented, outbound-curious. ───────────────────────────
  {
    companyId: "gtm",
    companyName: "GTM",
    respondents: [
      { name: "Sasha Boone", role: "Managing Partner" },
      { name: "Ellis Tran", role: "Head of Growth" },
    ],
    channels: {
      field: "not-using",
      inside: "using",
      rfp: "not-using",
      referrals: "using",
      events: "using",
      linkedin: "using",
      content: "using",
      paid: "want",
      marketplaces: "not-using",
      expansion: "using",
    },
    dominant: ["referrals", "inside"],
    classification: "mixed",
    defaultOptionIndex: 1,
    defaultConfidence: "E",
    whoBench: ["Ellis Tran, Head of Growth", "Ellis Tran, Head of Growth"],
    completedDaysAgo: 2,
    answers: {
      B1a: "go-to-market strategy and revenue-operations consulting",
      B1b: "mid-market",
      B1c: "same",
      B2a: ["25k-100k", "A"],
      B2b: ["$30k to about $240k", "E"],
      B3: ["1-3m", "E"],
      B4a: ["25m-50m", "A"],
      B4b: ["5m-25m", "A"],
      B4c: "$34m — a stretch, but the pipeline supports it.",
      E1: "mixed",
      E2: "part-time",
      E3a: "none",
      E3b: "Nobody — we do not chase formal tenders.",
      E4a: "delivery-leads",
      E4b: "partly",
      E5: "exists-but-no",
      E6: ["25-50", "G", "Ellis Tran, Head of Growth"],
      T1: ["3-5", "A"],
      T2: ["even", "E"],
      T3a: "crm-plus-marketing",
      T3b: "official",
      T4: "know-how",
      L1: "none",
      L2: "one",
      L3a: "visibility",
      L3b: "We are about to add two partners and want the motion documented first.",
      "CH2:paid": "dont-believe",
      "M-OUT.1": "Two partners plus Ellis, LinkedIn and warm email, maybe 80 attempts a week.",
      "M-OUT.2": ["Roughly 9 in 100", "G", "Ellis Tran, Head of Growth"],
      "M-OUT.3": "Ellis keeps a note. Honestly, most of them we never revisit.",
      "M-OUT.4": ["Same day, though Friday ones slip to Monday", "E"],
      "M-OUT.5": "A tailored teardown deck, rebuilt each time.",
      "M-REL.1": "Two of the last three were partner referrals; one came from a conference talk.",
      "M-REL.2": "Split — the CRM has names, the context is in partner inboxes.",
      "M-REL.3a": "loose",
      "M-REL.3b": "partner-spots",
      "M-REL.4a": "team-steps-in",
      "M-REL.4b": "person",
      "M-REL.5": "sometimes",
      "CAP.1": "Every partner sells between engagements; roughly a third of their week.",
      "CAP.2": ["Maybe 30% more before we would need to hire", "G", "Sasha Boone, Managing Partner"],
      S1: "CRM daily. The proposal tool nobody opens.",
      S2: "Deal context and pricing precedent sit in partner inboxes.",
      S3: "official",
      S4: "Building the first-pass teardown deck.",
      MK1: "LinkedIn content, a newsletter, and two conference talks a quarter.",
      MK2: "The newsletter traced to one closed deal last year.",
      MK3a: ["5-20", "G", "Ellis Tran, Head of Growth"],
      MK3b: "inbox",
      MK4: "activity",
      MK5a: "rebuild",
      MK5b: "Sector-specific benchmarks they can quote in a pitch.",
      MK6: ["under-5k", "N", "Ellis Tran, Head of Growth"],
      X1: "Quality — we would be staffing engagements with people who have not been trained.",
      X2: "Fine for research and drafts. Client-facing needs a partner's name on it.",
      X3: "Ellis champions it. The founding partners will want proof.",
      X4: "Know which motion actually produces revenue.",
    },
  },

];

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildSession(posture: CompanyPosture): SalesAssessmentSession {
  const respondents: Respondent[] = posture.respondents.map((person, index) => ({
    id: `resp-${posture.companyId}-${index + 1}`,
    name: person.name,
    role: person.role,
    sessionKey: index === 0 ? "phase1" : "deepdive",
  }));
  const ceoId = respondents[0].id;
  const deepDiveId = respondents[1]?.id ?? ceoId;

  const map = { entries: channelMap(posture.channels), dominant: posture.dominant };

  // The same queue the live chat would have walked, so nothing is missing and
  // nothing is answered that this company would never have been asked.
  const queue = [
    ...buildPhase1Queue().filter((id) => id !== "CH2"),
    ...map.entries.filter((e) => e.status === "want").map((e) => `CH2:${e.channel}`),
    ...buildPhase2Queue(map, posture.classification),
  ];

  const answers: Record<string, SalesAnswer> = {};
  const whoRegistry: Record<string, string[]> = {};
  let whoIndex = 0;

  const record = (qid: string, spec: Spec, respondentId: string) => {
    const answer = toAnswer(qid, spec, respondentId);
    answers[qid] = answer;
    if (answer.whoWouldKnow) {
      const bucket = whoRegistry[answer.whoWouldKnow] ?? [];
      if (!bucket.includes(qid)) bucket.push(qid);
      whoRegistry[answer.whoWouldKnow] = bucket;
    }
  };

  for (const qid of queue) {
    const question = getSalesQuestion(qid);
    if (!question || question.type === "channel-matrix") continue;

    const respondentId = question.sessionKey === "phase1" ? ceoId : deepDiveId;
    const explicit = posture.answers[qid];

    if (explicit !== undefined) {
      record(qid, explicit, respondentId);
      continue;
    }

    // Not authored: fall back to this posture's default stance so the report's
    // counts and instrumentation share reflect a genuinely complete interview.
    const options = question.options ?? [];
    const value = options.length
      ? options[Math.min(posture.defaultOptionIndex, options.length - 1)].id
      : "Not tracked in any system.";
    const needsTag = question.asksConfidence;
    const tag = needsTag ? posture.defaultConfidence : undefined;
    const who =
      tag && ["G", "N", "X"].includes(tag)
        ? posture.whoBench[whoIndex++ % posture.whoBench.length]
        : undefined;

    record(
      qid,
      tag ? (who ? [value, tag, who] : [value, tag]) : value,
      respondentId,
    );
  }

  // CH1b records the dominant pair the same way the chat would.
  answers["CH1b"] = {
    value: posture.dominant,
    label: posture.dominant.join(", "),
    respondentId: ceoId,
  };

  if (hasMarketingOwner(answers)) {
    for (const qid of buildMarketingQueue()) {
      if (answers[qid]) continue;
      const question = getSalesQuestion(qid);
      if (!question) continue;
      const explicit = posture.answers[qid];
      record(qid, explicit ?? (question.options?.[0]?.id ?? "Not tracked."), deepDiveId);
    }
  }

  for (const qid of buildCeoCloseQueue()) {
    const explicit = posture.answers[qid];
    if (explicit === undefined) continue;
    record(qid, explicit, ceoId);
  }

  // A name that comes up against two or more questions becomes an interview ask.
  const interviewRequests = Object.entries(whoRegistry)
    .filter(([, qids]) => qids.length >= 2)
    .map(([person, qids], index) => ({
      id: `int-${posture.companyId}-${index + 1}`,
      personOrRole: person,
      questionIds: qids,
      reason: `Named as the source for ${qids.length} unmeasured answers.`,
      status: "requested" as const,
    }));

  const completedAt = isoDaysAgo(posture.completedDaysAgo);

  return {
    id: `sales-demo-${posture.companyId}`,
    companyId: posture.companyId,
    companyName: posture.companyName,
    departmentId: "sales",
    phase: "complete",
    activeSession: "ceo-close",
    respondents,
    channelMap: map,
    wantedSegments: [],
    classification: posture.classification,
    gate: { status: "accepted", corrections: [], acceptedAt: completedAt },
    answers,
    followUpsUsed: {},
    whoRegistry,
    interviewRequests,
    handoffNotes: (posture.handoffNotes ?? []).map((note, index) => ({
      id: `ho-${posture.companyId}-${index + 1}`,
      ...note,
    })),
    timings: [],
    messages: [],
    queue: [],
    status: "complete",
    startedAt: isoDaysAgo(posture.completedDaysAgo + 1),
    updatedAt: completedAt,
    qbankVersion: "v4",
  };
}

export const DEMO_SALES_SESSIONS: {
  session: SalesAssessmentSession;
  completedAt: string;
}[] = POSTURES.map((posture) => ({
  session: buildSession(posture),
  completedAt: isoDaysAgo(posture.completedDaysAgo),
}));
