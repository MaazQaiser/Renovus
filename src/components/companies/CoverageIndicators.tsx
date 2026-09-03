"use client";

import { Tooltip } from "@/components/primitives/Tooltip";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import {
  STATUS_LABEL,
  type CompanyCoverage,
  type CoverageStatus,
  type DepartmentCoverage,
} from "@/lib/coverage";

const SEGMENT_TONE: Record<CoverageStatus, string> = {
  covered: "bg-accent",
  "not-assessed": "bg-border-strong",
  "no-agent": "bg-border-subtle",
};

function departmentTooltip(item: DepartmentCoverage): React.ReactNode {
  const lines = [`${item.department.name} — ${STATUS_LABEL[item.status]}`];

  if (item.status === "covered") {
    lines.push(
      `${item.assessmentCount} assessment${item.assessmentCount === 1 ? "" : "s"}`,
    );
    if (item.lastAssessedAt) lines.push(`Last ${formatDate(item.lastAssessedAt)}`);
  } else if (item.status === "not-assessed") {
    lines.push("An agent is ready — nothing assessed yet.");
  } else {
    lines.push("No assessment agent has been built for this department yet.");
  }

  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-semibold">{lines[0]}</span>
      {lines.slice(1).map((line) => (
        <span key={line} className="opacity-80">
          {line}
        </span>
      ))}
    </span>
  );
}

export interface CoverageMeterProps {
  coverage: CompanyCoverage;
  /** Show the "n of m departments" caption under the bar. */
  withCaption?: boolean;
  /**
   * The trailing percentage. Turn it off where the caller already shows the
   * figure, so it isn't printed twice side by side.
   */
  showValue?: boolean;
  className?: string;
}

/**
 * Segmented coverage bar — one segment per department — plus the percentage.
 *
 * Deliberately not wrapped in one tooltip covering the whole bar: an outer
 * tooltip swallows the hover on the segments inside, so the per-department
 * tooltips would never fire. Each segment names itself instead, and the
 * caption below carries the overall reading.
 */
export function CoverageMeter({
  coverage,
  withCaption = false,
  showValue = true,
  className,
}: CoverageMeterProps) {
  const notCovered = coverage.totalCount - coverage.coveredCount;

  return (
    <div className={cn("flex w-full flex-col gap-1", className)}>
      <div className="flex items-center gap-2">
        {/* One segment per department, each its own hover target so it can name
            itself. The visual line stays 6px; the wrapper's padding gives the
            pointer something bigger to land on. */}
        <div className="flex flex-1 gap-0.5">
          {coverage.departments.map((item) => (
            <Tooltip
              key={item.department.id}
              content={departmentTooltip(item)}
              className="flex-1 items-center py-1.5"
            >
              <span
                role="img"
                tabIndex={0}
                aria-label={`${item.department.name}: ${STATUS_LABEL[item.status]}`}
                className={cn(
                  "block h-1.5 w-full rounded-full",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  SEGMENT_TONE[item.status],
                )}
              />
            </Tooltip>
          ))}
        </div>
        {showValue ? (
          <span className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums text-foreground">
            {coverage.percent}%
          </span>
        ) : null}
      </div>

      {withCaption ? (
        <span className="text-[11.5px] text-tertiary">
          {coverage.coveredCount} of {coverage.totalCount} departments covered
          {notCovered > 0 ? ` · ${notCovered} open` : ""}
        </span>
      ) : null}
    </div>
  );
}
