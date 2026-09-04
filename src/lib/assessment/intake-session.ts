import { CHANNELS, getSalesQuestion } from "@/data/sales";
import { createId } from "@/lib/id";
import { money, staleOpenShare } from "@/lib/assessment/csv-intake";
import { classify } from "@/lib/assessment/sales-routing";
import type {
  ChannelEntry,
  ChannelId,
  ChannelMap,
  ConfidenceLevel,
  SalesAnswer,
  SalesAssessmentSession,
} from "@/types/sales-assessment";
import type { IntakeExtract } from "@/types/sales-intake";

/**
 * Turns a parsed export plus the short clarifying round into a real
 * `SalesAssessmentSession`, so the CSV path and the interview path end in the
 * same object and the same `buildSalesReport`.
 *
 * The export is taken through the whole of Phase 1, which means three kinds of
 * answer — and every label says which kind it is, because the difference is the
 * only thing that keeps the report honest:
 *
 * 1. Counted. Deal size, cycle length, win rate, source mix, owner
 *    concentration. Tagged `A` where the bank asks for a tag.
 * 2. Inferred, and labelled "inferred" — a stance the file's shape implies but
 *    does not state. Tagged `E` where the bank asks for a tag.
 * 3. Not recorded in the export, and labelled exactly that. Tagged `N` where
 *    the bank asks for a tag, which is what puts it in the report's open
 *    questions rather than its findings.
 *
 * A tag is never written onto a question the bank does not ask one for — see
 * `set` — or the instrumentation share would count answers that were never
 * meant to carry a confidence.
 */

/** The file is the respondent for everything it answered. */
const SOURCE_ROLE = "System of record";

/** Whoever answered the clarifying round. Shared with intake-questions.ts. */
export const CLARIFY_RESPONDENT_ID = "resp-clarify";

type Tag = ConfidenceLevel | undefined;

/** Maps a free-text source label onto the bank's channel inventory. */
function channelForSource(label: string): ChannelId | undefined {
  const text = label.toLowerCase();
  if (/rfp|tender|bid|portal|procure|solicitation/.test(text)) return "rfp";
  if (/referr|partner|word of mouth|introduc/.test(text)) return "referrals";
  if (/expansion|existing|upsell|cross.?sell|renewal|account growth/.test(text))
    return "expansion";
  if (/field|territor|visit|onsite|on-site/.test(text)) return "field";
  if (/event|conference|trade ?show|webinar|booth/.test(text)) return "events";
  if (/outbound|cold|inside|sdr|bdr|prospect|sequence/.test(text)) return "inside";
  if (/linkedin|social/.test(text)) return "linkedin";
  if (/content|seo|organic|blog|website|web form|inbound/.test(text)) return "content";
  if (/paid|ppc|adwords|google ads|advertis/.test(text)) return "paid";
  if (/marketplace|platform|reseller|aws|azure|gcp/.test(text)) return "marketplaces";
  return undefined;
}

/** Picks the bank option whose band contains `value`. */
function band<T extends string>(
  value: number,
  bands: { max: number; id: T }[],
): T {
  for (const entry of bands) {
    if (value < entry.max) return entry.id;
  }
  return bands[bands.length - 1].id;
}

const DEAL_SIZE_BANDS = [
  { max: 25_000, id: "under-25k" },
  { max: 100_000, id: "25k-100k" },
  { max: 500_000, id: "100k-500k" },
  { max: 2_000_000, id: "500k-2m" },
  { max: Infinity, id: "over-2m" },
];

const CYCLE_BANDS = [
  { max: 31, id: "under-1m" },
  { max: 93, id: "1-3m" },
  { max: 186, id: "3-6m" },
  { max: 366, id: "6-12m" },
  { max: Infinity, id: "over-12m" },
];

const REVENUE_BANDS = [
  { max: 5_000_000, id: "under-5m" },
  { max: 25_000_000, id: "5m-25m" },
  { max: 50_000_000, id: "25m-50m" },
  { max: 100_000_000, id: "50m-100m" },
  { max: Infinity, id: "over-100m" },
];

const CONCENTRATION_BANDS = [
  { max: 10, id: "under-10" },
  { max: 25, id: "10-25" },
  { max: 50, id: "25-50" },
  { max: Infinity, id: "over-50" },
];

const SELLER_COUNT_BANDS = [
  { max: 1, id: "none" },
  { max: 3, id: "1-2" },
  { max: 6, id: "3-5" },
  { max: 16, id: "6-15" },
  { max: Infinity, id: "over-15" },
];

/** The bank's own wording for an option, so labels never drift from the bank. */
function optionLabel(qid: string, optionId: string): string {
  return (
    getSalesQuestion(qid)?.options?.find((option) => option.id === optionId)?.label ??
    optionId
  );
}

/**
 * The channel map the export implies: a source that appears is in use, and
 * anything the file never mentions is recorded as not in use rather than as
 * wanted — an export cannot know what somebody wishes they were doing.
 */
export function channelMapFromExtract(extract: IntakeExtract): ChannelMap {
  const used = new Map<ChannelId, number>();

  for (const source of extract.sources) {
    const channel = channelForSource(source.label);
    if (!channel) continue;
    used.set(channel, (used.get(channel) ?? 0) + source.rows);
  }

  const entries: ChannelEntry[] = CHANNELS.map((channel) => ({
    channel: channel.id,
    status: used.has(channel.id) ? "using" : "not-using",
  }));

  const dominant = [...used.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2)
    .map(([channel]) => channel);

  return { entries, dominant };
}

/** The segment the export leans toward, in the bank's B1b vocabulary. */
function segmentOption(extract: IntakeExtract): string | undefined {
  const top = extract.segments[0];
  if (!top) return undefined;

  const share = top.rows / Math.max(extract.rowCount, 1);
  if (share < 0.5) return "mixed";

  const text = top.label.toLowerCase();
  if (/gov|public|federal|state|municipal|council|agency/.test(text)) return "government";
  if (/enterprise|large|corporate/.test(text)) return "enterprise";
  if (/mid.?market|midmarket|medium/.test(text)) return "mid-market";
  if (/smb|small|consumer|b2c/.test(text)) return "smb";
  return "mixed";
}

export interface IntakeSessionInput {
  companyId?: string;
  companyName: string;
  extract: IntakeExtract;
  /** The clarifying round, keyed by question-bank id. */
  clarifications: Record<string, SalesAnswer>;
  /**
   * Whoever answered that round — the signed-in user, when there is one. The
   * report's people map credits them separately from the file.
   */
  respondent?: { name: string; role: string };
  /**
   * `draft` while the clarifying round is still running: the gate stays closed
   * so the rail counts against Phase 1's 32 and the deep-dive sections remain
   * a lookahead. `final` closes the gate and completes the session, which is
   * what the report is built from.
   */
  stage?: "draft" | "final";
  /** Reused across draft saves so the session keeps one id, not one per keystroke. */
  id?: string;
}

/**
 * Everything the export answered, keyed by question-bank id.
 *
 * Exported on its own so the extraction screen can show exactly which baseline
 * questions the file closed out before the round of questions begins.
 */
export function answersFromExtract(extract: IntakeExtract): Record<string, SalesAnswer> {
  const answers: Record<string, SalesAnswer> = {};
  const respondentId = "resp-export";

  /**
   * A confidence tag is only ever written where the bank asks for one —
   * tagging a question it does not would inflate the report's instrumentation
   * share with answers that were never meant to carry a tag.
   */
  const set = (
    qid: string,
    label: string,
    value?: string | string[],
    tag?: Tag,
    who?: string,
  ) => {
    const asks = getSalesQuestion(qid)?.asksConfidence ?? false;
    answers[qid] = {
      value: value ?? label,
      label,
      ...(tag && asks ? { confidence: tag } : {}),
      ...(who && tag && asks ? { whoWouldKnow: who } : {}),
      respondentId,
    };
  };

  const topOwner = extract.owners[0];
  const owners = extract.owners.length;
  const quiet = staleOpenShare(extract);
  const concentration = extract.topOwnerSharePct ?? 0;
  /** Who to put a question to when the file cannot answer it. */
  const ask = topOwner ? topOwner.name : "The sales lead";
  const NOT_IN_FILE = "Not recorded in the export";

  // ── Part 1, the business ────────────────────────────────────────────────
  const segment = segmentOption(extract);
  if (segment) {
    const top = extract.segments[0];
    set(
      "B1b",
      `${optionLabel("B1b", segment)} — ${top.rows} of ${extract.rowCount} rows are ${top.label.toLowerCase()}.`,
      segment,
    );
  } else {
    set("B1b", `${optionLabel("B1b", "mixed")} — no segment column to read.`, "mixed");
  }

  // A top account that stands apart shows up as a win far above the average.
  if (extract.avgWonValue !== undefined && extract.maxWonValue !== undefined) {
    const multiple = extract.maxWonValue / Math.max(extract.avgWonValue, 1);
    const option = multiple >= 2.5 ? "different" : "same";
    set(
      "B1c",
      `${optionLabel("B1c", option)} — the largest win is ${money(extract.maxWonValue)}, ${multiple.toFixed(1)}× the ${money(extract.avgWonValue)} average.`,
      option,
    );
  }

  if (extract.avgWonValue !== undefined) {
    const id = band(extract.avgWonValue, DEAL_SIZE_BANDS);
    set(
      "B2a",
      `${money(extract.avgWonValue)} average across ${extract.wonRows} closed-won opportunities.`,
      id,
      "A",
    );
  }

  if (extract.minWonValue !== undefined && extract.maxWonValue !== undefined) {
    set(
      "B2b",
      `${money(extract.minWonValue)} smallest, ${money(extract.maxWonValue)} largest.`,
      undefined,
      "A",
    );
  }

  if (extract.medianCycleDays !== undefined) {
    const id = band(extract.medianCycleDays, CYCLE_BANDS);
    set(
      "B3",
      `${extract.medianCycleDays} days median from created to close, on won opportunities.`,
      id,
      "A",
    );
  }

  if (extract.wonValueTrailing12 > 0) {
    const id = band(extract.wonValueTrailing12, REVENUE_BANDS);
    set(
      "B4a",
      `${money(extract.wonValueTrailing12)} closed-won in the trailing 12 months of the export.`,
      id,
      "A",
    );
  }

  if (extract.wonValuePrior12 !== undefined && extract.wonValuePrior12 > 0) {
    const id = band(extract.wonValuePrior12, REVENUE_BANDS);
    set(
      "B4b",
      `${money(extract.wonValuePrior12)} closed-won in the 12 months before that.`,
      id,
      "A",
    );
  } else {
    set(
      "B4b",
      `${NOT_IN_FILE} — the file does not reach back a second full year.`,
      undefined,
      "N",
      ask,
    );
  }

  // ── Part 2, the sales engine ────────────────────────────────────────────
  const top = extract.sources[0];
  const topChannel = top ? channelForSource(top.label) : undefined;
  if (top) {
    const option =
      topChannel === "rfp"
        ? "rfp"
        : topChannel === "referrals" || topChannel === "expansion"
          ? "referrals"
          : topChannel === "inside" || topChannel === "linkedin"
            ? "outbound"
            : topChannel === "content" || topChannel === "paid"
              ? "inbound"
              : "mixed";
    const share = extract.wonValue > 0 ? Math.round((top.wonValue / extract.wonValue) * 100) : 0;
    set(
      "E1",
      `${optionLabel("E1", option)} — "${top.label}" carries ${share}% of closed-won value.`,
      option,
    );
  }

  // Nobody's job, or somebody's: an export shows how concentrated origination
  // is, not who owns it, so this is stated as the inference it is.
  const e2 =
    extract.missingSourceShare >= 0.25
      ? "just-comes"
      : owners >= 5
        ? "dedicated"
        : "part-time";
  set(
    "E2",
    `${optionLabel("E2", e2)} — inferred: ${owners} owners carry every opportunity and ${Math.round(extract.missingSourceShare * 100)}% of rows have no source.`,
    e2,
  );

  const rfp = extract.sources.find((source) => channelForSource(source.label) === "rfp");
  set(
    "E3a",
    rfp
      ? `${optionLabel("E3a", "portals")} — ${rfp.rows} opportunities are sourced from tender portals.`
      : `${optionLabel("E3a", "none")} — no row in the export is sourced from a tender portal.`,
    rfp ? "portals" : "none",
  );

  set(
    "E3b",
    rfp && topOwner
      ? `${topOwner.name} owns most of the portal-sourced work; the export records no watching routine or cadence.`
      : `${NOT_IN_FILE} — no watching routine is a CRM field.`,
  );

  if (topOwner && extract.topOwnerSharePct !== undefined) {
    const option = concentration >= 50 ? "one-senior" : "sales-team";
    set(
      "E4a",
      `${optionLabel("E4a", option)} — ${topOwner.name} owns ${concentration}% of closed-won value.`,
      option,
    );
  }

  const e4b = owners >= 4 && concentration < 60 ? "yes-dedicated" : "partly";
  set(
    "E4b",
    `${optionLabel("E4b", e4b)} — inferred: ${owners} named owners appear on won work, the largest holding ${concentration}%.`,
    e4b,
  );

  // A pipeline nobody touches is not a pipeline anybody reads.
  if (extract.openRows > 0) {
    const option = quiet >= 0.35 ? "exists-but-no" : "yes";
    set(
      "E5",
      quiet >= 0.35
        ? `${optionLabel("E5", option)} — ${extract.staleOpenRows} of ${extract.openRows} open opportunities have had no activity for 60 days or more.`
        : `${optionLabel("E5", option)} — the export is complete and ${extract.openRows - extract.staleOpenRows} of ${extract.openRows} open opportunities were touched inside 60 days.`,
      option,
    );
  }

  if (topOwner && extract.topOwnerSharePct !== undefined) {
    const id = band(concentration, CONCENTRATION_BANDS);
    set(
      "E6",
      `${optionLabel("E6", id)} — ${topOwner.name} carries ${concentration}% of closed-won value in the export.`,
      id,
      // Inferred from the file's own totals rather than read off a field.
      "E",
      topOwner.name,
    );
  }

  // ── Part 3, the channel map ─────────────────────────────────────────────
  const map = channelMapFromExtract(extract);
  const using = map.entries.filter((entry) => entry.status === "using");
  set(
    "CH1",
    `${using.length} of ${map.entries.length} channels appear as sources: ${using
      .map((entry) => CHANNELS.find((channel) => channel.id === entry.channel)?.label ?? entry.channel)
      .join(", ")}.`,
    using.map((entry) => entry.channel),
  );
  set(
    "CH1b",
    map.dominant
      .map((id) => CHANNELS.find((channel) => channel.id === id)?.label ?? id)
      .join(", "),
    map.dominant,
  );
  set("CH2", `${NOT_IN_FILE} — a file shows what was used, not what was wished for.`);
  set("CH3", `${NOT_IN_FILE} — untried segments leave no trace in an export.`);
  set("CH4", `${NOT_IN_FILE} — where to place the next bet is not a CRM field.`);

  // ── Part 4, team, tools and time ────────────────────────────────────────
  if (owners > 0) {
    const id = band(owners, SELLER_COUNT_BANDS);
    set(
      "T1",
      `${optionLabel("T1", id)} — ${owners} distinct owners appear on closed-won opportunities.`,
      id,
      "A",
    );
  }

  set(
    "T3a",
    `${optionLabel("T3a", "crm-only")} — an opportunity export exists, and no other system is referenced in it.`,
    "crm-only",
  );
  set(
    "T3b",
    `${optionLabel("T3b", "no")} — no AI tooling is referenced anywhere in the export.`,
    "no",
  );

  const t4 = quiet >= 0.35 ? "capacity" : concentration >= 50 ? "coverage" : "several";
  set(
    "T4",
    `${optionLabel("T4", t4)} — inferred: ${extract.staleOpenRows} of ${extract.openRows} open opportunities are untouched and ${concentration}% of won value sits with one owner.`,
    t4,
  );

  // ── Part 5, limits and pain ─────────────────────────────────────────────
  set("L2", `${NOT_IN_FILE} — a parked idea is never written to a CRM.`);

  const l3a =
    quiet >= 0.35 ? "visibility" : concentration >= 50 ? "dependence" : "volume";
  set(
    "L3a",
    `${optionLabel("L3a", l3a)} — inferred: ${Math.round(quiet * 100)}% of the open pipeline is untouched and ${concentration}% of won value sits with one owner.`,
    l3a,
  );
  set("L3b", `${NOT_IN_FILE} — what made this the moment is not in the file.`);

  // ── Deep dive, only where an export genuinely knows ─────────────────────
  if (rfp) {
    set(
      "M-RFP.1a",
      `${rfp.rows} formal opportunities in the export, ${money(rfp.wonValue)} of them won.`,
      undefined,
      "A",
    );
  }
  if (extract.winRatePct !== undefined) {
    set(
      "M-RFP.6a",
      `${extract.wonRows} won against ${extract.lostRows} lost — a ${extract.winRatePct}% win rate on decided opportunities.`,
      undefined,
      "A",
    );
  }

  // Delivery capacity caps every opportunity in the report and is the one thing
  // no export has ever held, so it is recorded as untracked rather than left
  // out — that is what puts it in the report's open questions.
  set(
    "CAP.2",
    `${NOT_IN_FILE} — delivery capacity is not a CRM field.`,
    undefined,
    "N",
    `${ask} (or whoever owns delivery)`,
  );

  return answers;
}

/**
 * The finished session. `clarifications` overwrite anything the export guessed
 * at, because a person saying it beats a column implying it.
 */
export function buildIntakeSession(input: IntakeSessionInput): SalesAssessmentSession {
  const {
    companyId,
    companyName,
    extract,
    clarifications,
    respondent,
    stage = "final",
    id,
  } = input;
  const now = new Date().toISOString();
  const done = stage === "final";

  const respondents = [
    {
      id: "resp-export",
      name: `CRM export · ${extract.fileName}`,
      role: SOURCE_ROLE,
      sessionKey: "phase1" as const,
    },
    {
      id: CLARIFY_RESPONDENT_ID,
      name: respondent?.name ?? "Answered on upload",
      role: respondent?.role ?? "Ran the intake",
      sessionKey: "phase1" as const,
    },
  ];

  const answers: Record<string, SalesAnswer> = {
    ...answersFromExtract(extract),
    ...clarifications,
  };

  const whoRegistry: Record<string, string[]> = {};
  for (const [qid, answer] of Object.entries(answers)) {
    if (!answer.whoWouldKnow) continue;
    const bucket = whoRegistry[answer.whoWouldKnow] ?? [];
    if (!bucket.includes(qid)) bucket.push(qid);
    whoRegistry[answer.whoWouldKnow] = bucket;
  }

  const channelMap = channelMapFromExtract(extract);

  return {
    id: id ?? createId("sales-intake"),
    companyId,
    companyName,
    departmentId: "sales",
    phase: done ? "complete" : "phase1",
    activeSession: "phase1",
    respondents,
    channelMap,
    wantedSegments: [],
    classification: classify(answers, channelMap),
    gate: done
      ? { status: "accepted", corrections: [], acceptedAt: now }
      : { status: "not-reached", corrections: [] },
    answers,
    followUpsUsed: {},
    whoRegistry,
    // An export names owners but asks nobody anything, so the only interviews
    // worth requesting are the ones the unanswerable questions point at.
    interviewRequests: Object.entries(whoRegistry).map(([person, qids], index) => ({
      id: `int-intake-${index + 1}`,
      personOrRole: person,
      questionIds: qids,
      reason: `Named against ${qids.length} answer${qids.length === 1 ? "" : "s"} the export could not close.`,
      status: "requested" as const,
    })),
    handoffNotes: [],
    timings: [{ sessionKey: "phase1", startedAt: now, ...(done ? { endedAt: now } : {}) }],
    messages: [],
    queue: [],
    status: done ? "complete" : "in-progress",
    startedAt: now,
    updatedAt: now,
    qbankVersion: "v4",
  };
}
