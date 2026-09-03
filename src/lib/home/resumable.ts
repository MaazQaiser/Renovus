import { getSalesCaptureProgress } from "@/lib/assessment/sales-progress";
import { getCaptureProgress } from "@/lib/offshoring/progress";
import type { AppHref } from "@/lib/routes";
import type { OffshoringPhase, OffshoringSession } from "@/types/offshoring";
import type { SalesAssessmentSession, SalesPhase } from "@/types/sales-assessment";

/**
 * Folds the two agents' live sessions into one "pick up where you left off"
 * list for the home page.
 *
 * Pure and SSR-safe — no `window`, storage, or `Date` access — so the same
 * input always yields the same output and the selectors stay testable.
 *
 * Both agents store exactly one session under one fixed key, so this list is
 * capped at two entries.
 */

export type ResumableAgent = "sales" | "offshoring";

export interface Resumable {
  id: string;
  agent: ResumableAgent;
  agentLabel: string;
  companyName?: string;
  phaseLabel: string;
  percent: number;
  captured: number;
  total: number;
  updatedAt: string;
  status: "in-progress" | "processing";
  continueHref: AppHref;
}

/** Both session modules hand back this id for the SSR snapshot. */
const SERVER_PLACEHOLDER_ID = "server-placeholder";

// ── Sales ──────────────────────────────────────────────────────────────────

const SALES_PHASE_LABEL: Record<SalesPhase, string> = {
  company: "Choosing a company",
  respondent: "Naming the respondent",
  phase1: "Phase 1 · Baseline",
  gate: "At the Phase 1 gate",
  phase2: "Deep dive",
  marketing: "Marketing session",
  "ceo-close": "CEO close",
  complete: "Complete",
};

export function buildSalesResumable(
  session: SalesAssessmentSession | null,
): Resumable | null {
  if (!session || session.id === SERVER_PLACEHOLDER_ID) return null;
  if (session.status === "complete" || session.phase === "complete") return null;

  const progress = getSalesCaptureProgress(session);
  const processing = session.status === "processing";

  return {
    id: session.id,
    agent: "sales",
    agentLabel: "Sales function assessment",
    companyName: session.companyName,
    phaseLabel: SALES_PHASE_LABEL[session.phase],
    percent: progress.percent,
    captured: progress.totalCaptured,
    total: progress.totalItems,
    updatedAt: session.updatedAt,
    status: processing ? "processing" : "in-progress",
    continueHref: processing ? "/agents/assessment/processing" : "/agents/assessment",
  };
}

// ── Offshoring ─────────────────────────────────────────────────────────────

const OFFSHORING_PHASE_LABEL: Record<OffshoringPhase, string> = {
  company: "Choosing a company",
  payroll: "Payroll upload",
  round1: "Round 1 · Discovery",
  round2: "Round 2 · Process detail",
  round3: "Round 3 · Risk & readiness",
  "value-creation": "Value creation",
  complete: "Complete",
};

export function buildOffshoringResumable(
  session: OffshoringSession | null,
): Resumable | null {
  if (!session || session.id === SERVER_PLACEHOLDER_ID) return null;
  if (session.status === "complete" || session.phase === "complete") return null;

  const progress = getCaptureProgress(session);
  const processing = session.status === "processing";

  return {
    id: session.id,
    agent: "offshoring",
    agentLabel: "Offshoring potential assessment",
    companyName: session.companyName,
    phaseLabel: OFFSHORING_PHASE_LABEL[session.phase],
    percent: progress.percent,
    captured: progress.totalCaptured,
    total: progress.totalItems,
    updatedAt: session.updatedAt,
    status: processing ? "processing" : "in-progress",
    continueHref: processing ? "/agents/offshoring/processing" : "/agents/offshoring",
  };
}

/** Most recently touched first — the thing you abandoned last is the likeliest resume. */
export function buildResumables(
  sales: SalesAssessmentSession | null,
  offshoring: OffshoringSession | null,
): Resumable[] {
  return [buildSalesResumable(sales), buildOffshoringResumable(offshoring)]
    .filter((entry): entry is Resumable => entry !== null)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}
