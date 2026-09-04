import type { Sector } from "@/types/company";

/**
 * Per-company drivers for the Workforce Sourcing report.
 *
 * The report used to hardcode one set of figures, so every company produced the
 * same numbers. Each company now supplies its own drivers and everything the
 * report shows — savings, payback, scenarios, waves, movers — is derived from
 * them, so a demo across several portcos holds together under scrutiny.
 *
 * `slots` are the six report functions in fixed roles: two retain-heavy, two
 * high-density, two middling. Labels come from the sector taxonomy unless a
 * profile overrides them. Costs are $M loaded; `addressableM` is the portion of
 * that cost the rubric scores as movable.
 */

export interface OffshoringFunctionSlot {
  /** Loaded cost for the function, $M. */
  costM: number;
  fte: number;
  /** Movable portion of `costM`. Zero for a fully retained function. */
  addressableM: number;
  /** Movable roles. Not derivable from cost — movable work skews junior. */
  addressableFte: number;
  /** Junior / Mid / Senior / Lead density scores. `null` renders as no cell. */
  heat: [number | null, number | null, number | null, number | null];
  /** Role-id prefix, e.g. "SUP" → SUP-073. */
  code: string;
  /** The binding limit on moving this function — last column of "What can move". */
  primaryConstraint: string;
}

export type SlotKey = "retainA" | "highA" | "retainB" | "highB" | "midA" | "midB";

export interface OffshoringProfile {
  sector: Sector;
  /** Total in-scope roles. Below company headcount — not everyone is in scope. */
  totalFte: number;
  /** Offshore loaded cost as a share of onshore. Drives every saving figure. */
  offshoreRatePct: number;
  /** Transition one-off, $M. Drives payback. */
  transitionM: number;
  /** Year-1 ramp cost, $M. */
  rampM: number;
  /**
   * Share of addressable cost that actually moves in the base case. Never 1:
   * leadership is retained, hybrid functions keep an onshore layer, and some
   * addressable roles are gated behind consents. Drives every saving figure.
   */
  movedShareOfAddressable: number;
  attritionPct: number;
  exitMultiple: string;
  /** Overrides the sector function taxonomy where a portco differs. */
  labels?: Partial<Record<SlotKey, string>>;
  slots: Record<SlotKey, OffshoringFunctionSlot>;
  /** The binding constraint named in the exec summary and risk table. */
  constraintNote: string;
  /** Named-contact risk: how many specialists, in which slot. */
  namedContacts: { count: number; slot: SlotKey; accounts: string };
  /** Manager span quoted in the low-impact risk row. */
  managerSpan: string;
}

/**
 * Education · mid-hold. Enrollment-led, accreditation-capped instruction.
 * The original report's figures, kept as the reference profile.
 */
const collegies: OffshoringProfile = {
  sector: "Education",
  totalFte: 190,
  offshoreRatePct: 40,
  transitionM: 1.4,
  rampM: 1.1,
  movedShareOfAddressable: 0.51,
  attritionPct: 18,
  exitMultiple: "12×",
  constraintNote: "licence-capped",
  namedContacts: { count: 3, slot: "highA", accounts: "top five institutional accounts" },
  managerSpan: "1:14",
  slots: {
    retainA: { costM: 5.9, fte: 46, addressableM: 0, addressableFte: 0, heat: [28, null, 24, 9], code: "INS", primaryConstraint: "Accreditation-capped faculty" },
    highA: { costM: 4.8, fte: 42, addressableM: 3.4, addressableFte: 18, heat: [78, 74, 62, 47], code: "ENR", primaryConstraint: "FERPA on student records" },
    retainB: { costM: 3.4, fte: 28, addressableM: 0.4, addressableFte: 3, heat: [43, 48, 41, 34], code: "INF", primaryConstraint: "On-call and physical access" },
    highB: { costM: 3.1, fte: 31, addressableM: 2.6, addressableFte: 16, heat: [80, 73, 69, 59], code: "SUP", primaryConstraint: "Student PII in ticket bodies" },
    midA: { costM: 2.6, fte: 24, addressableM: 1.1, addressableFte: 8, heat: [74, 66, 54, 38], code: "FIN", primaryConstraint: "Close calendar and controls" },
    midB: { costM: 2.2, fte: 19, addressableM: 0.4, addressableFte: 3, heat: [null, 64, 55, 40], code: "ITA", primaryConstraint: "SIS vendor consent" },
  },
};

/**
 * Technology Services · public sector. Large, QA-heavy, but client MSAs and
 * cleared-personnel rules keep a wide engineering band onshore.
 */
const xfact: OffshoringProfile = {
  sector: "Technology Services",
  totalFte: 296,
  offshoreRatePct: 36,
  transitionM: 2.3,
  rampM: 1.8,
  movedShareOfAddressable: 0.46,
  attritionPct: 22,
  exitMultiple: "11×",
  constraintNote: "cleared-personnel restricted",
  namedContacts: { count: 5, slot: "highB", accounts: "three largest agency contracts" },
  managerSpan: "1:11",
  slots: {
    retainA: { costM: 12.4, fte: 78, addressableM: 0, addressableFte: 0, heat: [31, 26, 19, 8], code: "ENG", primaryConstraint: "Cleared personnel only" },
    highA: { costM: 8.1, fte: 61, addressableM: 6.2, addressableFte: 30, heat: [86, 81, 70, 52], code: "QAT", primaryConstraint: "None material" },
    retainB: { costM: 5.2, fte: 34, addressableM: 0.6, addressableFte: 3, heat: [40, 44, 36, 27], code: "DVO", primaryConstraint: "Production access controls" },
    highB: { costM: 6.6, fte: 58, addressableM: 5.4, addressableFte: 32, heat: [83, 78, 71, 61], code: "HLP", primaryConstraint: "Agency-named contacts" },
    midA: { costM: 4.9, fte: 38, addressableM: 2.4, addressableFte: 14, heat: [76, 69, 58, 41], code: "DAT", primaryConstraint: "Data residency" },
    midB: { costM: 3.4, fte: 27, addressableM: 0.9, addressableFte: 5, heat: [null, 62, 51, 36], code: "FIN", primaryConstraint: "Close calendar and controls" },
  },
};

/**
 * Technology Services · managed services. Smaller than Halden and far more
 * movable: the delivery model is already queue-driven and documented.
 */
const dataserve: OffshoringProfile = {
  sector: "Technology Services",
  totalFte: 184,
  offshoreRatePct: 42,
  transitionM: 1.1,
  rampM: 0.8,
  movedShareOfAddressable: 0.58,
  attritionPct: 19,
  exitMultiple: "10×",
  constraintNote: "data-residency bound",
  namedContacts: { count: 2, slot: "highA", accounts: "two anchor managed-services clients" },
  managerSpan: "1:16",
  slots: {
    retainA: { costM: 4.1, fte: 28, addressableM: 0, addressableFte: 0, heat: [34, 29, 22, 11], code: "ENG", primaryConstraint: "Client architecture ownership" },
    highA: { costM: 6.3, fte: 49, addressableM: 5.1, addressableFte: 24, heat: [88, 84, 74, 58], code: "NOC", primaryConstraint: "Data residency on two accounts" },
    retainB: { costM: 2.4, fte: 16, addressableM: 0.3, addressableFte: 1, heat: [42, 46, 38, 29], code: "CLD", primaryConstraint: "Production access controls" },
    highB: { costM: 5.1, fte: 44, addressableM: 4.3, addressableFte: 24, heat: [85, 80, 72, 63], code: "SUP", primaryConstraint: "None material" },
    midA: { costM: 3.2, fte: 26, addressableM: 1.7, addressableFte: 10, heat: [79, 71, 59, 44], code: "FIN", primaryConstraint: "Close calendar and controls" },
    midB: { costM: 2.6, fte: 21, addressableM: 0.8, addressableFte: 3, heat: [null, 66, 57, 42], code: "DAT", primaryConstraint: "Client data agreements" },
  },
};

/**
 * Healthcare Services · the hardest case. Largest workforce, but clinical
 * licensure retains most of it; the movable work is revenue cycle.
 */
const behaviourFramework: OffshoringProfile = {
  sector: "Healthcare Services",
  totalFte: 388,
  offshoreRatePct: 38,
  transitionM: 2.9,
  rampM: 2.2,
  movedShareOfAddressable: 0.44,
  attritionPct: 24,
  exitMultiple: "13×",
  constraintNote: "clinically licensed and payer-credentialed",
  namedContacts: { count: 4, slot: "highA", accounts: "four largest payer relationships" },
  managerSpan: "1:9",
  slots: {
    retainA: { costM: 21.6, fte: 174, addressableM: 0, addressableFte: 0, heat: [18, 14, 11, 6], code: "CLN", primaryConstraint: "Clinical licensure" },
    highA: { costM: 9.4, fte: 71, addressableM: 7.1, addressableFte: 30, heat: [84, 79, 66, 48], code: "RCM", primaryConstraint: "Payer credentialing" },
    retainB: { costM: 6.1, fte: 39, addressableM: 0.5, addressableFte: 2, heat: [38, 41, 33, 24], code: "ITA", primaryConstraint: "PHI system access" },
    highB: { costM: 7.2, fte: 62, addressableM: 5.8, addressableFte: 32, heat: [81, 76, 68, 57], code: "PTS", primaryConstraint: "PHI in call handling" },
    midA: { costM: 4.3, fte: 27, addressableM: 2.1, addressableFte: 11, heat: [72, 64, 52, 37], code: "CRD", primaryConstraint: "State-by-state rules" },
    midB: { costM: 2.4, fte: 15, addressableM: 0.6, addressableFte: 3, heat: [null, 61, 49, 34], code: "FIN", primaryConstraint: "Close calendar and controls" },
  },
};

/**
 * Professional Services · smallest and most relationship-bound. Little is
 * structurally movable; the honest answer is a modest, slow programme.
 */
const eosis: OffshoringProfile = {
  sector: "Professional Services",
  totalFte: 132,
  offshoreRatePct: 44,
  transitionM: 0.8,
  rampM: 0.6,
  movedShareOfAddressable: 0.49,
  attritionPct: 16,
  exitMultiple: "10×",
  constraintNote: "partner-relationship bound",
  namedContacts: { count: 2, slot: "highA", accounts: "two retained advisory accounts" },
  managerSpan: "1:7",
  slots: {
    retainA: { costM: 6.8, fte: 41, addressableM: 0, addressableFte: 0, heat: [24, 19, 14, 7], code: "ADV", primaryConstraint: "Partner-owned relationships" },
    highA: { costM: 3.1, fte: 26, addressableM: 2.2, addressableFte: 11, heat: [77, 71, 58, 42], code: "CLS", primaryConstraint: "Named account contacts" },
    retainB: { costM: 2.9, fte: 18, addressableM: 0.2, addressableFte: 1, heat: [37, 40, 32, 23], code: "SAM", primaryConstraint: "Client-facing by design" },
    highB: { costM: 2.4, fte: 21, addressableM: 1.8, addressableFte: 12, heat: [80, 74, 64, 51], code: "FIN", primaryConstraint: "None material" },
    midA: { costM: 1.7, fte: 14, addressableM: 0.7, addressableFte: 4, heat: [71, 63, 51, 36], code: "HRO", primaryConstraint: "Employee data residency" },
    midB: { costM: 1.3, fte: 12, addressableM: 0.3, addressableFte: 1, heat: [null, 59, 47, 33], code: "DEL", primaryConstraint: "Client consent per SOW" },
  },
};

/** Keyed by company name, matching what the report generator is handed. */
export const OFFSHORING_PROFILES: Record<string, OffshoringProfile> = {
  Collegies: collegies,
  Halden: xfact,
  DataServe: dataserve,
  "Behaviour Framework": behaviourFramework,
  EOSIS: eosis,
};

export const DEFAULT_OFFSHORING_PROFILE = collegies;

export function getOffshoringProfile(
  companyName: string,
  sector?: Sector,
): OffshoringProfile {
  const named = OFFSHORING_PROFILES[companyName];
  if (named) return named;

  // Unknown company: fall back to a profile from the same sector so the
  // taxonomy at least matches, rather than always showing Education.
  const bySector = Object.values(OFFSHORING_PROFILES).find(
    (profile) => profile.sector === sector,
  );
  return bySector ?? DEFAULT_OFFSHORING_PROFILE;
}
