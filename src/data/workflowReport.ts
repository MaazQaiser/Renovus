import type { StepOwner, WorkflowReportData, WorkflowStage } from "@/types/workflow";

/**
 * Mock workflow assessment for a sales function.
 *
 * Stages follow a standard B2B sales process, so a reader can place their own
 * against it. Each stage states today and the agentic version in a phrase —
 * this renders as a one-page flow, not a document.
 *
 * Deterministic: the same company always produces the same report, so a demo
 * never contradicts itself between two viewings.
 */

interface StageSeed {
  id: string;
  name: string;
  today: string;
  withAgent: string;
  owner: StepOwner;
  hoursPerWeek: number;
  automatablePct: number;
}

const SALES_STAGES: StageSeed[] = [
  {
    id: "prospect",
    name: "Prospect",
    today: "Reps build lists by hand across CRM and LinkedIn.",
    withAgent: "Assembles and dedupes the weekly list, with a reason per account.",
    owner: "Agent + review",
    hoursPerWeek: 14,
    automatablePct: 80,
  },
  {
    id: "qualify",
    name: "Qualify",
    today: "Each rep qualifies to their own definition.",
    withAgent: "Scores every account against one written rubric.",
    owner: "Agent + review",
    hoursPerWeek: 9,
    automatablePct: 65,
  },
  {
    id: "discover",
    name: "Discover",
    today: "Notes typed from memory after the call.",
    withAgent: "Captures requirements from the transcript, drafts the recap.",
    owner: "Agent + review",
    hoursPerWeek: 11,
    automatablePct: 55,
  },
  {
    id: "propose",
    name: "Propose",
    today: "Last quarter's proposal, rewritten and repriced.",
    withAgent: "Drafts from the approved template and price book.",
    owner: "Agent + review",
    hoursPerWeek: 12,
    automatablePct: 70,
  },
  {
    id: "negotiate",
    name: "Negotiate",
    today: "Redlines over email, concessions agreed verbally.",
    withAgent: "Logs every concession, flags terms outside the band.",
    owner: "Human",
    hoursPerWeek: 6,
    automatablePct: 30,
  },
  {
    id: "close",
    name: "Close",
    today: "Contract by hand, then re-keyed into CRM.",
    withAgent: "Assembles it and writes booked terms straight back.",
    owner: "Agent + review",
    hoursPerWeek: 5,
    automatablePct: 75,
  },
  {
    id: "handoff",
    name: "Hand off",
    today: "Delivery re-asks what the buyer already answered.",
    withAgent: "Builds the handoff pack with every commitment listed.",
    owner: "Agent + review",
    hoursPerWeek: 4,
    automatablePct: 60,
  },
  {
    id: "expand",
    name: "Renew",
    today: "Renewal dates tracked in a spreadsheet.",
    withAgent: "Raises renewal and expansion plays on a schedule.",
    owner: "Agent + review",
    hoursPerWeek: 7,
    automatablePct: 50,
  },
];

/** Blended loaded cost of a sales hour, used to annualise hours handed back. */
const HOURLY_COST = 65;
const WORKING_WEEKS = 46;

/** Current-state figures the baseline captured beyond the per-stage hours. */
const BASELINE_PEOPLE = 6;
const BASELINE_TOOLS = 9;
const BASELINE_CYCLE_DAYS = 34;
/** Accounts the team carries through the workflow in a week today. */
const BASELINE_ACCOUNTS = 40;

/** Cycle time once the clerical waits between stages come out. */
const AGENTIC_CYCLE_DAYS = 21;

function annualise(hoursPerWeek: number): number {
  return Math.round(hoursPerWeek * HOURLY_COST * WORKING_WEEKS);
}

export function getMockWorkflowReport(
  companyName: string,
  department = "Sales",
): WorkflowReportData {
  const stages: WorkflowStage[] = SALES_STAGES.map((seed) => ({
    id: seed.id,
    name: seed.name,
    today: seed.today,
    withAgent: seed.withAgent,
    owner: seed.owner,
    hoursPerWeek: seed.hoursPerWeek,
    hoursAfter: Math.round(seed.hoursPerWeek * (1 - seed.automatablePct / 100)),
  }));

  const hoursBefore = stages.reduce((sum, stage) => sum + stage.hoursPerWeek, 0);
  const hoursAfter = stages.reduce((sum, stage) => sum + stage.hoursAfter, 0);
  /** Clerical hours an agent absorbs. They do not leave the team's week. */
  const freed = hoursBefore - hoursAfter;
  const agentStages = stages.filter((stage) => stage.owner !== "Human").length;
  const percent = Math.round((freed / hoursBefore) * 100);

  // Same team and budget on both sides, so the annual figure is the baseline's
  // either way — the change shows up as capacity, not as a smaller number.
  const annualCost = annualise(hoursBefore);

  // Capacity scales with the hours that come back: the clerical load is what
  // caps how many accounts the team can carry.
  const accountsAfter = Math.round(BASELINE_ACCOUNTS * (1 + freed / hoursBefore));

  return {
    companyName,
    department,
    processModel: "Standard B2B sales process",

    baseline: {
      hoursPerWeek: hoursBefore,
      clericalHours: freed,
      sellingHours: hoursAfter,
      people: BASELINE_PEOPLE,
      annualCost,
      tools: BASELINE_TOOLS,
      cycleDays: BASELINE_CYCLE_DAYS,
      accountsPerWeek: BASELINE_ACCOUNTS,
      manualStages: stages.length,
    },

    agentic: {
      hoursPerWeek: hoursAfter,
      clericalHours: 0,
      sellingHours: hoursBefore,
      people: BASELINE_PEOPLE,
      annualCost,
      agentStages,
      humanStages: stages.length - agentStages,
      cycleDays: AGENTIC_CYCLE_DAYS,
      accountsPerWeek: accountsAfter,
    },

    delta: {
      sellingHoursGained: freed,
      percent,
      cycleDays: BASELINE_CYCLE_DAYS - AGENTIC_CYCLE_DAYS,
      accountsGained: accountsAfter - BASELINE_ACCOUNTS,
      budgetChange: 0,
    },

    headlineValue: `${freed} hours a week`,
    headlineRest: `move from admin to selling — same team, same budget`,

    stages,

    waves: [
      {
        id: "wave-1",
        title: "Capture and prep",
        window: "Weeks 1–6",
        detail: "Prospect, qualify, discover. Most hours, least risk.",
      },
      {
        id: "wave-2",
        title: "Paperwork",
        window: "Weeks 6–12",
        detail: "Propose and close. Needs the template and price book first.",
      },
      {
        id: "wave-3",
        title: "After signature",
        window: "Quarter 2",
        detail: "Handoff and renewal. Needs delivery data to be readable.",
      },
    ],

    prerequisites: [
      "One written definition per pipeline stage, agreed across reps.",
      "An approved proposal template, price book and discount band.",
      "Call recording and transcription on, with buyer consent.",
      "CRM as the system of record, so the agent writes somewhere trusted.",
    ],
  };
}
