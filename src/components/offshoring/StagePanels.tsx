"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";
import type { PreviewSnapshot } from "@/lib/offshoring/preview";
import type { DetectedFunction } from "@/types/offshoring";

const MODEL_TONE: Record<PreviewSnapshot["rows"][number]["model"], string> = {
  "Lift-out": "border-accent-border bg-accent-subtle text-accent",
  Hybrid: "border-warning-border bg-warning-subtle text-warning",
  "Role-by-role": "border-border bg-surface-tertiary text-secondary",
};

/**
 * A glass card whose header strip is the disclosure trigger.
 *
 * The tables in here run long enough to push the question and its answer
 * options below the fold, so the read is worth being able to fold away. Open
 * by default: it is the first-pass read, not an aside.
 */
function CollapsibleCard({
  title,
  meta,
  children,
}: {
  title: string;
  /** Optional summary shown beside the title, e.g. a row count. */
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  const triggerId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors",
          "hover:bg-glass-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          open && "border-b border-glass-hairline",
        )}
      >
        <Text size="caption" tone="tertiary" className="uppercase tracking-[0.1em]">
          {title}
        </Text>
        <span className="flex min-w-0 flex-1 items-baseline justify-end gap-2">
          {meta}
          <ChevronDown
            size={14}
            strokeWidth={2}
            aria-hidden
            className={cn(
              "shrink-0 self-center text-tertiary transition-transform duration-150",
              open ? "rotate-0" : "-rotate-90",
            )}
          />
        </span>
      </button>

      {open ? (
        <div id={panelId} role="region" aria-labelledby={triggerId}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The detected function list for the scope question.
 *
 * This used to be interpolated into the headline, which turned a question into
 * an unreadable paragraph of names and numbers. Headcount is data — it belongs
 * in a table the eye can scan, with the question left short above it.
 */
export function FunctionScopeList({ functions }: { functions: DetectedFunction[] }) {
  if (functions.length === 0) return null;
  const total = functions.reduce((sum, fn) => sum + fn.fte, 0);
  const max = Math.max(...functions.map((fn) => fn.fte), 1);

  return (
    <div className="overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
      <div className="flex items-baseline justify-between border-b border-glass-hairline px-4 py-2.5">
        <Text size="caption" tone="tertiary" className="uppercase tracking-[0.1em]">
          Functions detected
        </Text>
        <Text size="caption" tone="secondary" className="tabular-nums">
          {functions.length} functions · {total} FTE
        </Text>
      </div>
      <ul>
        {functions.map((fn) => (
          <li
            key={fn.id}
            className="flex items-center gap-3 border-b border-glass-hairline px-4 py-2 last:border-b-0"
          >
            <span className="min-w-0 flex-1 truncate text-[14px] text-foreground">
              {fn.label}
            </span>
            <span
              aria-hidden
              className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-border-subtle sm:block"
            >
              <span
                className="block h-full rounded-full bg-gold"
                style={{ width: `${Math.round((fn.fte / max) * 100)}%` }}
              />
            </span>
            <span className="w-14 shrink-0 text-right text-[13px] font-semibold tabular-nums text-foreground">
              {fn.fte}
              <span className="ml-1 text-[11px] font-normal text-tertiary">FTE</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The between-rounds first-pass read: headline figures, then the seed heatmap.
 * Rendered from the same snapshot that produces the stored transcript line.
 */
export function PreviewPanel({ snapshot }: { snapshot: PreviewSnapshot }) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {snapshot.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-glass-border bg-glass p-3 shadow-[var(--shadow-glass)] backdrop-blur-2xl"
          >
            <dt className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-tertiary">
              {stat.label}
            </dt>
            <dd className="mt-1 text-[19px] font-semibold leading-6 tabular-nums text-foreground">
              {stat.value}
            </dd>
            {stat.hint ? (
              <dd className="text-[11.5px] leading-4 text-tertiary">{stat.hint}</dd>
            ) : null}
          </div>
        ))}
      </dl>

      <CollapsibleCard
        title="Function heatmap · seed scores"
        meta={
          <Text size="caption" tone="secondary" className="tabular-nums">
            {snapshot.rows.length} functions
          </Text>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-[13px]">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-[0.08em] text-tertiary">
                <th className="px-4 py-1.5 text-left font-semibold">Function</th>
                <th className="px-2 py-1.5 text-right font-semibold">High</th>
                <th className="px-2 py-1.5 text-right font-semibold">Med</th>
                <th className="px-2 py-1.5 text-right font-semibold">Low</th>
                <th className="px-4 py-1.5 text-right font-semibold">Model</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.rows.map((row) => (
                <tr key={row.id} className="border-t border-glass-hairline">
                  <td className="px-4 py-2 text-foreground">{row.label}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums text-foreground">
                    {row.high}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-secondary">
                    {row.med}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-tertiary">
                    {row.low}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={cn(
                        "inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[10.5px] font-semibold",
                        MODEL_TONE[row.model],
                      )}
                    >
                      {row.model}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>
    </div>
  );
}
