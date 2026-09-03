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
  who: string;
  today: string;
  agentName: string;
  withAgent: string;
  owner: StepOwner;
  hoursPerWeek: number;
  automatablePct: number;
}

const SALES_STAGES: StageSeed[] = [
  {
    id: "prospect",
    name: "Prospect",
    who: "2 SDRs",
    today: "build the weekly list by hand across CRM and LinkedIn",
    agentName: "List Builder",
    withAgent: "assembles and dedupes the weekly list, with a reason per account",
    owner: "Agent + review",
    hoursPerWeek: 14,
    automatablePct: 80,
  },
  {
    id: "qualify",
    name: "Qualify",
    who: "2 SDRs and an AE",
    today: "qualify to their own definitions, so no two agree",
    agentName: "Qualifier",
    withAgent: "scores every account against one written rubric",
    owner: "Agent + review",
    hoursPerWeek: 9,
    automatablePct: 65,
  },
  {
    id: "discover",
    name: "Discover",
    who: "2 AEs",
    today: "type notes from memory after each call",
    agentName: "Call Scribe",
    withAgent: "captures requirements from the transcript and drafts the recap",
    owner: "Agent + review",
    hoursPerWeek: 11,
    automatablePct: 55,
  },
  {
    id: "propose",
    name: "Propose",
    who: "2 AEs",
    today: "rewrite and reprice last quarter's closest proposal",
    agentName: "Proposal Drafter",
    withAgent: "drafts from the approved template and price book",
    owner: "Agent + review",
    hoursPerWeek: 12,
    automatablePct: 70,
  },
  {
    id: "negotiate",
    name: "Negotiate",
    who: "2 AEs and the sales lead",
    today: "trade redlines over email, agreeing concessions verbally",
    agentName: "Deal Recorder",
    withAgent: "logs every concession and flags terms outside the band",
    owner: "Human",
    hoursPerWeek: 6,
    automatablePct: 30,
  },
  {
    id: "close",
    name: "Close",
    who: "An AE and ops",
    today: "assemble the contract by hand, then re-key it into CRM",
    agentName: "Contract Assembler",
    withAgent: "assembles the contract and writes the booked terms straight back",
    owner: "Agent + review",
    hoursPerWeek: 5,
    automatablePct: 75,
  },
  {
    id: "handoff",
    name: "Hand off",
    who: "2 AEs",
    today: "retell the sale on a kickoff call, so delivery re-asks what the buyer answered",
    agentName: "Handoff Packer",
    withAgent: "builds the handoff pack with every commitment listed",
    owner: "Agent + review",
    hoursPerWeek: 4,
    automatablePct: 60,
  },
  {
    id: "expand",
    name: "Renew",
    who: "2 AEs",
    today: "track renewal dates in a spreadsheet",
    agentName: "Renewal Watcher",
    withAgent: "raises renewal and expansion plays on a schedule",
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
    who: seed.who,
    today: seed.today,
    agentName: seed.agentName,
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
