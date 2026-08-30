import type { ReportHeatRow } from "@/data/offshoringReport";

const LEVELS = [
  { key: "junior", label: "Junior" },
  { key: "mid", label: "Mid" },
  { key: "senior", label: "Senior" },
  { key: "lead", label: "Lead" },
] as const;

const SCALE = [
  { min: 70, className: "bg-doc-gold text-doc-ink", label: "≥70 High" },
  { min: 60, className: "bg-doc-gold-2 text-doc-ink", label: "60–69" },
  { min: 50, className: "bg-doc-gold-3 text-doc-ink", label: "50–59" },
  { min: 40, className: "bg-doc-gold-4 text-doc-ink", label: "40–49" },
  { min: 0, className: "bg-doc-gold-5 text-doc-ink", label: "<40 Retain" },
];

function cellClass(score: number) {
  return SCALE.find((step) => score >= step.min)?.className ?? SCALE[SCALE.length - 1].className;
}

export interface HeatTableProps {
  rows: ReportHeatRow[];
}

/** Sourcing potential (0–100) by function × seniority level. */
export function HeatTable({ rows }: HeatTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-separate border-spacing-[2px] text-[11.5px]">
        <thead>
          <tr>
            <th className="pb-1 pl-0 pr-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
              Function
            </th>
            {LEVELS.map((level) => (
              <th
                key={level.key}
                className="px-1 pb-1 text-center text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-faint"
              >
                {level.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.function}>
              <td className="whitespace-nowrap pr-3 text-[12px] leading-tight text-doc-ink">
                {row.function}
                <span className="ml-1.5 text-[10.5px] font-normal text-doc-faint">
                  {row.model}
                </span>
              </td>
              {LEVELS.map((level) => {
                const score = row[level.key];
                return score === null ? (
                  <td
                    key={level.key}
                    className="rounded-[4px] bg-doc-null px-1 py-1 text-center text-doc-faint"
                  >
                    ·<span className="sr-only">No roles at this level</span>
                  </td>
                ) : (
                  <td
                    key={level.key}
                    className={`rounded-[4px] px-1 py-1 text-center font-medium tabular-nums ${cellClass(score)}`}
                  >
                    {score}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HeatLegend() {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[11px] text-doc-faint">
      {SCALE.map((step) => (
        <span key={step.label} className="flex items-center gap-1.5">
          <i
            className={`inline-block size-[11px] rounded-[3px] ${step.className.split(" ")[0]}`}
            aria-hidden
          />
          {step.label}
        </span>
      ))}
    </p>
  );
}
