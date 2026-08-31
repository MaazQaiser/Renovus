import { CHANNELS, CONFIDENCE_QIDS, getSalesQuestion } from "@/data/sales";
import { AI_CANDIDATES } from "@/data/sales/aiCandidates";
import type {
  ChannelStatus,
  ConfidenceLevel,
  SalesAnswer,
  SalesAssessmentSession,
} from "@/types/sales-assessment";
import { UNMEASURED_CONFIDENCE } from "@/types/sales-assessment";
import { classificationLabel } from "./sales-routing";
import { createId } from "@/lib/id";
import type { AssessmentRecord } from "@/types/record";

/**
 * Derives the Parts A–F baseline report from a session.
 *
 * Everything here is composed from answers the respondent actually gave — no
 * figure is invented. Where a number can't be parsed the row is dropped and an
 * entry is added to Part D instead of guessing.
 */

const STATUS_LABEL: Record<ChannelStatus, string> = {
  using: "Using",
  "not-using": "Not using",
  want: "Want to use",
};

const CONFIDENCE_MEANING: Record<ConfidenceLevel, string> = {
  A: "Taken from a system or record.",
  E: "Estimated, believed accurate within about 20%.",
  G: "Directional only — treat as a hypothesis.",
  N: "Nobody tracks this today.",
  X: "Recorded somewhere, but not extractable this week.",
};

export interface SnapshotLine {
  label: string;
  value: string;
}

export interface SnapshotChannelRow {
  channel: string;
  status: string;
  blocker?: string;
}

export interface InterimSnapshot {
  lines: SnapshotLine[];
  channels: SnapshotChannelRow[];
}

export interface KeyNumberRow {
  index: number;
  metric: string;
  value: string;
  confidence?: ConfidenceLevel;
  who?: string;
  sourceQid: string;
}

export interface GapRow {
  channel: string;
  today: string;
  gap: string;
  evidence: string;
}

export interface PersonRow {
  name: string;
  appearsAs: string;
  interviewed: string;
}

export interface ConfidenceRow {
  confidence: ConfidenceLevel;
  count: number;
  share: string;
  meaning: string;
}

export interface OpportunityRow {
  index: number;
  opportunity: string;
  evidence: string;
  fixType: "Quick win" | "Process change" | "AI initiative";
  firstStep: string;
}

export interface AiCandidateRow {
  candidate: string;
  trigger: string;
  selected: boolean;
  evidence: string;
}

export interface PortfolioRow {
  dimension: string;
  thisCompany: string;
  portfolioPosition: string;
}

export interface AnswerLogRow {
  qid: string;
  question: string;
  respondent: string;
  answer: string;
  confidence?: ConfidenceLevel;
  who?: string;
}

export interface SalesReportData {
  meta: {
    companyName: string;
    date: string;
    preparedBy: string;
    confidentiality: string;
    qbankVersion: string;
    respondents: { name: string; role: string; session: string }[];
  };
  partA: InterimSnapshot;
  partB: {
    execSummary: string[];
    engineNarrative: string[];
    gaps: GapRow[];
    keyNumbers: KeyNumberRow[];
    channelMap: SnapshotChannelRow[];
    bet?: string;
    people: PersonRow[];
  };
  partC: {
    rows: ConfidenceRow[];
    measuredPct: number;
    taggedCount: number;
    verdict: string;
  };
  partD: string[];
  partE: {
    opportunities: OpportunityRow[];
    candidates: AiCandidateRow[];
    readinessNote: string;
  };
  partF: {
    rows: PortfolioRow[];
    note: string;
  };
  appendixA: AnswerLogRow[];
  appendixB: { topic: string; quote: string; suggestedAgent: string }[];
}

function answerText(session: SalesAssessmentSession, qid: string): string | undefined {
  const label = session.answers[qid]?.label?.trim();
  return label ? label : undefined;
}

function shortQuestion(qid: string): string {
  const text = getSalesQuestion(qid)?.question ?? qid;
  const firstSentence = text.split(/[?.]/)[0];
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 70)}…` : firstSentence;
}

// ── Part A ─────────────────────────────────────────────────────────────────

export function buildInterimSnapshot(session: SalesAssessmentSession): InterimSnapshot {
  const lines: SnapshotLine[] = [];
  const add = (label: string, qid: string) => {
    const value = answerText(session, qid);
    if (value) lines.push({ label, value });
  };

  if (session.companyName) lines.push({ label: "Company", value: session.companyName });
  add("What they sell", "B1a");
  add("Who buys it", "B1b");
  add("Average deal size", "B2a");
  add("Closing time", "B3");
  add("Revenue", "B4a");
  add("Target", "B4c");
  add("How clients are found", "E1");
  add("Who originates", "E4a");
  add("CRM", "E5");
  add("Key-person risk", "E6");
  add("Who sells", "T1");
  add("Where time goes", "T2");
  add("The binding limit", "L1");

  const classification = session.classificationOverride ?? session.classification;
  if (classification) {
    lines.push({ label: "Classification", value: classificationLabel(classification) });
  }

  return { lines, channels: channelRows(session) };
}

function channelRows(session: SalesAssessmentSession): SnapshotChannelRow[] {
  if (!session.channelMap) return [];
  return session.channelMap.entries
    .filter((entry) => entry.status !== "not-using")
    .map((entry) => {
      const label = CHANNELS.find((c) => c.id === entry.channel)?.label ?? entry.channel;
      const blocker = answerText(session, `CH2:${entry.channel}`);
      const dominant = session.channelMap?.dominant.includes(entry.channel);
      return {
        channel: dominant ? `${label} (dominant)` : label,
        status: STATUS_LABEL[entry.status],
        blocker: entry.status === "want" ? blocker : undefined,
      };
    });
}

// ── Part C ─────────────────────────────────────────────────────────────────

export function measuredShare(answers: Record<string, SalesAnswer>): {
  counts: Record<ConfidenceLevel, number>;
  tagged: number;
  pct: number;
} {
  const counts: Record<ConfidenceLevel, number> = { A: 0, E: 0, G: 0, N: 0, X: 0 };
  let tagged = 0;

  for (const answer of Object.values(answers)) {
    if (!answer.confidence) continue;
    counts[answer.confidence] += 1;
    tagged += 1;
  }

  const pct = tagged === 0 ? 0 : Math.round(((counts.A + counts.E) / tagged) * 100);
  return { counts, tagged, pct };
}

const LOW_MEASURE_VERDICT =
  "Below 40% measured, the cost side of any business case must be built by observation rather than taken from this assessment.";

// ── Report ─────────────────────────────────────────────────────────────────

export function buildSalesReport(
  session: SalesAssessmentSession,
  options: { assessedCompanyCount?: number } = {},
): SalesReportData {
  const companyName = session.companyName ?? "the company";
  const { counts, tagged, pct } = measuredShare(session.answers);

  const keyNumbers: KeyNumberRow[] = CONFIDENCE_QIDS.filter(
    (qid) => session.answers[qid],
  ).map((qid, index) => {
    const answer = session.answers[qid];
    return {
      index: index + 1,
      metric: shortQuestion(qid),
      value: answer.label,
      confidence: answer.confidence,
      who:
        answer.confidence && UNMEASURED_CONFIDENCE.includes(answer.confidence)
          ? answer.whoWouldKnow
          : undefined,
      sourceQid: qid,
    };
  });

  return {
    meta: {
      companyName,
      date: new Date(session.updatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      preparedBy: "Renovus Capital · Portfolio Operations",
      confidentiality: "Confidential — Renovus Capital internal (IC / operating review)",
      qbankVersion: session.qbankVersion,
      respondents: session.respondents.map((respondent) => ({
        name: respondent.name,
        role: respondent.role,
        session: respondent.sessionKey,
      })),
    },
    partA: buildInterimSnapshot(session),
    partB: {
      execSummary: buildExecSummary(session, pct),
      engineNarrative: buildEngineNarrative(session),
      gaps: buildGaps(session),
      keyNumbers,
      channelMap: channelRows(session),
      bet: answerText(session, "CH4"),
      people: buildPeople(session),
    },
    partC: {
      rows: (Object.keys(counts) as ConfidenceLevel[]).map((level) => ({
        confidence: level,
        count: counts[level],
        share: tagged === 0 ? "—" : `${Math.round((counts[level] / tagged) * 100)}%`,
        meaning: CONFIDENCE_MEANING[level],
      })),
      measuredPct: pct,
      taggedCount: tagged,
      verdict:
        tagged === 0
          ? "No quantitative answers were tagged, so there is no instrumentation read yet."
          : pct < 40
            ? LOW_MEASURE_VERDICT
            : `${pct}% of quantitative answers are actuals or estimates — enough to model on, with the guesses flagged below.`,
    },
    partD: buildOpenQuestions(session),
    partE: buildOpportunities(session),
    partF: buildPortfolio(session, options.assessedCompanyCount ?? 0),
    appendixA: buildAnswerLog(session),
    appendixB: session.handoffNotes.map((note) => ({
      topic: note.topic,
      quote: note.quote,
      suggestedAgent: note.suggestedAgent,
    })),
  };
}

// ── Narrative (composed from answers, never invented) ──────────────────────

function buildExecSummary(session: SalesAssessmentSession, pct: number): string[] {
  const company = session.companyName ?? "The company";
  const classification = session.classificationOverride ?? session.classification;
  const out: string[] = [];

  const b1 = answerText(session, "B1a");
  const b4 = answerText(session, "B4a");
  if (b1) out.push(`${company} sells ${lower(b1)}${b4 ? `, on revenue of ${lower(b4)}` : ""}.`);

  if (classification) {
    const e4 = answerText(session, "E4a");
    out.push(
      `On the evidence this is a ${classificationLabel(classification).toLowerCase()} business${e4 ? `, with new business originated by ${lower(e4)}` : ""}.`,
    );
  }

  const using = session.channelMap?.entries.filter((e) => e.status === "using") ?? [];
  if (using.length) {
    const labels = using
      .map((entry) => CHANNELS.find((c) => c.id === entry.channel)?.label ?? entry.channel)
      .join(", ");
    out.push(`Business comes in through ${labels}.`);
  }

  const e6 = answerText(session, "E6");
  if (e6) out.push(`Key-person exposure: ${lower(e6)}.`);

  const l1 = answerText(session, "L1");
  if (l1) out.push(`The binding constraint named by the respondent is ${lower(l1)}.`);

  out.push(
    pct < 40
      ? `Only ${pct}% of the quantitative answers are measured, so the numbers here are directional and the cost case needs observation first.`
      : `${pct}% of the quantitative answers are measured, so the baseline is solid enough to plan against.`,
  );

  return out;
}

function buildEngineNarrative(session: SalesAssessmentSession): string[] {
  const out: string[] = [];
  for (const [label, qid] of [
    ["Lead generation", "E2"],
    ["RFP discovery", "E3a"],
    ["CRM", "E5"],
    ["Who sells", "T1"],
    ["Where time goes", "T2"],
  ] as const) {
    const value = answerText(session, qid);
    if (value) out.push(`${label}: ${value}`);
  }
  return out;
}

function buildGaps(session: SalesAssessmentSession): GapRow[] {
  const rows: GapRow[] = [];

  for (const entry of session.channelMap?.entries ?? []) {
    if (entry.status !== "using") continue;
    const channel = CHANNELS.find((c) => c.id === entry.channel);
    if (!channel) continue;

    // Evidence comes from that channel's module answers, if any ran.
    const moduleAnswers = Object.entries(session.answers).filter(
      ([qid]) => channel.module && qid.startsWith(channel.module),
    );
    if (moduleAnswers.length === 0) continue;

    const [firstQid, firstAnswer] = moduleAnswers[0];
    const unmeasured = moduleAnswers.filter(
      ([, answer]) =>
        answer.confidence && UNMEASURED_CONFIDENCE.includes(answer.confidence),
    );

    rows.push({
      channel: channel.label,
      today: firstAnswer.label,
      gap: unmeasured.length
        ? `${unmeasured.length} of ${moduleAnswers.length} answers here are unmeasured.`
        : "Measured, but no owner named for the numbers.",
      evidence: `${firstQid} — ${firstAnswer.label}`,
    });
  }

  // The spec requires the time-allocation and capacity rows regardless.
  const t2 = answerText(session, "T2");
  if (t2) {
    rows.push({
      channel: "Time allocation",
      today: t2,
      gap: "Selling time is what every automation candidate is sized against.",
      evidence: `T2 — ${t2}`,
    });
  }
  const cap2 = answerText(session, "CAP.2");
  if (cap2) {
    rows.push({
      channel: "Capacity",
      today: cap2,
      gap: "The stated ceiling has not been verified against throughput.",
      evidence: `CAP.2 — ${cap2}`,
    });
  }

  return rows;
}

function buildPeople(session: SalesAssessmentSession): PersonRow[] {
  const rows: PersonRow[] = session.respondents.map((respondent) => ({
    name: `${respondent.name} · ${respondent.role}`,
    appearsAs: "Respondent",
    interviewed: "Yes",
  }));

  for (const [name, qids] of Object.entries(session.whoRegistry)) {
    const request = session.interviewRequests.find((r) => r.personOrRole === name);
    rows.push({
      name,
      appearsAs: `Named as the source for ${qids.join(", ")}`,
      interviewed: request ? "Requested" : "Pending",
    });
  }

  return rows;
}

function buildOpenQuestions(session: SalesAssessmentSession): string[] {
  const out: string[] = [];

  for (const [qid, answer] of Object.entries(session.answers)) {
    if (answer.confidence === "X") {
      out.push(
        `${qid} — ${shortQuestion(qid)}: recorded but not extractable${answer.whoWouldKnow ? `; ${answer.whoWouldKnow} holds it` : ""}.`,
      );
    }
    if (answer.confidence === "N") {
      out.push(`${qid} — ${shortQuestion(qid)}: not tracked today.`);
    }
  }

  for (const request of session.interviewRequests) {
    out.push(
      `Interview requested with ${request.personOrRole} — ${request.reason} (${request.status}).`,
    );
  }

  for (const correction of session.gate?.corrections ?? []) {
    out.push(`Correction recorded at the Phase 1 gate: ${correction}`);
  }

  for (const segment of session.wantedSegments) {
    out.push(`Wanted segment not yet tested: ${segment.label}.`);
  }

  return out;
}

function buildOpportunities(session: SalesAssessmentSession): SalesReportData["partE"] {
  const opportunities: OpportunityRow[] = [];

  for (const entry of session.channelMap?.entries ?? []) {
    if (entry.status !== "want") continue;
    const channel = CHANNELS.find((c) => c.id === entry.channel);
    const blocker = answerText(session, `CH2:${entry.channel}`);
    if (!channel) continue;

    opportunities.push({
      index: opportunities.length + 1,
      opportunity: `Open ${channel.label}`,
      evidence: `CH1 — wanted but unused${blocker ? `; blocked on ${lower(blocker)}` : ""}`,
      fixType: blocker && /time|admin/i.test(blocker) ? "AI initiative" : "Process change",
      firstStep: blocker && /tried/i.test(blocker)
        ? "Review what the previous attempt looked like before committing again."
        : `Scope a time-boxed test of ${lower(channel.label)}.`,
    });
  }

  const e5 = session.answers["E5"]?.value;
  if (e5 === "no-crm" || e5 === "exists-not-read") {
    opportunities.push({
      index: opportunities.length + 1,
      opportunity: "Instrument the pipeline before optimising it",
      evidence: `E5 — ${answerText(session, "E5") ?? "no CRM anyone reads"}`,
      fixType: "Process change",
      firstStep: "Agree the five fields every opportunity must carry, and who owns them.",
    });
  }

  const candidates: AiCandidateRow[] = AI_CANDIDATES.map((candidate) => {
    const hit = candidate.triggers.find((trigger) => trigger(session));
    return {
      candidate: candidate.label,
      trigger: candidate.triggerText,
      selected: Boolean(hit),
      evidence: hit ? hit(session) || "" : "",
    };
  });

  const { pct } = measuredShare(session.answers);
  return {
    opportunities,
    candidates,
    readinessNote:
      pct < 40
        ? "Readiness is low: with most numbers unmeasured, any AI candidate should start with instrumentation rather than automation."
        : "Readiness is workable: the measured base is good enough to size the selected candidates.",
  };
}

const PORTFOLIO_DIMENSIONS = [
  "Deal size",
  "Cycle length",
  "Channel breadth",
  "Instrumentation",
  "Key-person concentration",
  "Selling capacity",
] as const;

function buildPortfolio(
  session: SalesAssessmentSession,
  assessedCompanyCount: number,
): SalesReportData["partF"] {
  const values: Record<(typeof PORTFOLIO_DIMENSIONS)[number], string | undefined> = {
    "Deal size": answerText(session, "B2a"),
    "Cycle length": answerText(session, "B3"),
    "Channel breadth": session.channelMap
      ? `${session.channelMap.entries.filter((e) => e.status === "using").length} of 10 channels in use`
      : undefined,
    Instrumentation: `${measuredShare(session.answers).pct}% measured`,
    "Key-person concentration": answerText(session, "E6"),
    "Selling capacity": answerText(session, "T1"),
  };

  const benchmarked = assessedCompanyCount >= 3;
  return {
    rows: PORTFOLIO_DIMENSIONS.map((dimension) => ({
      dimension,
      thisCompany: values[dimension] ?? "Not captured",
      portfolioPosition: benchmarked
        ? `Compared across ${assessedCompanyCount} assessed companies`
        : "—",
    })),
    note: benchmarked
      ? `Positions are relative to the ${assessedCompanyCount} portfolio companies assessed so far.`
      : "Among the first companies assessed — the benchmark builds as the portfolio completes.",
  };
}

function buildAnswerLog(session: SalesAssessmentSession): AnswerLogRow[] {
  return Object.entries(session.answers).map(([qid, answer]) => {
    const respondent = session.respondents.find((r) => r.id === answer.respondentId);
    return {
      qid,
      question: shortQuestion(qid),
      respondent: respondent ? `${respondent.name} · ${respondent.role}` : "—",
      answer: answer.label,
      confidence: answer.confidence,
      who: answer.whoWouldKnow,
    };
  });
}

function lower(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/**
 * Snapshot a finished assessment for the records archive. Pure — the caller
 * persists it. The derived report is stored rather than the raw transcript, so
 * a reopened record renders identically without carrying the whole chat log.
 */
export function buildSalesRecord(
  session: SalesAssessmentSession,
  report: SalesReportData,
): AssessmentRecord {
  return {
    id: createId("rec"),
    agent: "sales",
    title: "Sales Baseline Report",
    companyId: session.companyId,
    companyName: report.meta.companyName,
    completedAt: new Date().toISOString(),
    summary: report.partB.execSummary[0] ?? "Sales baseline captured.",
    metrics: [
      { label: "Measured", value: `${report.partC.measuredPct}%` },
      { label: "Answers", value: String(report.appendixA.length) },
      {
        label: "AI candidates",
        value: String(report.partE.candidates.filter((c) => c.selected).length),
      },
    ],
    payload: { kind: "sales", report },
  };
}
