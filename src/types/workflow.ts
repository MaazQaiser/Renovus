/** Who runs a stage once the agentic version is in place. */
export type StepOwner = "Agent" | "Agent + review" | "Human";

/**
 * One stage of a department's workflow, today and with an agent in it.
 *
 * Both sides are held to a phrase on purpose: the report is a one-page flow
 * someone reads in a meeting, so the stage list has to scan, not be studied.
 */
export interface WorkflowStage {
  id: string;
  /** Stage name from the standard process, e.g. "Qualify". */
  name: string;
  /** How it runs today, in a phrase. */
  today: string;
  /** What the agent takes over, in a phrase. */
  withAgent: string;
  owner: StepOwner;
  /** Person-hours a week this stage costs today. */
  hoursPerWeek: number;
  /** Person-hours a week still on a person afterwards. */
  hoursAfter: number;
}

/**
 * The current manual process, measured. Part one of the report.
 *
 * Headcount and budget are held constant across both parts on purpose: the
 * case is capacity, not cost. Nobody leaves and nothing is cut — the same team
 * spends its week differently.
 */
export interface WorkflowBaseline {
  /** Person-hours a week the workflow consumes. */
  hoursPerWeek: number;
  /** Of those hours, the clerical share — list building, notes, re-keying. */
  clericalHours: number;
  /** Of those hours, the ones actually spent in front of a customer. */
  sellingHours: number;
  /** People whose week the workflow touches. */
  people: number;
  /** Loaded cost of the team's time on this workflow over a year. */
  annualCost: number;
  /** Systems the workflow crosses today. */
  tools: number;
  /** Days from first touch to signature. */
  cycleDays: number;
  /** Accounts the team can carry through the workflow in a week. */
  accountsPerWeek: number;
  /** Stages with no automation behind them — today, all of them. */
  manualStages: number;
}

/** The same workflow, same team and budget, with an agent in it. Part two. */
export interface WorkflowAgentic {
  /** Person-hours a week still on a person. */
  hoursPerWeek: number;
  clericalHours: number;
  /** The freed hours land here: same week, spent selling instead. */
  sellingHours: number;
  people: number;
  annualCost: number;
  /** Stages an agent takes over, with or without review. */
  agentStages: number;
  /** Stages deliberately left with a person. */
  humanStages: number;
  cycleDays: number;
  accountsPerWeek: number;
}

/** Part one against part two, expressed as capacity rather than saving. */
export interface WorkflowDelta {
  /** Hours a week that move from admin to selling. */
  sellingHoursGained: number;
  /** Share of the workflow's hours an agent absorbs, 0–100. */
  percent: number;
  cycleDays: number;
  accountsGained: number;
  /** Change in annual cost. Zero — that is the point. */
  budgetChange: number;
}

export interface WorkflowReportData {
  companyName: string;
  /** The department this workflow belongs to, e.g. "Sales". */
  department: string;
  /** Process model the stages follow, named so the reader can place it. */
  processModel: string;

  baseline: WorkflowBaseline;
  agentic: WorkflowAgentic;
  delta: WorkflowDelta;

  headlineValue: string;
  headlineRest: string;

  stages: WorkflowStage[];
  /** What to change first, one line each. */
  waves: { id: string; title: string; window: string; detail: string }[];
  /** What has to be true first, one line each. */
  prerequisites: string[];
}
