import { INTAKE_COLUMNS, REQUIRED_FIELDS } from "@/data/sales/intakeTemplate";
import type {
  ColumnMatch,
  IntakeExtract,
  IntakeField,
  IntakeParseResult,
  OwnerTally,
  SourceTally,
} from "@/types/sales-intake";

/**
 * Reads a CRM opportunity export.
 *
 * Every figure here is counted from the file. Where a column is absent or a
 * cell is empty the derived figure is left undefined rather than filled in —
 * the intake turns those into questions instead, which is the whole point of
 * the round that follows the upload.
 */

const DAY = 24 * 60 * 60 * 1000;
/** No touch for this long and an open opportunity is treated as quiet. */
const STALE_DAYS = 60;

// ── CSV ────────────────────────────────────────────────────────────────────

/**
 * Splits CSV text into rows of cells, honouring quoted fields (including
 * embedded commas, newlines and doubled quotes) and either line ending.
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char !== '"') {
        cell += char;
        continue;
      }
      if (text[index + 1] === '"') {
        cell += '"';
        index += 1;
        continue;
      }
      quoted = false;
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\r") continue;
    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell);
  rows.push(row);

  // A trailing newline leaves one empty row; so does a blank line mid-file.
  return rows.filter((entry) => entry.some((value) => value.trim() !== ""));
}

function normaliseHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** header index per template field, by exact header then by alias. */
function matchColumns(headers: string[]): Map<IntakeField, number> {
  const normalised = headers.map(normaliseHeader);
  const found = new Map<IntakeField, number>();

  for (const column of INTAKE_COLUMNS) {
    const candidates = [normaliseHeader(column.header), ...column.aliases];
    const index = normalised.findIndex((header) => candidates.includes(header));
    if (index !== -1) found.set(column.field, index);
  }

  return found;
}

// ── Cells ──────────────────────────────────────────────────────────────────

function cleanNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const digits = raw.replace(/[^0-9.-]/g, "");
  if (digits === "" || digits === "-" || digits === ".") return undefined;
  const value = Number(digits);
  return Number.isFinite(value) ? value : undefined;
}

function cleanDate(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const parsed = Date.parse(raw.trim());
  return Number.isNaN(parsed) ? undefined : parsed;
}

type Outcome = "won" | "lost" | "open";

/** Reads whatever the export calls it. Anything unrecognised counts as open. */
function readOutcome(outcome: string | undefined, stage: string | undefined): Outcome {
  const text = `${outcome ?? ""} ${stage ?? ""}`.toLowerCase();
  if (/\b(won|win|closed.?won|true|yes)\b/.test(text)) return "won";
  if (/\b(lost|loss|closed.?lost|no.?bid|declined|withdrawn)\b/.test(text)) return "lost";
  return "open";
}

function median(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function describe(field: IntakeField): ColumnMatch {
  const column = INTAKE_COLUMNS.find((entry) => entry.field === field);
  return { field, hint: column?.hint ?? "" };
}

// ── Extraction ─────────────────────────────────────────────────────────────

export function parseIntakeCsv(fileName: string, text: string): IntakeParseResult {
  const rows = parseCsvRows(text);

  if (rows.length < 2) {
    return {
      ok: false,
      failure: {
        reason: "That file has no rows to read",
        detail:
          "An export needs a header row and at least one opportunity under it. Download the template to see the shape.",
      },
    };
  }

  const [headers, ...body] = rows;
  const found = matchColumns(headers);
  const missingRequired = REQUIRED_FIELDS.filter((field) => !found.has(field));

  if (missingRequired.length > 0) {
    const names = missingRequired
      .map((field) => INTAKE_COLUMNS.find((column) => column.field === field)?.header)
      .filter(Boolean)
      .join(", ");
    return {
      ok: false,
      failure: {
        reason: "This doesn't look like an opportunity export",
        detail: `No column matched ${names}. The template lists every header this reads, and the aliases it accepts.`,
      },
    };
  }

  const cell = (row: string[], field: IntakeField): string | undefined => {
    const index = found.get(field);
    if (index === undefined) return undefined;
    return row[index]?.trim() || undefined;
  };

  let wonRows = 0;
  let lostRows = 0;
  let openRows = 0;
  let staleOpenRows = 0;
  let missingSource = 0;
  let blankCells = 0;
  let countedCells = 0;

  const wonValues: number[] = [];
  const cycles: number[] = [];
  const sourceTally = new Map<string, SourceTally>();
  const ownerTally = new Map<string, OwnerTally>();
  const segmentTally = new Map<string, number>();

  let asOf: number | undefined;
  let earliest: number | undefined;
  const wonByCloseDate: { closedAt?: number; value: number }[] = [];

  for (const row of body) {
    const outcome = readOutcome(cell(row, "outcome"), cell(row, "stage"));
    const amount = cleanNumber(cell(row, "amount"));
    const created = cleanDate(cell(row, "created"));
    const closed = cleanDate(cell(row, "closed"));
    const lastActivity = cleanDate(cell(row, "lastActivity"));
    const source = cell(row, "source");
    const owner = cell(row, "owner");
    const segment = cell(row, "segment");

    // Data quality, over the cells that should carry a value whatever the
    // outcome. A close date is expected to be empty while a deal is open, so
    // it is left out rather than counted as a hole.
    for (const field of ["account", "segment", "source", "owner", "stage", "amount"] as const) {
      if (!found.has(field)) continue;
      countedCells += 1;
      if (!cell(row, field)) blankCells += 1;
    }

    for (const stamp of [created, closed, lastActivity]) {
      if (stamp === undefined) continue;
      if (asOf === undefined || stamp > asOf) asOf = stamp;
      if (earliest === undefined || stamp < earliest) earliest = stamp;
    }

    if (source) {
      const entry = sourceTally.get(source) ?? { label: source, rows: 0, wonValue: 0 };
      entry.rows += 1;
      if (outcome === "won" && amount !== undefined) entry.wonValue += amount;
      sourceTally.set(source, entry);
    } else {
      missingSource += 1;
    }

    if (segment) segmentTally.set(segment, (segmentTally.get(segment) ?? 0) + 1);

    if (outcome === "won") {
      wonRows += 1;
      if (amount !== undefined) {
        wonValues.push(amount);
        wonByCloseDate.push({ closedAt: closed, value: amount });
      }
      if (created !== undefined && closed !== undefined && closed >= created) {
        cycles.push(Math.round((closed - created) / DAY));
      }
      if (owner) {
        const entry = ownerTally.get(owner) ?? { name: owner, wonRows: 0, wonValue: 0 };
        entry.wonRows += 1;
        entry.wonValue += amount ?? 0;
        ownerTally.set(owner, entry);
      }
    } else if (outcome === "lost") {
      lostRows += 1;
    } else {
      openRows += 1;
    }
  }

  // Quiet open opportunities are measured against the file's own latest date,
  // not today's — an export from last quarter would otherwise read as dead.
  if (asOf !== undefined) {
    for (const row of body) {
      if (readOutcome(cell(row, "outcome"), cell(row, "stage")) !== "open") continue;
      const lastActivity = cleanDate(cell(row, "lastActivity")) ?? cleanDate(cell(row, "created"));
      if (lastActivity === undefined) continue;
      if (asOf - lastActivity >= STALE_DAYS * DAY) staleOpenRows += 1;
    }
  }

  const wonValue = wonValues.reduce((sum, value) => sum + value, 0);
  const decided = wonRows + lostRows;

  const trailingStart = asOf === undefined ? undefined : asOf - 365 * DAY;
  const priorStart = trailingStart === undefined ? undefined : trailingStart - 365 * DAY;
  const inWindow = (from: number, to: number) =>
    wonByCloseDate
      .filter((entry) => entry.closedAt !== undefined && entry.closedAt >= from && entry.closedAt < to)
      .reduce((sum, entry) => sum + entry.value, 0);

  const owners = [...ownerTally.values()].sort((left, right) => right.wonValue - left.wonValue);
  const topOwner = owners[0];

  const extract: IntakeExtract = {
    fileName,
    rowCount: body.length,
    matched: [...found.keys()].map((field) => ({
      ...describe(field),
      header: headers[found.get(field) as number]?.trim(),
    })),
    missing: INTAKE_COLUMNS.filter((column) => !found.has(column.field)).map((column) =>
      describe(column.field),
    ),
    asOfIso: asOf === undefined ? undefined : new Date(asOf).toISOString(),
    earliestIso: earliest === undefined ? undefined : new Date(earliest).toISOString(),
    wonRows,
    lostRows,
    openRows,
    winRatePct: decided === 0 ? undefined : Math.round((wonRows / decided) * 100),
    wonValue,
    wonValueTrailing12:
      trailingStart === undefined || asOf === undefined
        ? wonValue
        : inWindow(trailingStart, asOf + DAY),
    wonValuePrior12:
      priorStart === undefined || trailingStart === undefined || earliest === undefined
        ? undefined
        : earliest <= priorStart
          ? inWindow(priorStart, trailingStart)
          : undefined,
    avgWonValue:
      wonValues.length === 0 ? undefined : Math.round(wonValue / wonValues.length),
    minWonValue: wonValues.length === 0 ? undefined : Math.min(...wonValues),
    maxWonValue: wonValues.length === 0 ? undefined : Math.max(...wonValues),
    medianCycleDays: median(cycles),
    sources: [...sourceTally.values()].sort(
      (left, right) => right.wonValue - left.wonValue || right.rows - left.rows,
    ),
    missingSourceShare: body.length === 0 ? 0 : missingSource / body.length,
    owners,
    topOwnerSharePct:
      topOwner && wonValue > 0
        ? Math.round((topOwner.wonValue / wonValue) * 100)
        : undefined,
    segments: [...segmentTally.entries()]
      .map(([label, rows]) => ({ label, rows }))
      .sort((left, right) => right.rows - left.rows),
    blankShare: countedCells === 0 ? 0 : blankCells / countedCells,
    staleOpenRows,
  };

  return { ok: true, extract };
}

/** Share of open opportunities that have gone quiet. 0 when none are open. */
export function staleOpenShare(extract: IntakeExtract): number {
  return extract.openRows === 0 ? 0 : extract.staleOpenRows / extract.openRows;
}

/** "$1.35m" / "$480k" — the report prints these inside answer labels. */
export function money(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `$${millions >= 10 ? Math.round(millions) : Number(millions.toFixed(2))}m`;
  }
  if (value >= 1_000) return `$${Math.round(value / 1000)}k`;
  return `$${Math.round(value)}`;
}
