import type { DetectedFunction } from "@/types/offshoring";

export interface PreviewStat {
  label: string;
  value: string;
  hint?: string;
}

export interface PreviewHeatRow {
  id: string;
  label: string;
  high: number;
  med: number;
  low: number;
  model: "Lift-out" | "Hybrid" | "Role-by-role";
}

export interface PreviewSnapshot {
  intro: string;
  totalFte: number;
  addressable: number;
  addressablePct: number;
  stats: PreviewStat[];
  rows: PreviewHeatRow[];
}

/**
 * The first-pass read shown between Round 2 and Round 3.
 *
 * Kept as structured data so the stage can lay it out as figures and a table.
 * `previewToText` renders the same snapshot for the stored transcript, so the
 * saved record and the screen never disagree.
 */
export function buildPreviewSnapshot(functions: DetectedFunction[]): PreviewSnapshot {
  const totalFte = functions.reduce((sum, fn) => sum + fn.fte, 0);
  const addressable = Math.round(totalFte * 0.56);
  const loaded = Math.round(totalFte * 0.087 * 10) / 10;
  const annual = Math.round(loaded * 0.25 * 10) / 10;
  const threeYear = Math.round(annual * 2 * 10) / 10;
  const payback = 8;

  const rows: PreviewHeatRow[] = functions.map((fn, index) => {
    const high = Math.max(1, Math.round(fn.fte * (0.25 + (index % 3) * 0.08)));
    const med = Math.max(1, Math.round(fn.fte * 0.35));
    const low = Math.max(0, fn.fte - high - med);
    const share = high / fn.fte;
    return {
      id: fn.id,
      label: fn.label,
      high,
      med,
      low,
      model: share >= 0.7 ? "Lift-out" : share >= 0.3 ? "Hybrid" : "Role-by-role",
    };
  });

  return {
    intro: "Here's a first-pass read — react to the numbers in the next three questions.",
    totalFte,
    addressable,
    addressablePct: Math.round((addressable / Math.max(totalFte, 1)) * 100),
    stats: [
      {
        label: "Addressable",
        value: `${addressable} FTEs`,
        hint: `of ${totalFte} in scope`,
      },
      { label: "Loaded cost", value: `$${loaded}M`, hint: "in scope" },
      { label: "Annual saving", value: `$${annual}M`, hint: "base-case run-rate" },
      { label: "3-year net", value: `$${threeYear}M`, hint: `payback ~${payback} months` },
    ],
    rows,
  };
}

/** Flat rendering of a snapshot, for the stored chat transcript. */
export function previewToText(snapshot: PreviewSnapshot): string {
  return [
    snapshot.intro,
    "",
    ...snapshot.stats.map((stat) =>
      stat.hint ? `${stat.label}: ${stat.value} (${stat.hint})` : `${stat.label}: ${stat.value}`,
    ),
    "",
    "Function heatmap (mock seed scores):",
    ...snapshot.rows.map(
      (row) =>
        `${row.label}: High ${row.high} · Med ${row.med} · Low ${row.low} → ${row.model}`,
    ),
  ].join("\n");
}
