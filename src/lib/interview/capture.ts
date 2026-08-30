/**
 * Shared shape for the "What I'm capturing" rail. Each agent contributes its
 * own selector (see lib/offshoring/progress.ts and lib/assessment/sales-progress.ts);
 * the rail components render whatever they return.
 */

export type CaptureStatus = "waiting" | "active" | "done";

export interface CaptureItem {
  id: string;
  label: string;
  value: string;
}

export interface CaptureSection {
  id: string;
  label: string;
  captured: number;
  /** A section with total 0 is a lookahead placeholder — no count badge is shown. */
  total: number;
  status: CaptureStatus;
  items: CaptureItem[];
  /** Overrides the empty-state line. */
  placeholder?: string;
}

export interface CaptureProgress {
  totalCaptured: number;
  totalItems: number;
  percent: number;
  sections: CaptureSection[];
}

export function statusFor(
  captured: number,
  total: number,
  isCurrent: boolean,
): CaptureStatus {
  if (total > 0 && captured >= total) return "done";
  if (captured > 0 || isCurrent) return "active";
  return "waiting";
}

/** Rolls section counts up into the overall totals and percentage. */
export function summarize(sections: CaptureSection[]): CaptureProgress {
  const totalCaptured = sections.reduce((sum, section) => sum + section.captured, 0);
  const totalItems = sections.reduce((sum, section) => sum + section.total, 0);

  return {
    totalCaptured,
    totalItems,
    percent: totalItems > 0 ? Math.round((totalCaptured / totalItems) * 100) : 0,
    sections,
  };
}
