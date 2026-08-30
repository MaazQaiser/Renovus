import type { Sector } from "@/types/company";

export type ReportBand = "High" | "Medium" | "Low";
export type ReportOwner = "Portco" | "Renovus" | "Vendor" | "Joint";
export type SourcingModel = "Lift-out" | "Hybrid" | "Role-by-role" | "Retain";

export interface ReportKpi {
  label: string;
  value: string;
  /** Muted suffix rendered beside the value, e.g. "/ 406". */
  suffix?: string;
  hint: string;
  /** Tints the card — one per report. */
  lead?: boolean;
}

export interface ReportStat {
  label: string;
  value: string;
}

export interface ReportCostRow {
  function: string;
  loadedCostM: number;
  /** Share of the function's cost judged addressable. */
  addressableM: number;
  fte: number;
}

/** 0–100 potential per level; null means "no roles at this level". */
export interface ReportHeatRow {
  function: string;
  model: SourcingModel;
  junior: number | null;
  mid: number | null;
  senior: number | null;
  lead: number | null;
}

export interface ReportMover {
  id: string;
  function: string;
  level: string;
  band: ReportBand;
  savingPerYear: string;
}

/** One bar of the year-1 waterfall. */
export interface ReportBridgeBar {
  label: string;
  value: string;
  /** Millions, for bar height. */
  amount: number;
  tone: "ink" | "gold" | "pale";
}

export interface ReportScenario {
  name: string;
  headline?: boolean;
  fte: string;
  runRate: string;
  net3: string;
  payback: string;
}

export interface ReportWave {
  n: string;
  from: string;
  title: string;
  rolesMoving: string;
  loadedCost: string;
  runRate: string;
  functions: string[];
  gates: string[];
}

export interface ReportRisk {
  risk: string;
  impact: ReportBand;
  mitigation: string;
  owner: ReportOwner;
}

export interface ReportNextStep {
  step: string;
  owner: ReportOwner;
  timing: string;
}

export interface ReportAssumption {
  assumption: string;
  value: string;
  source: string;
}

export interface ReportModelRow {
  function: string;
  fte: number;
  loadedCost: string;
  model: SourcingModel;
  rationale: string;
}

export interface OffshoringReportData {
  reportDate: string;
  preparedFor: string;
  preparedBy: string;
  confidentiality: string;

  answerHeadlineValue: string;
  answerHeadlineRest: string;
  summaryExec: string;
  conservativeFloor: string;
  kpis: ReportKpi[];

  costCaption: string;
  costStats: ReportStat[];
  costRows: ReportCostRow[];

  moveCaption: string;
  heatRows: ReportHeatRow[];
  heatRollup: string;
  movers: ReportMover[];
  moversRollup: string;

  saveCaption: string;
  bridge: ReportBridgeBar[];
  scenarios: ReportScenario[];
  scenariosRollup: string;

  wavesCaption: string;
  waves: ReportWave[];
  wavesSequence: string;

  risksCaption: string;
  risks: ReportRisk[];
  nextSteps: ReportNextStep[];

  detailApproach: string[];
  scoringDimensions: { name: string; detail: string }[];
  modelRows: ReportModelRow[];
  assumptions: ReportAssumption[];
  methodology: string[];
}

const FUNCTION_SETS: Record<
  Sector,
  { high: [string, string]; mid: [string, string]; retain: [string, string] }
> = {
  Education: {
    high: ["Enrollment & Admissions", "Support Center"],
    mid: ["Finance Ops", "IT Applications & SIS"],
    retain: ["Instruction & Curriculum", "IT Infrastructure & Cloud"],
  },
  "Healthcare Services": {
    high: ["Revenue Cycle", "Support / Patient Services"],
    mid: ["Credentialing", "Finance Ops"],
    retain: ["Clinical", "IT & Applications"],
  },
  "Technology Services": {
    high: ["QA / Test", "Support / Helpdesk"],
    mid: ["Data / Analytics", "Finance Ops"],
    retain: ["Engineering", "DevOps / Cloud / Infra"],
  },
  "Professional Services": {
    high: ["Client Support", "Finance Ops"],
    mid: ["HR Ops", "Delivery / Operations"],
    retain: ["Engineering", "Sales / Account Management"],
  },
};

export function getMockOffshoringReport(
  companyName: string,
  sector: Sector = "Education",
): OffshoringReportData {
  const set = FUNCTION_SETS[sector] ?? FUNCTION_SETS.Education;
  const [highA, highB] = set.high;
  const [midA, midB] = set.mid;
  const [retainA, retainB] = set.retain;

  return {
    reportDate: "30 August 2026",
    preparedFor: companyName,
    preparedBy: "Renovus Capital · Portfolio Operations",
    confidentiality: "Confidential — Renovus Capital internal (IC / operating review)",

    answerHeadlineValue: "$2.4M",
    answerHeadlineRest: `a year is addressable across 6 functions at ${companyName}`,
    summaryExec: `We assessed all 190 roles and $22.0M of loaded payroll at ${companyName} against a five-part sourcing rubric. 48 roles — 22% of the workforce, $7.9M of cost — are addressable, led by ${highA} and the ${highB}. At offshore rates of 40% of onshore cost, the base case saves $2.4M a year and $5.1M net over three years, repaying transition costs in about fourteen months. We would lift out ${highB} first, then move the ${highA} delivery layer. The caveat: ${retainA} is licence-capped, so it stays onshore entirely.`,
    conservativeFloor:
      "Conservative floor: $1.6M run-rate and $3.2M 3-year net if only High-scoring roles move at discounted rates.",
    kpis: [
      {
        label: "Annual run-rate saving",
        value: "$2.4M",
        hint: "Base case, steady state",
        lead: true,
      },
      { label: "Addressable FTEs", value: "48", suffix: "/ 190", hint: "22% of in-scope roles" },
      { label: "3-year net", value: "$5.1M", hint: "Cumulative, after transition costs" },
      { label: "Payback", value: "14 mo", hint: "Transition one-off $1.4M" },
    ],

    costCaption: `${highA} ($4.8M) and ${retainA} ($5.9M) carry half the cost base; the top four functions carry three-quarters.`,
    costStats: [
      { label: "In-scope FTEs", value: "190" },
      { label: "Loaded cost in scope", value: "$22.0M" },
      { label: "Functions", value: "6" },
      { label: "Addressable loaded cost", value: "$7.9M" },
    ],
    costRows: [
      { function: retainA, loadedCostM: 5.9, addressableM: 0, fte: 46 },
      { function: highA, loadedCostM: 4.8, addressableM: 3.4, fte: 42 },
      { function: retainB, loadedCostM: 3.4, addressableM: 0.4, fte: 28 },
      { function: highB, loadedCostM: 3.1, addressableM: 2.6, fte: 31 },
      { function: midA, loadedCostM: 2.6, addressableM: 1.1, fte: 24 },
      { function: midB, loadedCostM: 2.2, addressableM: 0.4, fte: 19 },
    ],

    moveCaption: `Density is highest in the ${highB} and the ${highA} delivery layer; ${retainA} scores Low at every level.`,
    heatRows: [
      { function: highB, model: "Lift-out", junior: 80, mid: 73, senior: 69, lead: 59 },
      { function: highA, model: "Hybrid", junior: 78, mid: 74, senior: 62, lead: 47 },
      { function: midA, model: "Role-by-role", junior: 74, mid: 66, senior: 54, lead: 38 },
      { function: midB, model: "Role-by-role", junior: null, mid: 64, senior: 55, lead: 40 },
      { function: retainB, model: "Retain", junior: 43, mid: 48, senior: 41, lead: 34 },
      { function: retainA, model: "Retain", junior: 28, mid: null, senior: 24, lead: 9 },
    ],
    heatRollup: "Leadership is always retained; cells shown neutral.",
    movers: [
      { id: "SUP-073", function: highB, level: "Mid", band: "High", savingPerYear: "$67K" },
      { id: "SUP-031", function: highB, level: "Mid", band: "High", savingPerYear: "$56K" },
      { id: "ENR-009", function: highA, level: "Mid", band: "High", savingPerYear: "$53K" },
      { id: "ENR-029", function: highA, level: "Junior", band: "High", savingPerYear: "$52K" },
      { id: "FIN-009", function: midA, level: "Mid", band: "High", savingPerYear: "$52K" },
      { id: "SUP-069", function: highB, level: "Junior", band: "High", savingPerYear: "$49K" },
      { id: "ENR-075", function: highA, level: "Mid", band: "High", savingPerYear: "$48K" },
      { id: "FIN-014", function: midA, level: "Mid", band: "High", savingPerYear: "$47K" },
      { id: "ENR-018", function: highA, level: "Senior", band: "Medium", savingPerYear: "$47K" },
      { id: "SUP-017", function: highB, level: "Mid", band: "High", savingPerYear: "$46K" },
    ],
    moversRollup: "+ 38 further roles worth $1.9M/yr — full list in Detail.",

    saveCaption:
      "Base case $2.4M run-rate on 48 FTE-equivalents; conservative floor $1.6M shown beside it — plan on base, underwrite the floor.",
    bridge: [
      { label: "Cost of moved roles", value: "$4.0M", amount: 4.0, tone: "ink" },
      { label: "Offshore cost", value: "$1.6M", amount: 1.6, tone: "pale" },
      { label: "Run-rate saving", value: "$2.4M", amount: 2.4, tone: "gold" },
      { label: "Year-1 ramp", value: "$1.1M", amount: 1.1, tone: "pale" },
      { label: "Transition one-off", value: "$1.4M", amount: 1.4, tone: "pale" },
      { label: "Year-1 net", value: "$0.1M", amount: 0.1, tone: "gold" },
    ],
    scenarios: [
      { name: "Conservative", fte: "36", runRate: "$1.6M", net3: "$3.2M", payback: "19 mo" },
      { name: "Base", headline: true, fte: "48", runRate: "$2.4M", net3: "$5.1M", payback: "14 mo" },
      { name: "Aggressive", fte: "61", runRate: "$3.4M", net3: "$7.6M", payback: "11 mo" },
    ],
    scenariosRollup: "Scenario definitions and full year-by-year figures in Detail.",

    wavesCaption: `Lift out the ${highB} first, then the ${highA} delivery layer; the capped ${retainA} band never moves.`,
    waves: [
      {
        n: "Wave 1",
        from: "from month 0",
        title: "Quick wins",
        rolesMoving: "14",
        loadedCost: "$1.4M",
        runRate: "$0.7M",
        functions: [highB],
        gates: [
          "Sourcing partner selected and contracted",
          "Ticket-system access and knowledge base export agreed",
          "Retained onshore owner named",
        ],
      },
      {
        n: "Wave 2",
        from: "from month 5",
        title: "Core transition",
        rolesMoving: "18",
        loadedCost: "$2.1M",
        runRate: "$0.9M",
        functions: [highA, midA],
        gates: [
          "Client MSA review completed where offshore delivery requires consent",
          "Named-senior knowledge-transfer plans agreed",
          "Offshore pod leads hired and shadowing before any onshore exit",
        ],
      },
      {
        n: "Wave 3",
        from: "from month 10",
        title: "Complex & hybrid",
        rolesMoving: "16",
        loadedCost: "$1.9M",
        runRate: "$0.8M",
        functions: [midA, midB, retainB],
        gates: [
          "Compliance opinion signed off",
          "Wave 1–2 service-quality evidence reviewed with portco leadership",
          "Annual close completed before finance roles move",
        ],
      },
    ],
    wavesSequence: `Wave 1 lifts out the ${highB}: 14 roles and $0.7M run-rate, chosen because it is self-contained and already remote, and it establishes the vendor framework. Wave 2 is the core: 18 roles across ${highA} and ${midA}. Wave 3 carries the remaining hybrid roles, gated on the service-quality evidence from the first two waves.`,

    risksCaption:
      "The binding risks are contractual and relational, not technical: named account contacts, undocumented exception handling, and the finance close calendar.",
    risks: [
      {
        risk: `Three ${highA} specialists are the named contacts for the top five institutional accounts.`,
        impact: "High",
        mitigation: "Keep those three onshore through Wave 1; shadow before any move.",
        owner: "Portco",
      },
      {
        risk: "No written SOP for exception handling in the current queue.",
        impact: "High",
        mitigation: "Four-week playbook sprint before Wave 1 go-live.",
        owner: "Joint",
      },
      {
        risk: "Finance close calendar overlaps Wave 3.",
        impact: "Medium",
        mitigation: "Hold Wave 3 until after the next annual close.",
        owner: "Portco",
      },
      {
        risk: "Sourcing partner SLA is not yet drafted.",
        impact: "Medium",
        mitigation: "Renovus operating partner issues a one-page SLA before vendor shortlist.",
        owner: "Renovus",
      },
      {
        risk: `Manager span in the ${highB} is already 1:14.`,
        impact: "Low",
        mitigation: "Add a vendor team lead; do not add portco headcount.",
        owner: "Vendor",
      },
    ],
    nextSteps: [
      {
        step: "Operating review of this assessment; confirm base case as the planning number",
        owner: "Renovus",
        timing: "Weeks 1–2",
      },
      {
        step: "Confirm the 40% offshore cost assumption with the deal team",
        owner: "Renovus",
        timing: "Weeks 1–2",
      },
      {
        step: `Name the three ${highA} account contacts to retain onshore`,
        owner: "Portco",
        timing: "Weeks 2–4",
      },
      { step: "RFP to 2–3 sourcing partners covering Wave 1", owner: "Renovus", timing: "Weeks 3–6" },
      {
        step: "Baseline SLAs and service metrics captured for the Wave 1 scope",
        owner: "Portco",
        timing: "Weeks 4–8",
      },
      { step: "Wave 1 transition begins", owner: "Vendor", timing: "Month 3" },
    ],

    detailApproach: [
      `We scored every in-scope role at ${companyName} against a five-part rubric, then rolled the role scores up to function and level. Nothing in this report is a headcount decision; it is a view of which work is structurally movable.`,
      "Loaded cost is base salary plus employer taxes and benefits, taken from the payroll extract. Where no pay data was supplied, we applied sector benchmark bands and flagged the function as estimate-only.",
    ],
    scoringDimensions: [
      { name: "Codifiability", detail: "Is the work written down, or does it live in someone's head?" },
      { name: "Interaction", detail: "How much of the role is live, named-client contact?" },
      { name: "Constraint", detail: "Licensing, accreditation, data residency, or contractual limits." },
      { name: "Supervision", detail: "How much onshore oversight the work needs to stay correct." },
      { name: "Continuity", detail: "What breaks if the person leaves next month." },
    ],
    modelRows: [
      {
        function: highB,
        fte: 31,
        loadedCost: "$3.1M",
        model: "Lift-out",
        rationale: "Self-contained, queue-driven, already remote.",
      },
      {
        function: highA,
        fte: 42,
        loadedCost: "$4.8M",
        model: "Hybrid",
        rationale: "Back-office moves; named-account contacts stay onshore.",
      },
      {
        function: midA,
        fte: 24,
        loadedCost: "$2.6M",
        model: "Role-by-role",
        rationale: "Transactional roles move; controls and close stay.",
      },
      {
        function: midB,
        fte: 19,
        loadedCost: "$2.2M",
        model: "Role-by-role",
        rationale: "Application support moves; architecture stays.",
      },
      {
        function: retainB,
        fte: 28,
        loadedCost: "$3.4M",
        model: "Retain",
        rationale: "On-call and physical infrastructure dependencies.",
      },
      {
        function: retainA,
        fte: 46,
        loadedCost: "$5.9M",
        model: "Retain",
        rationale: "Licence- and accreditation-capped.",
      },
    ],
    assumptions: [
      { assumption: "Offshore loaded cost", value: "40% of onshore", source: "Deal team" },
      { assumption: "Transition one-off", value: "$1.4M", source: "Renovus benchmark" },
      { assumption: "Ramp to steady state", value: "6 months", source: "Renovus benchmark" },
      { assumption: "Parallel-run overlap", value: "20%", source: "Renovus benchmark" },
      { assumption: "Recruit / onboarding fee", value: "15% of first-year cost", source: "Vendor range" },
      { assumption: "Attrition allowance", value: "18% p.a. offshore", source: "Sector benchmark" },
      { assumption: "Exit multiple", value: "12×", source: "Deal model" },
      { assumption: "Discount rate", value: "Not applied — nominal figures", source: "This report" },
    ],
    methodology: [
      "Scores are deterministic given the inputs: the same payroll extract and the same discovery answers produce the same bands. Where a score sits within three points of a band boundary, we round toward retaining the role onshore.",
      "Savings are expressed as run-rate at steady state, net of offshore cost and the parallel-run overlap. Transition one-offs are charged in the year they occur, which is why year-1 net is close to zero in the base case.",
    ],
  };
}
