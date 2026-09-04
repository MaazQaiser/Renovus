/**
 * The sales process AI pre-assessment.
 *
 * Four sections, in the order they are read: what the report is built on, how
 * selling works today, the same work with software doing the repetitive parts,
 * and what that is worth.
 *
 * The as-is and to-be share one task list. Every to-be task lines up with the
 * as-is task at the same index, which is what makes "before → after" per task
 * possible without stating the task twice.
 */

// ── 01 Data we need ────────────────────────────────────────────────────────

/** Where a piece of input comes from, which sets how much to trust it. */
export type DataSource = "export" | "interview" | "both";

export interface DataRequirement {
  source: DataSource;
  title: string;
  /** What we are asking for. */
  what: string;
  /** What it makes possible in the report. */
  why: string;
  /** How to get it, concretely. */
  how: string;
  /**
   * How much of this requirement is actually in hand, 0–100. Drives the card's
   * meter, and with it whether the card reads as outstanding work or as
   * something already gathered.
   */
  collectedPct: number;
}

// ── 02 As-is ──────────────────────────────────────────────────────────────

/** A figure with its unit. `code` marks the motion on a roll-up card. */
export interface Figure {
  code?: string;
  value: string;
  label: string;
}

/** One task as it runs today. */
export interface AsIsTask {
  task: string;
  /** Roles doing it, not headcount. */
  who: string;
  hoursPerWeek: number;
  /** What is wrong with it, in a word or two. */
  tag?: string;
}

// ── 03 To-be ──────────────────────────────────────────────────────────────

/**
 * What happens to a task.
 *
 * `auto` software does it end to end · `ai` a person still owns it but starts
 * from a draft · `human` left with people on purpose · `rm` the task
 * disappears because two systems now share one record.
 */
export type TaskMode = "auto" | "ai" | "human" | "rm";

/** How soon a change is realistic. */
export type Tier = 1 | 2 | 3;

/** The same task after the change, at the same index as its as-is task. */
export interface ToBeTask {
  mode: TaskMode;
  /** Absent where nothing changes, which is also why it earns no tier. */
  tier?: Tier;
  /** Hours left with a person. */
  hoursPerWeek: number;
  /** What the machine does, and what the person is left holding. */
  how: string;
}

// ── Stages ────────────────────────────────────────────────────────────────

/** One stage of one motion: today's numbers, its task flow, and its to-be. */
export interface MotionStage {
  /** "A1" — motion letter and stage number. */
  id: string;
  stageLabel: string;
  name: string;
  volume: Figure;
  /** Advance rate and days in stage. */
  conversion: Figure;
  hoursPerWeek: number;
  /** People cost a year, in thousands. */
  costK: number;
  systems: string;
  /** Times a person re-keys, re-uploads or forwards to reach the next stage. */
  handoffs: number;
  note: string;
  /** The costliest stage of its motion. */
  heaviest?: boolean;
  /** Roles across the stage. */
  people: string;
  tasks: AsIsTask[];
  toBe: {
    tasks: ToBeTask[];
    /** What is deliberately left with people, and why. */
    stays: string;
  };
}

/**
 * The roll-up's own copy for a stage. Its figures are summed from the motions
 * rather than authored, so the two can never disagree.
 */
export interface OverviewStage {
  stageLabel: string;
  name: string;
  systems: string;
  note: string;
  heaviest?: boolean;
}

export interface Metric {
  value: string;
  label: string;
  /** The motion's headline figure, given more weight. */
  lead?: boolean;
}

export interface SystemMapEntry {
  stage: string;
  systems: string;
  handoffs: number;
}

export interface Motion {
  /** "A", "B", "C". */
  code: string;
  name: string;
  intro: string;
  /** The to-be section's own framing for this motion. */
  toBeIntro: string;
  metrics: Metric[];
  stages: MotionStage[];
  systemMap: SystemMapEntry[];
}

// ── 04 Impact ─────────────────────────────────────────────────────────────

/**
 * One intervention, always in the same shape: a base figure from today, an
 * assumption with its reasoning, the arithmetic, and a low and high result.
 *
 * `capacity` marks a row whose freed time only pays off through another
 * intervention. Those count as zero revenue so nothing is double counted.
 */
export interface Intervention {
  motionCode: string;
  tier: Tier;
  name: string;
  /** Where today's figure sits. */
  base: string;
  /** Which input it came from. */
  src: string;
  assume: string;
  arith: string;
  /** Revenue added, in $M. Zero on a capacity row. */
  revLoM: number;
  revHiM: number;
  /** Extra wins a year. Zero on a capacity row. */
  winsLo: number;
  winsHi: number;
  hoursFreed: number;
  /** Set on a capacity row — what the freed time buys instead of revenue. */
  capacity?: string;
  /** The reasoning behind the assumption, shown on demand. */
  why: string;
}

export interface SensitivityRow {
  motion: string;
  ifMoved: string;
  arith: string;
  wouldAdd: string;
}

export interface Phase {
  when: string;
  name: string;
  /** What this phase unlocks, and the label for it. */
  unlocks: string;
  unlocksLabel: string;
  items: string[];
  whyHere: string;
}

export interface SalesPreAssessmentData {
  companyName: string;
  sector: string;
  date: string;

  dataNeeded: DataRequirement[];

  asIsTitle: string;
  asIsLede: string;
  overviewIntro: string;
  overviewMetrics: Metric[];
  overviewStages: OverviewStage[];
  overviewSystemMap: SystemMapEntry[];

  toBeTitle: string;
  toBeLede: string;
  toBeOverviewIntro: string;

  motions: Motion[];

  impactLede: string;
  interventions: Intervention[];
  sensitivity: SensitivityRow[];
  phases: Phase[];
  /** Today's revenue and wins per motion, for the impact tables. */
  today: Record<string, { revM: number; wins: number; unit: string }>;
  /** Revenue won across all motions, in $M. */
  totalRevenueM: number;
  /** Deals won a month, all motions. */
  dealsPerMonth: number;
}
