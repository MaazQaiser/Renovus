/**
 * The sales process pre-assessment.
 *
 * The short version of the full pre-assessment: one 30-minute conversation and a
 * partial CRM export, so every figure is an approximation and carries the tag
 * that says where it came from. Enough to see the shape of the opportunity,
 * not enough to size it.
 *
 * Figures are held as the strings they are written as ("~$31M", "~1 in 12")
 * rather than as numbers. They are estimates spoken aloud, and rounding them
 * into numbers would imply a precision the inputs do not have; nothing in this
 * report is arithmetic over them.
 */

/** Where a figure came from. Rendered as the chip beside it. */
export type BaselineProvenance = "est" | "crm";

export type MotionCode = "A" | "B" | "C";

/** The four stages every motion is mapped against. */
export const BASELINE_STAGES = [
  "Prospecting",
  "Qualification",
  "Proposal",
  "Closing",
] as const;

export interface BaselineStage {
  /** This motion's own name for the stage. */
  name: string;
  volume: string;
  volumeLabel: string;
  volumeSource: BaselineProvenance;
  /** Share advancing to the next stage. Absent on the last stage. */
  conversion?: string;
  cycle: string;
  hours: string;
  system: string;
  /** What the head of sales said about this stage, verbatim. */
  quote: string;
}

/** The same stage after transformation, as a delta from the as-is. */
export interface BaselineStageTarget {
  volume: string;
  volumeDelta?: string;
  cycle: string;
  hours: string;
  hoursDelta?: string;
  system: string;
  note: string;
}

export interface BaselineMotionTarget {
  revenue: string;
  revenueDelta: string;
  daysToClose: string;
  dealsWon: string;
  intro: string;
  stages: BaselineStageTarget[];
}

export interface BaselineMotion {
  code: MotionCode;
  id: string;
  name: string;
  revenue: string;
  fte: string;
  winRate: string;
  daysToClose: string;
  dealsWon: string;
  intro: string;
  stages: BaselineStage[];
  /** Index of the stage that costs the most, lifted on the page. */
  heaviestStage: number;
  target: BaselineMotionTarget;
}

export interface BaselineOverview {
  revenue: string;
  dealsWon: string;
  daysToClose: string;
  fte: string;
  intro: string;
  /** One line per stage, in stage order. */
  stageNotes: string[];
}

export interface BaselineOverviewTarget extends BaselineOverview {
  revenueDelta: string;
}

/** One card on "Data we have". */
export interface BaselineDataCard {
  /** `todo` is the card listing what the full version would still need. */
  kind: "interview" | "export" | "todo";
  title: string;
  what: string;
  /** Prose for the two source cards. */
  gaveUs?: string;
  /** The checklist on the `todo` card. */
  items?: string[];
  footnote?: string;
  /** How much of this input is in hand, 0–100. */
  collectedPct: number;
}

/** One line of the calculation, with its arithmetic shown. */
export interface BaselineIntervention {
  motion: MotionCode;
  tier: 1 | 2;
  name: string;
  base: string;
  /** "Conversation" or "CRM, partial" — how solid the base figure is. */
  source: string;
  assumption: string;
  arithmetic: string;
  /** Low and high in $M. Both zero where the gain is capacity, not revenue. */
  lo: number;
  hi: number;
  /** Set instead of a money result where the gain is capacity. */
  capacity?: string;
  why: string;
}

export interface SalesBaselineData {
  companyName: string;
  /** Shown under the title — the report's own name and vintage. */
  date: string;
  /** The "read this first" caveat. This report is nothing without it. */
  notice: string;
  dataCards: BaselineDataCard[];
  overview: BaselineOverview;
  overviewTarget: BaselineOverviewTarget;
  motions: BaselineMotion[];
  calculationLede: string;
  interventions: BaselineIntervention[];
}
