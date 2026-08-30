import type { OffshoringQuestion } from "@/types/offshoring";

/**
 * Discovery bank from docs/offshoring/references/discovery-questions.md
 * (Renovus Workforce Sourcing Assessment skill).
 */

export const ROUND_1_BASE_IDS = ["d1-q1-scope", "d1-q2-sector"] as const;
export const ROUND_1_TIER_AB_ID = "d1-q3-tier-ab";
export const ROUND_1_TIER_C_ID = "d1-q3-tier-c";

export const ROUND_2_IDS = [
  "d2-q1-offshore-cost",
  "d2-q2-transition",
  "d2-q3-constraints",
] as const;

export const ROUND_3_IDS = [
  "d3-q1-sanity",
  "d3-q2-scenario",
  "d3-q3-audience",
] as const;

export const VALUE_CREATION_ID = "d4-value-creation";

export const offshoringQuestions: OffshoringQuestion[] = [
  // ── Round 1 ───────────────────────────────────────────────────────────
  {
    id: "d1-q1-scope",
    section: "round-1",
    question: "Assess all of these, or narrow scope?",
    description: "Function list is shown in the agent framing above.",
    type: "single-choice",
    required: true,
    supportsText: false,
    supportsSpeech: false,
    asksConfidence: false,
    order: 1,
    options: [
      { id: "all", label: "All functions" },
      { id: "back-office", label: "Back-office / delivery only (exclude client-facing)" },
      { id: "pick", label: "Let me pick" },
      { id: "exclude-clinical", label: "Exclude clinical/licensed roles, assess the rest" },
    ],
    clarifications: [
      {
        id: "d1-q1-pick",
        whenOptionIds: ["pick"],
        prompt: "Which functions should we include?",
        inputType: "multiple-choice",
        optionsFromFunctions: true,
        required: true,
      },
    ],
  },
  {
    id: "d1-q2-sector",
    section: "round-1",
    question:
      "Which sector and stage is this portco in? It changes the constraints I apply and how savings are framed.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 2,
    options: [
      { id: "healthcare-early", label: "Healthcare services — early hold (year 0–1)" },
      { id: "healthcare-late", label: "Healthcare services — mid/late hold" },
      { id: "education", label: "Education — any stage" },
      { id: "tech-early", label: "Technology / Professional services — early hold" },
      { id: "tech-late", label: "Technology / Professional services — mid/late hold" },
      { id: "describe", label: "I'll describe it" },
    ],
    clarifications: [
      {
        id: "d1-q2-describe",
        whenOptionIds: ["describe"],
        prompt: "Briefly describe the sector and hold stage.",
        inputType: "text",
        required: true,
      },
    ],
  },
  {
    id: "d1-q3-tier-ab",
    section: "round-1",
    question:
      "Any headcount already planned to change (hiring freeze, planned reductions, open reqs, pending add-on integration) that the model should reflect?",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 3,
    options: [
      { id: "as-is", label: "No, use as-is" },
      { id: "exclude-reqs", label: "Exclude open reqs" },
      { id: "include-reqs", label: "Include open reqs as future roles" },
      { id: "addon", label: "There's an add-on integration in flight (I'll explain)" },
    ],
    clarifications: [
      {
        id: "d1-q3-addon",
        whenOptionIds: ["addon"],
        prompt: "What should the model reflect about the add-on integration?",
        inputType: "text",
        required: true,
      },
    ],
  },
  {
    id: "d1-q3-tier-c",
    section: "round-1",
    question: "No pay data in the file. How should we get to cost?",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 3,
    options: [
      { id: "bands", label: "I'll give salary bands per function" },
      { id: "blended", label: "Use one blended average per level (I'll type)" },
      { id: "potential-only", label: "Skip savings, potential only" },
    ],
    clarifications: [
      {
        id: "d1-q3-bands",
        whenOptionIds: ["bands", "blended"],
        prompt:
          "Share bands or a blended average (function → Junior/Mid/Senior/Lead, or one figure per level).",
        inputType: "text",
        required: true,
      },
    ],
  },

  // ── Round 2 ───────────────────────────────────────────────────────────
  {
    id: "d2-q1-offshore-cost",
    section: "round-2",
    question:
      "What blended offshore/nearshore cost should I assume, as a share of onshore loaded cost? Use your vendor quotes or benchmarks from other Renovus portcos if you have them.",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 4,
    options: [
      { id: "30", label: "~30% across the board" },
      { id: "40", label: "~40% across the board" },
      { id: "split", label: "Tech 40% / back-office 30%" },
      { id: "per-function", label: "I'll give a figure per function (from vendor quotes)" },
    ],
    clarifications: [
      {
        id: "d2-q1-per-function",
        whenOptionIds: ["per-function"],
        prompt: "List offshore cost as % of onshore loaded cost for each function in scope.",
        inputType: "text",
        required: true,
      },
    ],
  },
  {
    id: "d2-q2-transition",
    section: "round-2",
    question: "How should transition costs and ramp be modeled?",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 5,
    options: [
      {
        id: "standard",
        label: "Standard (15% recruit/onboarding fee, 2-month overlap, 60% year-1 realization)",
      },
      {
        id: "lighter",
        label: "Lighter — vendor absorbs setup (no fee, 1-month overlap, 75% year-1)",
      },
      {
        id: "heavier",
        label: "Heavier — complex knowledge transfer (20% fee, 3-month overlap, 50% year-1)",
      },
      { id: "specify", label: "I'll specify" },
    ],
    clarifications: [
      {
        id: "d2-q2-specify",
        whenOptionIds: ["specify"],
        prompt: "Specify fee %, overlap months, and year-1 realization.",
        inputType: "text",
        required: true,
      },
    ],
  },
  {
    id: "d2-q3-constraints",
    section: "round-2",
    question: "Anything that caps what can move offshore at this portco?",
    type: "multiple-choice",
    required: true,
    supportsText: false,
    supportsSpeech: false,
    asksConfidence: false,
    order: 6,
    options: [
      { id: "regulated", label: "Regulated data (PHI / PCI / FERPA / financial core) in some teams" },
      { id: "contracts", label: "Client or payer contracts require onshore staff" },
      { id: "licensure", label: "Licensure / accreditation requires onshore or in-state roles" },
      { id: "union", label: "Union / works council / WARN exposure" },
      { id: "timezone", label: "Time-zone overlap required for some roles" },
      { id: "none", label: "None" },
    ],
    clarifications: [
      {
        id: "d2-q3-where",
        whenOptionIds: ["regulated", "contracts", "licensure", "union", "timezone"],
        prompt: "Which functions or roles do those constraints apply to?",
        inputType: "text",
        required: true,
      },
    ],
  },

  // ── Round 3 ───────────────────────────────────────────────────────────
  {
    id: "d3-q1-sanity",
    section: "round-3",
    question: "Does the heatmap match your read of the business?",
    type: "single-choice",
    required: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 7,
    options: [
      { id: "yes", label: "Yes, proceed" },
      { id: "over", label: "A function is over-scored (I'll say which)" },
      { id: "under", label: "A function is under-scored (I'll say which)" },
      { id: "roles", label: "Specific roles need changes (I'll list IDs)" },
    ],
    clarifications: [
      {
        id: "d3-q1-adjust",
        whenOptionIds: ["over", "under", "roles"],
        prompt: "Which functions or role IDs should change, and in which direction?",
        inputType: "text",
        required: true,
      },
    ],
  },
  {
    id: "d3-q2-scenario",
    section: "round-3",
    question: "Which scenario leads the executive summary?",
    type: "single-choice",
    required: true,
    supportsText: false,
    supportsSpeech: false,
    asksConfidence: false,
    order: 8,
    options: [
      { id: "base", label: "Base (High + half of Medium)" },
      { id: "conservative", label: "Conservative (High only, discounted)" },
      { id: "aggressive", label: "Aggressive (High + all Medium)" },
      { id: "base-floor", label: "Show base with conservative as the floor" },
    ],
  },
  {
    id: "d3-q3-audience",
    section: "round-3",
    question: "How should the recommendation be framed, and who reads this first?",
    type: "single-choice",
    required: true,
    supportsText: false,
    supportsSpeech: false,
    asksConfidence: false,
    order: 9,
    options: [
      {
        id: "vendor-portco",
        label: "Vendor-led managed service per function — report goes to portco CEO/CFO",
      },
      {
        id: "staff-aug",
        label: "Staff augmentation into portco teams — report goes to portco CEO/CFO",
      },
      {
        id: "internal",
        label: "Renovus-internal first (IC / ops review), recommend model per function",
      },
      {
        id: "bot",
        label: "Build-operate-transfer / captive worth exploring — flag it",
      },
    ],
  },

  // ── Value creation ────────────────────────────────────────────────────
  {
    id: "d4-value-creation",
    section: "value-creation",
    question:
      "Optional but recommended: what's the portco's current EBITDA (and revenue if handy), and what exit multiple does the deal model use? I'll express the savings as EBITDA uplift and implied enterprise value at exit.",
    type: "single-choice",
    required: true,
    optional: true,
    supportsText: true,
    supportsSpeech: true,
    asksConfidence: false,
    order: 10,
    options: [{ id: "skip", label: "Skip — cost savings only" }],
  },
];

export function getOffshoringQuestion(id: string): OffshoringQuestion | undefined {
  return offshoringQuestions.find((question) => question.id === id);
}

export function buildRound1Queue(dataTier: "A" | "B" | "C"): string[] {
  const q3 = dataTier === "C" ? ROUND_1_TIER_C_ID : ROUND_1_TIER_AB_ID;
  return [...ROUND_1_BASE_IDS, q3];
}

export function buildFullDiscoveryQueue(dataTier: "A" | "B" | "C"): string[] {
  return [
    ...buildRound1Queue(dataTier),
    ...ROUND_2_IDS,
    ...ROUND_3_IDS,
    VALUE_CREATION_ID,
  ];
}

export function phaseForQuestionId(
  questionId: string,
): "round1" | "round2" | "round3" | "value-creation" {
  if (questionId.startsWith("d1-")) return "round1";
  if (questionId.startsWith("d2-")) return "round2";
  if (questionId.startsWith("d3-")) return "round3";
  return "value-creation";
}
