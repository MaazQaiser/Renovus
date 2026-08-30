import {
  buildFullDiscoveryQueue,
  getOffshoringQuestion,
  phaseForQuestionId,
} from "@/data/offshoringQuestions";
import {
  statusFor,
  summarize,
  type CaptureItem,
  type CaptureProgress,
  type CaptureSection,
} from "@/lib/interview/capture";
import type { OffshoringSession } from "@/types/offshoring";

type CaptureSectionId =
  | "company"
  | "payroll"
  | "round-1"
  | "round-2"
  | "round-3"
  | "value-creation";

const SECTION_LABELS: Record<CaptureSectionId, string> = {
  company: "Company",
  payroll: "Payroll data",
  "round-1": "Round 1 · Scope & baseline",
  "round-2": "Round 2 · Cost & constraints",
  "round-3": "Round 3 · Sanity & framing",
  "value-creation": "Value creation",
};

const QUESTION_SECTION_BY_PHASE: Record<
  ReturnType<typeof phaseForQuestionId>,
  CaptureSectionId
> = {
  round1: "round-1",
  round2: "round-2",
  round3: "round-3",
  "value-creation": "value-creation",
};

/**
 * Derives the "What I'm capturing" rail state from a session.
 *
 * Pure and SSR-safe: no `window`, `Date`, or storage access, so it produces the
 * same result for the server placeholder session as for the first client render.
 */
export function getCaptureProgress(session: OffshoringSession): CaptureProgress {
  // `session.queue` is only the *remaining* tail (and is emptied on complete),
  // so the denominator always comes from the canonical queue instead. The tier
  // fallback mirrors the one used in engine.ts.
  const tier = session.dataTier ?? (session.skippedPayroll ? "C" : "A");
  const canonical = buildFullDiscoveryQueue(tier);
  const isComplete = session.phase === "complete";

  const currentSection = session.currentQuestionId
    ? QUESTION_SECTION_BY_PHASE[phaseForQuestionId(session.currentQuestionId)]
    : undefined;

  const questionSections: CaptureSectionId[] = [
    "round-1",
    "round-2",
    "round-3",
    "value-creation",
  ];

  const buckets = new Map<CaptureSectionId, { total: number; items: CaptureItem[] }>(
    questionSections.map((id) => [id, { total: 0, items: [] }]),
  );

  // Iterating the canonical queue (rather than Object.keys(session.answers)) is
  // what keeps clarification answers — which the engine also writes into
  // `answers` — out of the counts.
  for (const questionId of canonical) {
    const question = getOffshoringQuestion(questionId);
    const sectionId = QUESTION_SECTION_BY_PHASE[phaseForQuestionId(questionId)];
    const bucket = buckets.get(sectionId);
    if (!bucket) continue;

    const answer = session.answers[questionId];

    // An optional question left unanswered at the end shouldn't hold the rail
    // below 100%.
    if (!answer && question?.optional && isComplete) continue;

    bucket.total += 1;
    if (answer) {
      bucket.items.push({
        id: questionId,
        label: question?.question ?? questionId,
        value: answer.label || String(answer.value),
      });
    }
  }

  const companyCaptured = session.companyName ? 1 : 0;
  const companySection: CaptureSection = {
    id: "company",
    label: SECTION_LABELS.company,
    captured: companyCaptured,
    total: 1,
    status: statusFor(companyCaptured, 1, session.phase === "company"),
    items: session.companyName
      ? [{ id: "company", label: "Portfolio company", value: session.companyName }]
      : [],
  };

  const payrollCaptured =
    session.files.length > 0 || session.skippedPayroll ? 1 : 0;
  const payrollValue =
    session.files.length > 0
      ? session.files.map((file) => file.name).join(", ")
      : "Skipped — estimating from sector benchmarks";
  const payrollSection: CaptureSection = {
    id: "payroll",
    label: SECTION_LABELS.payroll,
    captured: payrollCaptured,
    total: 1,
    status: statusFor(payrollCaptured, 1, session.phase === "payroll"),
    items: payrollCaptured
      ? [{ id: "payroll", label: "Payroll sheet", value: payrollValue }]
      : [],
  };

  const sections: CaptureSection[] = [
    companySection,
    payrollSection,
    ...questionSections.map((id) => {
      const bucket = buckets.get(id) ?? { total: 0, items: [] };
      return {
        id,
        label: SECTION_LABELS[id],
        captured: bucket.items.length,
        total: bucket.total,
        status: statusFor(bucket.items.length, bucket.total, currentSection === id),
        items: bucket.items,
      } satisfies CaptureSection;
    }),
  ];

  return summarize(sections);
}
