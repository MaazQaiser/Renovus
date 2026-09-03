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

/** Abbreviations for the badge strip, where the full names don't fit. */
const SHORT_LABEL: Record<string, string> = {
  sales: "SAL",
  marketing: "MKT",
  finance: "FIN",
  hr: "HR",
  operations: "OPS",
};

const BADGE_TONE: Record<CoverageStatus, string> = {
  covered: "border-transparent bg-accent text-inverse",
  "not-assessed": "border-border-strong bg-glass text-secondary",
  "no-agent": "border-border-subtle border-dashed bg-transparent text-disabled",
};

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

export interface DepartmentBadgesProps {
  coverage: CompanyCoverage;
  /** Full department names instead of abbreviations. */
  expanded?: boolean;
  className?: string;
}

/** One badge per department, tinted by coverage status. */
export function DepartmentBadges({
  coverage,
  expanded = false,
  className,
}: DepartmentBadgesProps) {
  return (
    <ul className={cn("flex flex-nowrap items-center gap-1 whitespace-nowrap", className)}>
      {coverage.departments.map((item) => (
        <li key={item.department.id}>
          <Tooltip content={departmentTooltip(item)}>
            <span
              tabIndex={0}
              className={cn(
                "inline-flex cursor-default items-center rounded-full border px-2 py-0.5",
                "text-[10.5px] font-semibold uppercase tracking-[0.06em]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                BADGE_TONE[item.status],
              )}
            >
              {expanded
                ? item.department.name
                : SHORT_LABEL[item.department.id] ??
                  item.department.name.slice(0, 3).toUpperCase()}
              <span className="sr-only">
                {": "}
                {STATUS_LABEL[item.status]}
              </span>
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
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

/** Segmented bar — one segment per department — plus the overall percentage. */
export function CoverageMeter({
  coverage,
  withCaption = false,
  showValue = true,
  className,
}: CoverageMeterProps) {
  const notCovered = coverage.totalCount - coverage.coveredCount;

  return (
    <Tooltip
      block
      className={className}
      content={
        <span className="flex flex-col gap-0.5">
          <span className="font-semibold">
            Overall coverage {coverage.percent}%
          </span>
          <span className="opacity-80">
            {coverage.coveredCount} of {coverage.totalCount} departments have a saved
            assessment.
          </span>
          {coverage.availableCount < coverage.totalCount ? (
            <span className="opacity-80">
              {coverage.totalCount - coverage.availableCount} department
              {coverage.totalCount - coverage.availableCount === 1 ? "" : "s"} have no
              agent yet, so they can&apos;t be covered.
            </span>
          ) : null}
        </span>
      }
    >
      <span className="flex w-full flex-col gap-1">
        <span className="flex items-center gap-2">
          <span
            className="flex h-1.5 flex-1 gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label={`Coverage ${coverage.percent} percent, ${coverage.coveredCount} of ${coverage.totalCount} departments`}
          >
            {coverage.departments.map((item) => (
              <span
                key={item.department.id}
                className={cn("h-full flex-1 rounded-full", SEGMENT_TONE[item.status])}
              />
            ))}
          </span>
          {showValue ? (
            <span className="w-9 shrink-0 text-right text-[12px] font-semibold tabular-nums text-foreground">
              {coverage.percent}%
            </span>
          ) : null}
        </span>

        {withCaption ? (
          <span className="text-[11.5px] text-tertiary">
            {coverage.coveredCount} of {coverage.totalCount} departments covered
            {notCovered > 0 ? ` · ${notCovered} open` : ""}
          </span>
        ) : null}
      </span>
    </Tooltip>
  );
}
