import type { ConfidenceLevel } from "./sales-assessment";

/**
 * The CSV intake path: a sales baseline read from a CRM opportunity export
 * instead of a live interview.
 *
 * The export answers what a system of record knows — amounts, stages, owners,
 * dates — and nothing else. Everything it cannot know stays a question, which
 * is why the flow still asks a short round before building the report.
 */

/** A column the parser looks for. `header` is what the template writes. */
export type IntakeField =
  | "id"
  | "account"
  | "segment"
  | "source"
  | "owner"
  | "stage"
  | "outcome"
  | "amount"
  | "created"
  | "closed"
  | "lastActivity";

export interface IntakeColumn {
  field: IntakeField;
  header: string;
  /** Normalised alternatives accepted from a real export. */
  aliases: string[];
  /** Without these the file is not an opportunity export at all. */
  required?: boolean;
  hint: string;
}

/** Which of the template's columns this file actually carried. */
export interface ColumnMatch {
  field: IntakeField;
  /** The column's own header in the uploaded file, when it was found. */
  header?: string;
  hint: string;
}

export interface SourceTally {
  label: string;
  rows: number;
  wonValue: number;
}

export interface OwnerTally {
  name: string;
  wonRows: number;
  wonValue: number;
}

/** Everything the export could be made to say, and what it stayed silent on. */
export interface IntakeExtract {
  fileName: string;
  rowCount: number;
  matched: ColumnMatch[];
  missing: ColumnMatch[];
  /** The window the file covers, taken from the file's own dates. */
  asOfIso?: string;
  earliestIso?: string;
  wonRows: number;
  lostRows: number;
  openRows: number;
  winRatePct?: number;
  wonValue: number;
  /** Closed-won inside the trailing 12 months of `asOfIso`. */
  wonValueTrailing12: number;
  /** The 12 months before that, when the file reaches back far enough. */
  wonValuePrior12?: number;
  avgWonValue?: number;
  minWonValue?: number;
  maxWonValue?: number;
  medianCycleDays?: number;
  sources: SourceTally[];
  /** Rows with no source recorded, as a share of every row. */
  missingSourceShare: number;
  owners: OwnerTally[];
  topOwnerSharePct?: number;
  segments: { label: string; rows: number }[];
  /** Share of cells empty across the columns that were found. */
  blankShare: number;
  /** Open rows with no activity for 60 days or more. */
  staleOpenRows: number;
}

/** Why a file could not be used, in the words shown to the uploader. */
export interface IntakeParseFailure {
  reason: string;
  detail: string;
}

export type IntakeParseResult =
  | { ok: true; extract: IntakeExtract }
  | { ok: false; failure: IntakeParseFailure };

/**
 * One question the export cannot answer, asked against a real question-bank
 * id so the answer lands in the same place an interviewed answer would.
 */
export interface IntakeQuestion {
  /** A question-bank id — the answer is stored under it verbatim. */
  qid: string;
  headline: string;
  /** What the file did say, and why that leaves this open. */
  because: string;
  kind: "choice" | "text";
  options?: { id: string; label: string }[];
  placeholder?: string;
  /** Tag applied to the answer, for questions the bank asks confidence on. */
  confidence?: ConfidenceLevel;
}

export type IntakeStep = "upload" | "reading" | "questions" | "building";
