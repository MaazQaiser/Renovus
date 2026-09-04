import { getSalesQuestion } from "@/data/sales";
import { money } from "@/lib/assessment/csv-intake";
import { CLARIFY_RESPONDENT_ID } from "@/lib/assessment/intake-session";
import type { IntakeExtract, IntakeQuestion } from "@/types/sales-intake";
import type { SalesAnswer } from "@/types/sales-assessment";

/**
 * The short round that follows the upload.
 *
 * Every question here is one the export provably cannot answer, and each is
 * asked against a real question-bank id — so its answer lands in the same slot
 * an interviewed answer would, and the report reads the two identically.
 *
 * The framing quotes what the file *did* say, so it is obvious why the question
 * is being asked rather than looking like a form to fill in.
 */

/** The bank's own options, so the wording never drifts from the interview. */
function options(qid: string): { id: string; label: string }[] {
  return getSalesQuestion(qid)?.options ?? [];
}

export function buildIntakeQuestions(extract: IntakeExtract): IntakeQuestion[] {
  const questions: IntakeQuestion[] = [];

  const accounts = extract.rowCount;
  const topOwner = extract.owners[0];

  // B1a — the offering. Every other finding is read against it, and an export
  // names accounts and amounts but never what was sold.
  questions.push({
    qid: "B1a",
    headline: "What do you sell, and who do you sell it to?",
    because: `The export gave me ${accounts} opportunities and what they closed for. It never says what the product is — and every finding below gets read against that.`,
    kind: "text",
    placeholder: "e.g. a case-management platform, mostly to public sector agencies",
  });

  // T2 — the selling week. This is what every automation candidate is sized
  // against, and no CRM field holds it.
  questions.push({
    qid: "T2",
    headline: "Across a typical week, where does the selling time actually go?",
    because: `I can see ${extract.wonRows} wins and ${extract.lostRows} losses, but not a single hour of how they were worked. This is what every automation candidate gets sized against.`,
    kind: "choice",
    options: options("T2"),
    // Stated rather than measured: an estimate, not an actual.
    confidence: "E",
  });

  // B4c — the target. The file holds last year; the gap is the point of the
  // assessment.
  questions.push({
    qid: "B4c",
    headline: "And the target for the next 12 months?",
    because: `The trailing twelve months came to ${money(extract.wonValueTrailing12)} of closed-won${
      extract.wonValuePrior12 !== undefined && extract.wonValuePrior12 > 0
        ? `, against ${money(extract.wonValuePrior12)} the year before`
        : ""
    }. The target is the one number a CRM never holds.`,
    kind: "text",
    placeholder: "A number, and how it feels — comfortable, stretch, or hope",
  });

  // L1 — the ceiling. The export shows what was pursued, never what was left
  // unseen for want of people or reach.
  questions.push({
    qid: "L1",
    headline:
      "Is there a limitation — team or geographic — that stops you seeing more opportunities?",
    because: `${
      topOwner
        ? `${extract.owners.length} owners appear on won work and ${topOwner.name} carries ${extract.topOwnerSharePct ?? 0}% of the value. `
        : ""
    }The export shows what you pursued. It cannot show what you never saw.`,
    kind: "choice",
    options: options("L1"),
  });

  return questions;
}

/** One clarifying answer, in the shape the session stores. */
export function toClarificationAnswer(
  question: IntakeQuestion,
  value: string,
): SalesAnswer {
  const label =
    question.kind === "choice"
      ? (question.options?.find((option) => option.id === value)?.label ?? value)
      : value;

  return {
    value,
    label,
    ...(question.confidence ? { confidence: question.confidence } : {}),
    respondentId: CLARIFY_RESPONDENT_ID,
  };
}
