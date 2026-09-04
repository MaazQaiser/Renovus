"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, CircleDashed, CircleSlash } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { formatDate } from "@/lib/format";
import { STATUS_LABEL, type CoverageStatus, type DepartmentCoverage } from "@/lib/coverage";
import { cn } from "@/lib/cn";
import { recordHref } from "@/components/records/recordMeta";
import type { AppHref } from "@/lib/routes";
import { departmentHref } from "./companyMeta";

const STATUS_ICON: Record<CoverageStatus, typeof CircleCheck> = {
  covered: CircleCheck,
  "not-assessed": CircleDashed,
  "no-agent": CircleSlash,
};

const STATUS_TONE: Record<CoverageStatus, string> = {
  covered: "text-success",
  "not-assessed": "text-warning",
  "no-agent": "text-disabled",
};

export interface DepartmentCardProps {
  companyId: string;
  item: DepartmentCoverage;
  /**
   * Starts the baseline from here. Passed only where there is nothing to open
   * yet — see the note on actions below.
   */
  onStart?: () => void;
}

/**
 * One department at a glance, linking to its own page.
 *
 * It carries one action and only one: starting the baseline, and only while no
 * baseline exists. Everything you can do to a report that *does* exist —
 * opening it, re-running it, the workflow step after it — lives on the
 * department page alone, so those cannot drift out of sync between two screens.
 * A card with nothing behind it has nothing to drift.
 *
 * A department with no agent is not a link — there is nothing behind it yet.
 */
export function DepartmentCard({ companyId, item, onStart }: DepartmentCardProps) {
  const Icon = STATUS_ICON[item.status];
  const steps = [item.status === "covered", item.workflow?.status === "covered"];
  const done = steps.filter(Boolean).length;
  const linked = item.status !== "no-agent";

  /**
   * The process baseline is the fullest picture of how the department runs, so
   * it is the destination when one exists; the workflow report is the fallback,
   * and the department page last, since it is the only place to start an
   * assessment when nothing is saved.
   */
  const reportId = item.processRecordId ?? item.workflow?.latestRecordId;
  const href: AppHref = reportId
    ? recordHref(reportId)
    : departmentHref(companyId, item.department.id);

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Icon className={cn("size-4 shrink-0", STATUS_TONE[item.status])} aria-hidden />
          <span className="truncate text-[14px] font-semibold text-foreground">
            {item.department.name}
          </span>
        </span>
        {linked ? (
          <ArrowRight
            size={14}
            className="mt-0.5 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="mt-2">
        {item.status === "covered" ? (
          <Badge tone="success" variant="subtle">
            {STATUS_LABEL[item.status]}
          </Badge>
        ) : item.status === "not-assessed" ? (
          <Badge tone="warning" variant="subtle">
            {STATUS_LABEL[item.status]}
          </Badge>
        ) : (
          <Badge tone="neutral" variant="outline">
            {STATUS_LABEL[item.status]}
          </Badge>
        )}
      </div>

      {/* Two steps per department: the baseline, then its workflow assessment. */}
      {linked ? (
        <>
          <span className="mt-3 flex gap-1" aria-hidden>
            {steps.map((complete, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  complete ? "bg-success" : "bg-border-subtle",
                )}
              />
            ))}
          </span>
          <Text size="caption" tone="tertiary" className="mt-1.5">
            {done} of 2 steps
            {item.lastAssessedAt ? ` · last ${formatDate(item.lastAssessedAt)}` : ""}
          </Text>
        </>
      ) : (
        <Text size="caption" tone="tertiary" className="mt-3">
          No agent built for this department yet.
        </Text>
      )}
    </>
  );

  if (!linked) {
    return (
      <li className="rounded-xl border border-glass-border bg-glass-quiet px-4 py-3.5">
        {body}
      </li>
    );
  }

  // The action is a sibling of the link rather than inside it: a button nested
  // in an anchor is neither valid nor clickable in isolation.
  return (
    <li className="group flex h-full flex-col rounded-xl border border-glass-border bg-glass px-4 py-3.5 shadow-[var(--shadow-glass)] backdrop-blur-2xl transition-colors hover:bg-glass-strong focus-within:ring-2 focus-within:ring-accent">
      <Link
        href={href}
        className="flex flex-1 flex-col focus-visible:outline-none"
      >
        {body}
      </Link>

      {onStart ? (
        <Button
          variant="secondary"
          size="sm"
          trailingIcon={ArrowRight}
          className="mt-3 self-start"
          onClick={onStart}
        >
          Start assessment
        </Button>
      ) : null}
    </li>
  );
}
