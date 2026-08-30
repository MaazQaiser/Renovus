import type { ReportCostRow } from "@/data/offshoringReport";

export interface CostChartProps {
  rows: ReportCostRow[];
}

/**
 * Cost by function: a full-width track sized to the function's loaded cost,
 * overlaid in gold with the share judged addressable.
 *
 * Built in CSS rather than a fixed-viewBox SVG so the labels stay at a readable
 * size when the panel narrows.
 */
export function CostChart({ rows }: CostChartProps) {
  const max = Math.max(...rows.map((row) => row.loadedCostM), 0.0001);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const trackPct = (row.loadedCostM / max) * 100;
        const goldPct =
          row.loadedCostM > 0 ? (row.addressableM / row.loadedCostM) * 100 : 0;

        return (
          <div
            key={row.function}
            className="grid items-center gap-3"
            // The value gets its own column so the longest bar can still run the
            // full width of the track without pushing its label off the panel.
            style={{
              gridTemplateColumns: "minmax(110px, 190px) 1fr max-content",
            }}
          >
            <span className="truncate text-right text-[13px] text-doc-ink">
              {row.function}
            </span>

            <div className="min-w-0">
              <div
                className="h-[22px] overflow-hidden rounded-[3px] bg-doc-hair"
                style={{ width: `${trackPct}%` }}
              >
                <div className="h-full bg-doc-gold" style={{ width: `${goldPct}%` }} />
              </div>
            </div>

            <span className="whitespace-nowrap text-[12px] tabular-nums text-doc-muted">
              ${row.loadedCostM.toFixed(1)}M · {row.fte} FTE
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CostLegend() {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-doc-faint">
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-[11px] rounded-[3px] bg-doc-gold" aria-hidden />
        Addressable share of function cost
      </span>
      <span className="flex items-center gap-1.5">
        <i className="inline-block size-[11px] rounded-[3px] bg-doc-hair" aria-hidden />
        Retained
      </span>
    </p>
  );
}
