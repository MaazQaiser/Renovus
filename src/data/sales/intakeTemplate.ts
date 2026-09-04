import type { IntakeColumn, IntakeField } from "@/types/sales-intake";

/**
 * The opportunity export the sales intake reads, and the sample file the
 * upload screen hands out.
 *
 * One source of truth on purpose: the parser matches headers against these
 * columns and the downloadable template is written from them, so a template
 * that downloads is always a template that parses.
 */

export const INTAKE_COLUMNS: IntakeColumn[] = [
  {
    field: "id",
    header: "opportunity_id",
    aliases: ["opportunityid", "oppid", "dealid", "id", "recordid"],
    hint: "Any stable reference. Used only to count rows.",
  },
  {
    field: "account",
    header: "account_name",
    aliases: ["account", "accountname", "customer", "customername", "company", "client"],
    required: true,
    hint: "Who the opportunity is with.",
  },
  {
    field: "segment",
    header: "segment",
    aliases: ["sector", "industry", "vertical", "buyertype", "market"],
    hint: "Government, enterprise, mid-market, SMB — however you label it.",
  },
  {
    field: "source",
    header: "source",
    aliases: ["leadsource", "channel", "origin", "campaign", "sourcechannel"],
    hint: "Where the opportunity came from. Blanks are counted, not guessed.",
  },
  {
    field: "owner",
    header: "owner",
    aliases: ["ownername", "salesrep", "rep", "accountexecutive", "ae", "assignedto"],
    required: true,
    hint: "Who holds the opportunity.",
  },
  {
    field: "stage",
    header: "stage",
    aliases: ["salesstage", "pipelinestage", "status", "phase"],
    hint: "Your own stage names — they are not interpreted.",
  },
  {
    field: "outcome",
    header: "outcome",
    aliases: ["result", "iswon", "won", "closedstatus", "dealstatus"],
    required: true,
    hint: "Won, Lost, or Open. Anything else counts as open.",
  },
  {
    field: "amount",
    header: "amount",
    aliases: ["value", "dealvalue", "dealsize", "revenue", "tcv", "acv", "bookings"],
    required: true,
    hint: "Contract value. Currency symbols and commas are fine.",
  },
  {
    field: "created",
    header: "created_date",
    aliases: ["createddate", "createdat", "opendate", "startdate", "firstcontact"],
    hint: "When it entered the pipeline. Needed for cycle length.",
  },
  {
    field: "closed",
    header: "close_date",
    aliases: ["closedate", "closeddate", "wondate", "decisiondate", "signeddate"],
    hint: "When it closed. Empty for anything still open.",
  },
  {
    field: "lastActivity",
    header: "last_activity_date",
    aliases: ["lastactivity", "lastactivitydate", "lasttouch", "lastcontacted"],
    hint: "Last recorded touch. This is what reveals a stale pipeline.",
  },
];

export const REQUIRED_FIELDS: IntakeField[] = INTAKE_COLUMNS.filter(
  (column) => column.required,
).map((column) => column.field);

/**
 * A sample export, held as day offsets rather than dates so a download is
 * always a current-looking file.
 *
 * Deliberately imperfect: six opportunities have no source, five open ones
 * have gone quiet, and a few amounts are missing. A clean fixture would make
 * the instrumentation read of the report meaningless. It also spans a little
 * over two years, so the trailing twelve months has a prior year to be read
 * against.
 */
interface SampleRow {
  account: string;
  segment: string;
  source: string;
  owner: string;
  stage: string;
  outcome: "Won" | "Lost" | "Open";
  amount?: number;
  createdDaysAgo: number;
  closedDaysAgo?: number;
  lastActivityDaysAgo?: number;
}

const SAMPLE_ROWS: SampleRow[] = [
  // ── Closed won ────────────────────────────────────────────────────────
  { account: "State Dept of Human Services", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed won", outcome: "Won", amount: 2400000, createdDaysAgo: 585, closedDaysAgo: 265, lastActivityDaysAgo: 258 },
  { account: "County Health Authority", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed won", outcome: "Won", amount: 1350000, createdDaysAgo: 402, closedDaysAgo: 82, lastActivityDaysAgo: 74 },
  { account: "Metro Transit Agency", segment: "Government", source: "Client expansion", owner: "Rachel Osei", stage: "Closed won", outcome: "Won", amount: 900000, createdDaysAgo: 236, closedDaysAgo: 56, lastActivityDaysAgo: 51 },
  { account: "Northgate School District", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Closed won", outcome: "Won", amount: 760000, createdDaysAgo: 498, closedDaysAgo: 178, lastActivityDaysAgo: 170 },
  { account: "Harbour City Council", segment: "Government", source: "Referral", owner: "Tom Bracken", stage: "Closed won", outcome: "Won", amount: 640000, createdDaysAgo: 318, closedDaysAgo: 138, lastActivityDaysAgo: 129 },
  { account: "Lakeside Utilities", segment: "Enterprise", source: "Client expansion", owner: "Tom Bracken", stage: "Closed won", outcome: "Won", amount: 520000, createdDaysAgo: 214, closedDaysAgo: 34, lastActivityDaysAgo: 28 },
  { account: "Riverbend Public Works", segment: "Government", source: "", owner: "Nadia Iqbal", stage: "Closed won", outcome: "Won", amount: 480000, createdDaysAgo: 604, closedDaysAgo: 284, lastActivityDaysAgo: 276 },
  { account: "Fairview Regional Hospital", segment: "Enterprise", source: "Field sales", owner: "Nadia Iqbal", stage: "Closed won", outcome: "Won", amount: 410000, createdDaysAgo: 268, closedDaysAgo: 113, lastActivityDaysAgo: 104 },
  { account: "Eastvale Housing Trust", segment: "Government", source: "RFP portal", owner: "Nadia Iqbal", stage: "Closed won", outcome: "Won", amount: 305000, createdDaysAgo: 691, closedDaysAgo: 336, lastActivityDaysAgo: 330 },
  { account: "Pinehurst Community College", segment: "Mid-market", source: "Event", owner: "Dev Whitfield", stage: "Closed won", outcome: "Won", amount: 220000, createdDaysAgo: 196, closedDaysAgo: 41, lastActivityDaysAgo: 33 },
  { account: "Ashford Water Board", segment: "Government", source: "Referral", owner: "Dev Whitfield", stage: "Closed won", outcome: "Won", amount: 185000, createdDaysAgo: 358, closedDaysAgo: 203, lastActivityDaysAgo: 196 },

  // Older wins, so the file reaches back far enough for a second full year —
  // without them there is nothing to read the trailing twelve months against.
  { account: "Vale County Records", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed won", outcome: "Won", amount: 1200000, createdDaysAgo: 980, closedDaysAgo: 620, lastActivityDaysAgo: 612 },
  { account: "Kestrel Regional Authority", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Closed won", outcome: "Won", amount: 860000, createdDaysAgo: 900, closedDaysAgo: 545, lastActivityDaysAgo: 538 },
  { account: "Dunmore Health Board", segment: "Enterprise", source: "Referral", owner: "Nadia Iqbal", stage: "Closed won", outcome: "Won", amount: 640000, createdDaysAgo: 820, closedDaysAgo: 470, lastActivityDaysAgo: 463 },
  { account: "Sable Ridge District", segment: "Government", source: "Client expansion", owner: "Dev Whitfield", stage: "Closed won", outcome: "Won", amount: 700000, createdDaysAgo: 760, closedDaysAgo: 410, lastActivityDaysAgo: 404 },

  // ── Closed lost ───────────────────────────────────────────────────────
  { account: "Westbrook County", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed lost", outcome: "Lost", amount: 1800000, createdDaysAgo: 512, closedDaysAgo: 244, lastActivityDaysAgo: 240 },
  { account: "Southport Authority", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed lost", outcome: "Lost", amount: 1150000, createdDaysAgo: 344, closedDaysAgo: 96, lastActivityDaysAgo: 92 },
  { account: "Grandview Municipality", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Closed lost", outcome: "Lost", amount: 870000, createdDaysAgo: 421, closedDaysAgo: 165, lastActivityDaysAgo: 160 },
  { account: "Clearwater Health Board", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Closed lost", outcome: "Lost", amount: 690000, createdDaysAgo: 288, closedDaysAgo: 74, lastActivityDaysAgo: 70 },
  { account: "Millbrook Transit", segment: "Government", source: "", owner: "Nadia Iqbal", stage: "Closed lost", outcome: "Lost", amount: 540000, createdDaysAgo: 366, closedDaysAgo: 149, lastActivityDaysAgo: 144 },
  { account: "Kingsley Borough", segment: "Government", source: "RFP portal", owner: "Nadia Iqbal", stage: "Closed lost", outcome: "Lost", amount: 430000, createdDaysAgo: 259, closedDaysAgo: 61, lastActivityDaysAgo: 58 },
  { account: "Redwood Unified", segment: "Government", source: "RFP portal", owner: "Nadia Iqbal", stage: "Closed lost", outcome: "Lost", amount: 380000, createdDaysAgo: 470, closedDaysAgo: 221, lastActivityDaysAgo: 216 },
  { account: "Sunnyfield Care Group", segment: "Enterprise", source: "Field sales", owner: "Dev Whitfield", stage: "Closed lost", outcome: "Lost", amount: 340000, createdDaysAgo: 301, closedDaysAgo: 118, lastActivityDaysAgo: 112 },
  { account: "Brookhaven Institute", segment: "Mid-market", source: "Event", owner: "Dev Whitfield", stage: "Closed lost", outcome: "Lost", amount: 260000, createdDaysAgo: 224, closedDaysAgo: 48, lastActivityDaysAgo: 44 },
  { account: "Oakmoor District", segment: "Government", source: "", owner: "Dev Whitfield", stage: "Closed lost", outcome: "Lost", amount: 210000, createdDaysAgo: 390, closedDaysAgo: 186, lastActivityDaysAgo: 181 },
  { account: "Tanner Valley Authority", segment: "", source: "Referral", owner: "Tom Bracken", stage: "Closed lost", outcome: "Lost", amount: 175000, createdDaysAgo: 205, closedDaysAgo: 29, lastActivityDaysAgo: 24 },
  { account: "Halewood Trust", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Closed lost", outcome: "Lost", amount: 1450000, createdDaysAgo: 648, closedDaysAgo: 312, lastActivityDaysAgo: 307 },
  { account: "Ferndale Council", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Closed lost", outcome: "Lost", amount: 520000, createdDaysAgo: 940, closedDaysAgo: 590, lastActivityDaysAgo: 584 },
  { account: "Alton Bay Authority", segment: "Government", source: "", owner: "Dev Whitfield", stage: "Closed lost", outcome: "Lost", amount: 300000, createdDaysAgo: 850, closedDaysAgo: 505, lastActivityDaysAgo: 499 },

  // ── Open, including five that have gone quiet ─────────────────────────
  { account: "Cascade Regional Council", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Negotiation", outcome: "Open", amount: 2100000, createdDaysAgo: 268, lastActivityDaysAgo: 9 },
  { account: "Fort Ridge Agency", segment: "Government", source: "RFP portal", owner: "Rachel Osei", stage: "Proposal", outcome: "Open", amount: 1250000, createdDaysAgo: 176, lastActivityDaysAgo: 14 },
  { account: "Silverton Health", segment: "Enterprise", source: "Client expansion", owner: "Tom Bracken", stage: "Proposal", outcome: "Open", amount: 780000, createdDaysAgo: 132, lastActivityDaysAgo: 6 },
  { account: "Bellhaven County", segment: "Government", source: "RFP portal", owner: "Tom Bracken", stage: "Qualification", outcome: "Open", amount: 610000, createdDaysAgo: 241, lastActivityDaysAgo: 87 },
  { account: "Maple Creek Schools", segment: "Government", source: "", owner: "Nadia Iqbal", stage: "Discovery", outcome: "Open", createdDaysAgo: 318, lastActivityDaysAgo: 142 },
  { account: "Ironbridge Port Authority", segment: "Government", source: "RFP portal", owner: "Nadia Iqbal", stage: "Proposal", outcome: "Open", amount: 950000, createdDaysAgo: 289, lastActivityDaysAgo: 98 },
  { account: "Wrenfield Housing", segment: "Government", source: "Referral", owner: "Nadia Iqbal", stage: "Discovery", outcome: "Open", createdDaysAgo: 214, lastActivityDaysAgo: 211 },
  { account: "Glenmoor Utilities", segment: "Enterprise", source: "", owner: "Dev Whitfield", stage: "Qualification", outcome: "Open", amount: 340000, createdDaysAgo: 158, lastActivityDaysAgo: 76 },
  { account: "Ravenswood Academy", segment: "Mid-market", source: "Event", owner: "Dev Whitfield", stage: "Discovery", outcome: "Open", amount: 195000, createdDaysAgo: 96, lastActivityDaysAgo: 21 },
  { account: "Thornbury Council", segment: "Government", source: "Field sales", owner: "Dev Whitfield", stage: "Qualification", outcome: "Open", createdDaysAgo: 121, lastActivityDaysAgo: 18 },
  { account: "Alderbrook Health Trust", segment: "", source: "Client expansion", owner: "Tom Bracken", stage: "Proposal", outcome: "Open", amount: 460000, createdDaysAgo: 187, lastActivityDaysAgo: 11 },
];

function isoDate(daysAgo: number, now: number): string {
  return new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Wraps a value only where it needs it, so the file stays readable. */
function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** The sample export, dated relative to `now` so a download never looks stale. */
export function intakeTemplateCsv(now: number = Date.now()): string {
  const headers = INTAKE_COLUMNS.map((column) => column.header);

  const lines = SAMPLE_ROWS.map((row, index) => {
    const cells: Record<string, string> = {
      opportunity_id: `OPP-${String(index + 1).padStart(4, "0")}`,
      account_name: row.account,
      segment: row.segment,
      source: row.source,
      owner: row.owner,
      stage: row.stage,
      outcome: row.outcome,
      amount: row.amount === undefined ? "" : String(row.amount),
      created_date: isoDate(row.createdDaysAgo, now),
      close_date:
        row.closedDaysAgo === undefined ? "" : isoDate(row.closedDaysAgo, now),
      last_activity_date:
        row.lastActivityDaysAgo === undefined
          ? ""
          : isoDate(row.lastActivityDaysAgo, now),
    };
    return headers.map((header) => csvCell(cells[header] ?? "")).join(",");
  });

  return [headers.join(","), ...lines].join("\n");
}

export const INTAKE_TEMPLATE_FILENAME = "sales-opportunity-export-template.csv";
