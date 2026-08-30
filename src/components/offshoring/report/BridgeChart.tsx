import { cn } from "@/lib/cn";
import type { ReportBridgeBar } from "@/data/offshoringReport";

const TONE: Record<ReportBridgeBar["tone"], string> = {
  ink: "bg-doc-ink",
  gold: "bg-doc-gold",
  pale: "bg-doc-gold-4",
};

export interface BridgeChartProps {
  bars: ReportBridgeBar[];
}

/** Year-1 waterfall: gross cost moved, less offshore cost and one-offs, to net. */
export function BridgeChart({ bars }: BridgeChartProps) {
  const max = Math.max(...bars.map((bar) => bar.amount), 0.0001);

  return (
    <div>
      <div className="flex h-[240px] items-end gap-2 border-b border-doc-sep">
        {bars.map((bar) => (
          // h-full is what lets each bar's percentage height resolve.
          <div
            key={bar.label}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
          >
            <span className="mb-1.5 text-[11px] tabular-nums text-doc-ink">{bar.value}</span>
            <div
              className={cn("w-full rounded-t-[3px]", TONE[bar.tone])}
              // A floor keeps a near-zero bar (year-1 net) visible as a sliver.
              style={{ height: `${Math.max((bar.amount / max) * 100, 1.5)}%` }}
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        {bars.map((bar) => (
          <span
            key={bar.label}
            className="min-w-0 flex-1 text-center text-[10.5px] leading-[1.35] text-doc-muted"
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}
