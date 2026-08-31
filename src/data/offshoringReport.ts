import type { Sector } from "@/types/company";
import {
  getOffshoringProfile,
  type SlotKey,
} from "./offshoringProfiles";

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





export interface ReportScenario {
  name: string;
  headline?: boolean;
  /** What the scenario assumes, so a reader can judge it without the appendix. */
  basis: string;
  pctOfLabour: string;
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

/** One row of "What can move": a composite score, not a level-by-level grid. */
export interface ReportMoveRow {
  function: string;
  /** 0–100 composite. High >= 70, Medium 45–69, Low < 45. */
  score: number;
  band: ReportBand;
  engagementModel: SourcingModel;
  addressable: string;
  primaryConstraint: string;
}

/** One row of the cost table, with its share of the total for the inline bar. */
export interface ReportShareRow {
  function: string;
  fte: number;
  loadedCost: string;
  /** 0–100, drives the bar width. */
  sharePct: number;
}

export interface ReportSavingRow {
  function: string;
  saving: string;
}

/** Year-by-year cash, so year-1 transition drag is visible rather than implied. */
export interface ReportCashRow {
  period: string;
  grossSaving: string;
  oneOffs: string;
  net: string;
}

export interface ReportGate {
  gate: string;
  test: string;
  owner: ReportOwner;
}

export interface OffshoringReportData {
  reportDate: string;
  preparedFor: string;
  preparedBy: string;
  confidentiality: string;

  /** Sub-title under the headline: basis, headcount, total cost. */
  subline: string;
  answerHeadlineValue: string;
  answerHeadlineRest: string;
  summaryExec: string;
  conservativeFloor: string;
  kpis: ReportKpi[];

  costCaption: string;
  costStats: ReportStat[];
  costRows: ReportShareRow[];

  moveCaption: string;
  moveRows: ReportMoveRow[];
  moveRollup: string;

  saveCaption: string;
  scenarios: ReportScenario[];
  savingByFunction: ReportSavingRow[];
  cashProfile: ReportCashRow[];
  scenariosRollup: string;

  wavesCaption: string;
  waves: ReportWave[];
  wavesSequence: string;
  gates: ReportGate[];
  retainedOnshore: string;

  risksCaption: string;
  risks: ReportRisk[];
  nextSteps: ReportNextStep[];
  /** Closing callout on the risks tab. */
  flag: string;

  detailApproach: string[];
  scoringDimensions: { name: string; detail: string }[];
  modelRows: ReportModelRow[];
  assumptions: ReportAssumption[];
  methodology: string[];
  dataTier: string;
  constraintCeilings: string[];
  functionRollup: string;
  dataQuality: string[];
  notModelled: string[];
  reconciliation: string;
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

/** $M to one decimal, e.g. 2.4 → "$2.4M". Signed for the year-1 net. */
function m(value: number): string {
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  return `${rounded < 0 ? "-" : ""}$${Math.abs(rounded).toFixed(1)}M`;
}

const WORD_MONTHS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function monthsWord(n: number): string {
  return WORD_MONTHS[n] ?? `${n}`;
}



export function getMockOffshoringReport(
  companyName: string,
  sector: Sector = "Education",
): OffshoringReportData {
  const profile = getOffshoringProfile(companyName, sector);
  const set = FUNCTION_SETS[profile.sector] ?? FUNCTION_SETS.Education;

  const label: Record<SlotKey, string> = {
    retainA: profile.labels?.retainA ?? set.retain[0],
    retainB: profile.labels?.retainB ?? set.retain[1],
    highA: profile.labels?.highA ?? set.high[0],
    highB: profile.labels?.highB ?? set.high[1],
    midA: profile.labels?.midA ?? set.mid[0],
    midB: profile.labels?.midB ?? set.mid[1],
  };
  const highA = label.highA;
  const highB = label.highB;
  const midA = label.midA;
  const midB = label.midB;
  const retainA = label.retainA;
  const retainB = label.retainB;

  const slotOrder: SlotKey[] = ["retainA", "highA", "retainB", "highB", "midA", "midB"];
  const slots = profile.slots;

  // ── Everything below is derived, so a profile change stays consistent ──
  const payrollM = slotOrder.reduce((sum, key) => sum + slots[key].costM, 0);
  const addressableM = slotOrder.reduce((sum, key) => sum + slots[key].addressableM, 0);
  const addressableFte = slotOrder.reduce((sum, key) => sum + slots[key].addressableFte, 0);
  const addressablePct = Math.round((addressableFte / profile.totalFte) * 100);

  const rate = profile.offshoreRatePct / 100;
  const movedCostM = addressableM * profile.movedShareOfAddressable;
  const offshoreCostM = movedCostM * rate;
  const annualSaveM = movedCostM - offshoreCostM;
  const net3M = annualSaveM * 3 - profile.transitionM - profile.rampM;
  // Payback carries the ramp as well as the one-off: nothing is repaid until
  // both are recovered, which is why this lands near a year, not a quarter.
  const upfrontM = profile.transitionM + profile.rampM;
  const paybackMo = Math.max(1, Math.round((upfrontM / annualSaveM) * 12));

  const floorRunRateM = annualSaveM * 0.67;
  const floorNet3M = floorRunRateM * 3 - profile.transitionM - profile.rampM;
  const floorFte = Math.round(addressableFte * 0.75);
  const floorPaybackMo = Math.max(
    1,
    Math.round((upfrontM / floorRunRateM) * 12),
  );

  const aggrRunRateM = annualSaveM * 1.42;
  const aggrNet3M = aggrRunRateM * 3 - profile.transitionM - profile.rampM;
  const aggrFte = Math.round(addressableFte * 1.27);
  const aggrPaybackMo = Math.max(
    1,
    Math.round((upfrontM / aggrRunRateM) * 12),
  );

  // Cost table, richest function first, each row carrying its share of total.
  const costRows: ReportShareRow[] = slotOrder
    .map((key) => ({
      function: label[key],
      fte: slots[key].fte,
      loadedCost: m(slots[key].costM),
      sharePct: Math.round((slots[key].costM / payrollM) * 100),
      sortKey: slots[key].costM,
    }))
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((row): ReportShareRow => ({
      function: row.function,
      fte: row.fte,
      loadedCost: row.loadedCost,
      sharePct: row.sharePct,
    }));

  const byCost = [...slotOrder].sort((a, b) => slots[b].costM - slots[a].costM);
  const topTwoShare = Math.round(
    ((slots[byCost[0]].costM + slots[byCost[1]].costM) / payrollM) * 100,
  );
  const topFourShare = Math.round(
    (byCost.slice(0, 4).reduce((sum, key) => sum + slots[key].costM, 0) / payrollM) * 100,
  );

  const modelFor = (key: SlotKey): SourcingModel => {
    if (key === "retainA" || key === "retainB") return "Retain";
    if (key === "highB") return "Lift-out";
    if (key === "highA") return "Hybrid";
    return "Role-by-role";
  };

  /*
   * One composite score per function, replacing the level-by-level grid. The
   * junior and mid bands are weighted hardest: that is where the movable volume
   * actually sits, so a flat mean would understate a function with a deep
   * junior layer and overstate one that is mostly leads.
   */
  const LEVEL_WEIGHTS = [0.35, 0.3, 0.22, 0.13];
  const scoreFor = (key: SlotKey): number => {
    const heat = slots[key].heat;
    let total = 0;
    let weight = 0;
    heat.forEach((value, index) => {
      if (value === null) return;
      total += value * LEVEL_WEIGHTS[index];
      weight += LEVEL_WEIGHTS[index];
    });
    return weight === 0 ? 0 : Math.round(total / weight);
  };

  const bandFor = (score: number): ReportBand =>
    score >= 70 ? "High" : score >= 45 ? "Medium" : "Low";

  const moveRows: ReportMoveRow[] = [...slotOrder]
    .map((key) => ({ key, score: scoreFor(key) }))
    .sort((a, b) => b.score - a.score)
    .map(({ key, score }) => ({
      function: label[key],
      score,
      band: bandFor(score),
      engagementModel: modelFor(key),
      addressable: slots[key].addressableM === 0 ? "—" : m(slots[key].addressableM),
      primaryConstraint: slots[key].primaryConstraint,
    }));

  const savingByFunction: ReportSavingRow[] = [...slotOrder]
    .filter((key) => slots[key].addressableM > 0)
    .map((key) => ({
      key,
      saving: slots[key].addressableM * profile.movedShareOfAddressable * (1 - rate),
    }))
    .sort((a, b) => b.saving - a.saving)
    .map(({ key, saving }) => ({ function: label[key], saving: m(saving) }));

  // Year 1 carries the ramp and the one-offs, so it reads negative on purpose.
  const year1Gross = annualSaveM * 0.45;
  const cashProfile: ReportCashRow[] = [
    {
      period: "Year 1 (6-mo ramp)",
      grossSaving: m(year1Gross),
      oneOffs: `(${m(profile.transitionM + profile.rampM)})`,
      net: m(year1Gross - profile.transitionM - profile.rampM),
    },
    { period: "Year 2", grossSaving: m(annualSaveM), oneOffs: "—", net: m(annualSaveM) },
    { period: "Year 3", grossSaving: m(annualSaveM), oneOffs: "—", net: m(annualSaveM) },
  ];


  // Waves: quick wins, core, then the hybrid remainder.
  const waveSplit = [0.29, 0.375, 0.335];
  const waveFte = [
    Math.round(addressableFte * waveSplit[0]),
    Math.round(addressableFte * waveSplit[1]),
    0,
  ];
  waveFte[2] = addressableFte - waveFte[0] - waveFte[1];
  const waveCostM = waveSplit.map((share) => movedCostM * share);
  const waveRunM = waveCostM.map((cost) => cost * (1 - rate));
  const waveStart = [0, Math.max(3, Math.round(paybackMo * 0.36)), Math.max(6, Math.round(paybackMo * 0.72))];

  const namedSlotLabel = label[profile.namedContacts.slot];

  return {
    reportDate: "30 August 2026",
    preparedFor: companyName,
    preparedBy: "Renovus Capital · Portfolio Operations",
    confidentiality: "Confidential — Renovus Capital internal (IC / operating review)",

    subline: `Base case · ${profile.totalFte} employees · ${m(payrollM)} fully-burdened annual labour cost`,
    answerHeadlineValue: m(annualSaveM),
    answerHeadlineRest: `a year is addressable across 6 functions at ${companyName}`,
    summaryExec: `We assessed all ${profile.totalFte} roles and ${m(payrollM)} of loaded payroll at ${companyName} against a five-part sourcing rubric. ${addressableFte} roles — ${addressablePct}% of the workforce, ${m(addressableM)} of cost — are addressable, led by ${highA} and the ${highB}. At offshore rates of ${profile.offshoreRatePct}% of onshore cost, the base case saves ${m(annualSaveM)} a year and ${m(net3M)} net over three years, repaying transition costs in about ${monthsWord(paybackMo)} months. We would lift out ${highB} first, then move the ${highA} delivery layer. The caveat: ${retainA} is ${profile.constraintNote}, so it stays onshore entirely.`,
    conservativeFloor: `Conservative floor: ${m(floorRunRateM)} run-rate and ${m(floorNet3M)} 3-year net if only High-scoring roles move at discounted rates.`,
    kpis: [
      {
        label: "Annual run-rate saving",
        value: m(annualSaveM),
        hint: "Base case, steady state",
        lead: true,
      },
      {
        label: "Addressable FTEs",
        value: String(addressableFte),
        suffix: `/ ${profile.totalFte}`,
        hint: `${addressablePct}% of in-scope roles`,
      },
      { label: "3-year net", value: m(net3M), hint: "Cumulative, after transition costs" },
      {
        label: "Payback",
        value: `${paybackMo} mo`,
        hint: `Transition one-off ${m(profile.transitionM)}`,
      },
    ],

    costCaption: `${label[byCost[0]]} (${m(slots[byCost[0]].costM)}) and ${label[byCost[1]]} (${m(slots[byCost[1]].costM)}) carry ${topTwoShare}% of the cost base; the top four functions carry ${topFourShare}%.`,
    costStats: [
      { label: "In-scope FTEs", value: String(profile.totalFte) },
      { label: "Loaded cost in scope", value: m(payrollM) },
      { label: "Functions", value: "6" },
      { label: "Addressable loaded cost", value: m(addressableM) },
    ],
    costRows,

    moveCaption: `Composite outsourceability score 0–100 · High ≥ 70 · Medium 45–69 · Low < 45. Density is highest in the ${highB} and the ${highA} delivery layer; ${retainA} scores Low at every level.`,
    moveRows,
    moveRollup: `${moveRows.filter((row) => row.band === "High").length} functions score High, carrying ${m(addressableM)} of addressable cost. Leadership is retained in every case.`,

    saveCaption: `Base case ${m(annualSaveM)} run-rate on ${addressableFte} FTE-equivalents; conservative floor ${m(floorRunRateM)} shown beside it — plan on base, underwrite the floor.`,
    savingByFunction,
    cashProfile,
    scenarios: [
      {
        name: "Conservative",
        basis: "High-band roles only, no medium-band credit",
        pctOfLabour: `${Math.round((floorRunRateM / payrollM) * 100)}%`,
        fte: String(floorFte),
        runRate: m(floorRunRateM),
        net3: m(floorNet3M),
        payback: `${floorPaybackMo} mo`,
      },
      {
        name: "Base",
        headline: true,
        basis: `High and medium bands at ${profile.offshoreRatePct}% offshore cost`,
        pctOfLabour: `${Math.round((annualSaveM / payrollM) * 100)}%`,
        fte: String(addressableFte),
        runRate: m(annualSaveM),
        net3: m(net3M),
        payback: `${paybackMo} mo`,
      },
      {
        name: "Aggressive",
        basis: "Adds low-band transactional roles and deeper leadership spans",
        pctOfLabour: `${Math.round((aggrRunRateM / payrollM) * 100)}%`,
        fte: String(aggrFte),
        runRate: m(aggrRunRateM),
        net3: m(aggrNet3M),
        payback: `${aggrPaybackMo} mo`,
      },
    ],
    scenariosRollup: "Scenario definitions and full year-by-year figures in Detail.",

    wavesCaption: `Lift out the ${highB} first, then the ${highA} delivery layer; the ${profile.constraintNote} ${retainA} band never moves.`,
    waves: [
      {
        n: "Wave 1",
        from: `from month ${waveStart[0]}`,
        title: "Quick wins",
        rolesMoving: String(waveFte[0]),
        loadedCost: m(waveCostM[0]),
        runRate: m(waveRunM[0]),
        functions: [highB],
        gates: [
          "Sourcing partner selected and contracted",
          "Ticket-system access and knowledge base export agreed",
          "Retained onshore owner named",
        ],
      },
      {
        n: "Wave 2",
        from: `from month ${waveStart[1]}`,
        title: "Core transition",
        rolesMoving: String(waveFte[1]),
        loadedCost: m(waveCostM[1]),
        runRate: m(waveRunM[1]),
        functions: [highA, midA],
        gates: [
          "Client MSA review completed where offshore delivery requires consent",
          "Named-senior knowledge-transfer plans agreed",
          "Offshore pod leads hired and shadowing before any onshore exit",
        ],
      },
      {
        n: "Wave 3",
        from: `from month ${waveStart[2]}`,
        title: "Complex & hybrid",
        rolesMoving: String(waveFte[2]),
        loadedCost: m(waveCostM[2]),
        runRate: m(waveRunM[2]),
        functions: [midA, midB, retainB],
        gates: [
          "Compliance opinion signed off",
          "Wave 1–2 service-quality evidence reviewed with portco leadership",
          "Annual close completed before finance roles move",
        ],
      },
    ],
    wavesSequence: `Wave 1 lifts out the ${highB}: ${waveFte[0]} roles and ${m(waveRunM[0])} run-rate, chosen because it is self-contained and already remote, and it establishes the vendor framework. Wave 2 is the core: ${waveFte[1]} roles across ${highA} and ${midA}. Wave 3 carries the remaining ${waveFte[2]} hybrid roles, gated on the service-quality evidence from the first two waves.`,

    gates: [
      {
        gate: "Pre-wave",
        test: `Process documented, SLAs signed, ${profile.constraintNote} controls audited`,
        owner: "Joint",
      },
      {
        gate: "Overlap exit",
        test: "Partner hits 90% of the onshore quality baseline for four consecutive weeks",
        owner: "Vendor",
      },
      {
        gate: "Wave close",
        test: "Run-rate saving verified against payroll; no SLA breach outstanding",
        owner: "Renovus",
      },
      {
        gate: "Wave 3 entry",
        test: `Waves 1–2 at full run-rate; attrition within ${profile.attritionPct}% of plan`,
        owner: "Renovus",
      },
    ],
    retainedOnshore: `${retainA} and ${retainB} stay onshore in full — ${slots.retainA.fte + slots.retainB.fte} roles and ${m(slots.retainA.costM + slots.retainB.costM)} of cost. ${retainA} is ${profile.constraintNote}, and ${retainB} carries on-call and physical-access dependencies. All leadership is retained regardless of function score.`,

    risksCaption:
      "The binding risks are contractual and relational, not technical: named account contacts, undocumented exception handling, and the finance close calendar.",
    risks: [
      {
        risk: `${profile.namedContacts.count} ${namedSlotLabel} specialists are the named contacts for the ${profile.namedContacts.accounts}.`,
        impact: "High",
        mitigation: `Keep those ${profile.namedContacts.count} onshore through Wave 1; shadow before any move.`,
        owner: "Portco",
      },
      {
        risk: "No written SOP for exception handling in the current queue.",
        impact: "High",
        mitigation: "Four-week playbook sprint before Wave 1 go-live.",
        owner: "Joint",
      },
      {
        risk: `Finance close calendar overlaps Wave 3 (from month ${waveStart[2]}).`,
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
        risk: `Manager span in the ${highB} is already ${profile.managerSpan}.`,
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
        step: `Confirm the ${profile.offshoreRatePct}% offshore cost assumption with the deal team`,
        owner: "Renovus",
        timing: "Weeks 1–2",
      },
      {
        step: `Name the ${profile.namedContacts.count} ${namedSlotLabel} account contacts to retain onshore`,
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

    flag: `Nothing here is a headcount decision. The figures describe which work is structurally movable at ${profile.offshoreRatePct}% of onshore cost — sequencing, consultation and any people process sit with the portco.`,

    dataTier: `Tier A: a full payroll extract covering all ${profile.totalFte} in-scope roles, with base pay, employer taxes and benefits loaded per role. Function roll-up is ours; the department codes are the portco's.`,
    constraintCeilings: [
      `${retainA} — ${profile.constraintNote}. Scored but capped at Low; no roles move.`,
      `${retainB} — production access and on-call dependencies. Only ${m(slots.retainB.addressableM)} is judged movable.`,
      "Leadership at every level is retained, regardless of the function's score.",
    ],
    functionRollup: `The portco's department codes roll up to the six functions shown. Where a code spans two functions we assigned it to the one carrying the larger share of its cost, and flagged it below rather than splitting the roles.`,
    dataQuality: [
      "Bonus and commission are annualised from the trailing twelve months, so a light year understates a few roles.",
      "Contractor spend is out of scope: it is not in the payroll extract and we do not estimate it.",
      `Attrition is modelled at ${profile.attritionPct}% offshore, a sector benchmark rather than a partner commitment.`,
    ],
    notModelled: [
      "EBITDA and enterprise-value impact — the deal team supplied no current EBITDA, and we do not invent one.",
      "Severance, retention or redeployment cost, which depends on decisions the portco has not made.",
      "Currency movement and any partner rate escalators beyond year three.",
    ],
    reconciliation: `The six function costs sum to ${m(payrollM)}, matching the payroll extract. Addressable cost of ${m(addressableM)} is ${Math.round((addressableM / payrollM) * 100)}% of that; the ${m(movedCostM)} that actually moves in the base case is ${Math.round(profile.movedShareOfAddressable * 100)}% of the addressable pool, with the remainder held back by retained leadership and the constraints above.`,

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
    modelRows: slotOrder
      .map((key) => ({
        function: label[key],
        fte: slots[key].fte,
        loadedCost: m(slots[key].costM),
        model: modelFor(key),
        rationale: MODEL_RATIONALE[key],
      }))
      .sort((a, b) => b.fte - a.fte),
    assumptions: [
      {
        assumption: "Offshore loaded cost",
        value: `${profile.offshoreRatePct}% of onshore`,
        source: "Deal team",
      },
      { assumption: "Transition one-off", value: m(profile.transitionM), source: "Renovus benchmark" },
      { assumption: "Ramp to steady state", value: "6 months", source: "Renovus benchmark" },
      { assumption: "Parallel-run overlap", value: "20%", source: "Renovus benchmark" },
      { assumption: "Recruit / onboarding fee", value: "15% of first-year cost", source: "Vendor range" },
      {
        assumption: "Attrition allowance",
        value: `${profile.attritionPct}% p.a. offshore`,
        source: "Sector benchmark",
      },
      { assumption: "Exit multiple", value: profile.exitMultiple, source: "Deal model" },
      { assumption: "Discount rate", value: "Not applied — nominal figures", source: "This report" },
    ],
    methodology: [
      "Scores are deterministic given the inputs: the same payroll extract and the same discovery answers produce the same bands. Where a score sits within three points of a band boundary, we round toward retaining the role onshore.",
      "Savings are expressed as run-rate at steady state, net of offshore cost and the parallel-run overlap. Transition one-offs are charged in the year they occur, which is why year-1 net is close to zero in the base case.",
    ],
  };
}

const MODEL_RATIONALE: Record<SlotKey, string> = {
  highB: "Self-contained, queue-driven, already remote.",
  highA: "Back-office moves; named-account contacts stay onshore.",
  midA: "Transactional roles move; controls and close stay.",
  midB: "Application support moves; architecture stays.",
  retainB: "On-call and physical infrastructure dependencies.",
  retainA: "Licence- and accreditation-capped.",
};
