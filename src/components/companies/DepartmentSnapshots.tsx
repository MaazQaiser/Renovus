"use client";

import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { recordHref } from "@/components/records/recordMeta";
import { formatDate } from "@/lib/format";
import type { AppHref } from "@/lib/routes";
import type { SalesReportData } from "@/lib/assessment/sales-report";
import type { WorkflowReportData } from "@/types/workflow";
import { cn } from "@/lib/cn";

const CARD =
  "flex flex-col rounded-xl border border-glass-border bg-glass px-5 py-4 shadow-[var(--shadow-glass)] backdrop-blur-2xl";

/**
 * Card header: what this is and when, with the card's actions on the right.
 *
 * Actions sit up here rather than at the foot of the card so the two snapshots
 * line up — the workflow card's step list would otherwise push its button far
 * below the bottom line's.
 */
function CardHead({
  label,
  date,
  actions,
}: {
  label: string;
  date?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <p className="flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">
        {label}
        {date ? (
          <span className="font-normal normal-case tracking-normal text-tertiary">
            {formatDate(date)}
          </span>
        ) : null}
      </p>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

/** A figure and its label, used across both snapshots so they read alike. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-[15px] leading-none font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-tertiary">
        {label}
      </p>
    </div>
  );
}

export interface BottomLineCardProps {
  report?: SalesReportData;
  recordId?: string;
  completedAt?: string;
  /**
   * Starts the baseline. Offered as the primary action when none exists, and
   * as a quieter re-run once one does.
   */
  onStart?: () => void;
  departmentName: string;
}

/**
 * The baseline's headline, so the department page answers "how are we doing"
 * without opening a report.
 *
 * With no baseline this becomes the page's primary call to action — there is
 * nothing else to do here until one exists.
 */
export function BottomLineCard({
  report,
  recordId,
  completedAt,
  onStart,
  departmentName,
}: BottomLineCardProps) {
  if (!report || !recordId) {
    return (
      <section className={cn(CARD, "border-dashed")}>
        <CardHead label="Bottom line" />
        <p className="mt-3 text-[15px] font-semibold text-foreground">No baseline yet</p>
        <Text size="body-sm" tone="secondary" className="mt-1 max-w-[46ch]">
          The baseline captures how {departmentName.toLowerCase()} runs today. Everything
          else on this page follows from it.
        </Text>
        {onStart ? (
          <Button
            variant="primary"
            size="sm"
            trailingIcon={ArrowRight}
            className="mt-4"
            onClick={onStart}
          >
            Start assessment
          </Button>
        ) : null}
      </section>
    );
  }

  return (
    <section className={CARD}>
      <CardHead
        label="Bottom line"
        date={completedAt}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={FileText}
              href={recordHref(recordId)}
            >
              View detailed report
            </Button>
            {onStart ? (
              <Button variant="ghost" size="sm" trailingIcon={ArrowRight} onClick={onStart}>
                Re-assess
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mt-3 flex items-end gap-3">
        <p className="font-display text-[32px] leading-none font-semibold tabular-nums text-foreground">
          {report.partC.measuredPct}%
        </p>
        <Text size="body-sm" tone="secondary" className="pb-0.5">
          of what we captured is measured, not remembered
        </Text>
      </div>

      <span className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border-subtle" aria-hidden>
        <span
          className="h-full rounded-full bg-accent"
          style={{ width: `${report.partC.measuredPct}%` }}
        />
      </span>

      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        <Stat value={String(report.partB.keyNumbers.length)} label="Key numbers" />
        <Stat value={String(report.partB.gaps.length)} label="Gaps" />
        <Stat value={String(report.partD.length)} label="Open questions" />
        <Stat value={String(report.partE.opportunities.length)} label="Opportunities" />
      </div>

      {report.partC.verdict ? (
        <p className="mt-4 border-l-2 border-border-subtle pl-3 text-[13px] leading-5 text-secondary">
          {report.partC.verdict}
        </p>
      ) : null}

    </section>
  );
}

export interface CurrentWorkflowCardProps {
  report?: WorkflowReportData;
  recordId?: string;
  completedAt?: string;
  /** False until the baseline exists — the workflow is read from it. */
  unlocked: boolean;
}

/**
 * The workflow as it runs today, with the agentic version one click away.
 *
 * The button deep-links to the report's agentic tab rather than its default
 * current-process tab: this card already shows the current state, so the
 * useful next screen is the redesign.
 */
export function CurrentWorkflowCard({
  report,
  recordId,
  completedAt,
  unlocked,
}: CurrentWorkflowCardProps) {
  if (!report || !recordId) {
    return (
      <section className={cn(CARD, "border-dashed")}>
        <CardHead label="Current workflow" />
        <p className="mt-3 text-[15px] font-semibold text-foreground">
          Not identified yet
        </p>
        <Text size="body-sm" tone="secondary" className="mt-1 max-w-[46ch]">
          {unlocked
            ? "The baseline is in. The workflow agent is still in build, so the stage-by-stage map is not available yet."
            : "Identified once the baseline is saved — the workflow assessment reads the process it captured."}
        </Text>
      </section>
    );
  }

  const { baseline, delta, stages } = report;
  const peakHours = Math.max(...stages.map((stage) => stage.hoursPerWeek));

  return (
    <section className={CARD}>
      <CardHead
        label="Current workflow"
        date={completedAt}
        actions={
          <Button
            variant="secondary"
            size="sm"
            trailingIcon={ArrowRight}
            href={recordHref(recordId)}
          >
            View report
          </Button>
        }
      />

      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
        <Stat value={`${baseline.hoursPerWeek} hrs`} label="A week" />
        <Stat value={`${baseline.clericalHours} hrs`} label="Of it clerical" />
        <Stat value={String(stages.length)} label="Stages" />
        <Stat value={`${baseline.cycleDays} days`} label="Cycle" />
      </div>

      {/* One card per step, in the same shape as the agent cards opposite:
          title, who runs it, what happens, and what it costs. */}
      <ul className="mt-4 flex flex-col gap-2">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-[13px] font-semibold text-foreground">
                {stage.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                {stage.who}
              </span>
            </div>

            <p className="mt-1 text-[12px] leading-[1.45] text-secondary">
              {stage.today.charAt(0).toUpperCase()}
              {stage.today.slice(1)}.
            </p>

            <div className="mt-2 flex items-center gap-2.5">
              <span
                className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle"
                aria-hidden
              >
                <span
                  className="h-full rounded-full bg-border-strong"
                  style={{ width: `${(stage.hoursPerWeek / peakHours) * 100}%` }}
                />
              </span>
              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-secondary">
                {stage.hoursPerWeek} hrs a week
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-4">
        <p className="border-l-2 border-accent pl-3 text-[13px] leading-5 text-secondary">
          <span className="font-semibold text-foreground">
            {delta.sellingHoursGained} hours a week
          </span>{" "}
          could move from admin to selling on the same team and budget.
        </p>
      </div>

    </section>
  );
}

export interface AgenticWorkflowCardProps {
  report?: WorkflowReportData;
  recordId?: string;
  /** False until the baseline exists — the workflow is read from it. */
  unlocked: boolean;
}

/**
 * The same eight steps with an agent in them, in the same shape as
 * CurrentWorkflowCard so the two sit side by side and compare line for line.
 *
 * Its report link opens the agentic tab, since that is what this card is a
 * summary of.
 */
export function AgenticWorkflowCard({
  report,
  recordId,
  unlocked,
}: AgenticWorkflowCardProps) {
  if (!report || !recordId) {
    return (
      <section className={cn(CARD, "border-dashed")}>
        <CardHead label="Agentic workflow" />
        <p className="mt-3 text-[15px] font-semibold text-foreground">Not proposed yet</p>
        <Text size="body-sm" tone="secondary" className="mt-1 max-w-[46ch]">
          {unlocked
            ? "The baseline is in. The workflow agent is still in build, so there is no redesign to show yet."
            : "Proposed once the workflow assessment has run — it redesigns the process the baseline captured."}
        </Text>
      </section>
    );
  }

  const { agentic, delta, stages } = report;

  return (
    <section className={CARD}>
      <CardHead
        label="Agentic workflow"
        actions={
          <Button
            variant="secondary"
            size="sm"
            trailingIcon={ArrowRight}
            href={`${recordHref(recordId)}?tab=agentic` as AppHref}
          >
            View report
          </Button>
        }
      />

      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
        <Stat value={`${agentic.hoursPerWeek} hrs`} label="A week" />
        <Stat value={`${agentic.clericalHours} hrs`} label="Of it clerical" />
        <Stat value={`${agentic.agentStages}/${stages.length}`} label="To an agent" />
        <Stat value={`${agentic.cycleDays} days`} label="Cycle" />
      </div>

      {/* One card per agent: what it is called, the stage it takes, and the
          hours it hands back — the saving is the reason it exists. */}
      <ul className="mt-4 flex flex-col gap-2">
        {stages.map((stage) => {
          const saved = stage.hoursPerWeek - stage.hoursAfter;
          return (
            <li
              key={stage.id}
              className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[13px] font-semibold text-foreground">
                  {stage.agentName}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tertiary">
                  {stage.name}
                  {stage.owner === "Human" ? " · stays human" : ""}
                </span>
              </div>

              <p className="mt-1 text-[12px] leading-[1.45] text-secondary">
                {stage.withAgent.charAt(0).toUpperCase()}
                {stage.withAgent.slice(1)}.
              </p>

              <div className="mt-2 flex items-center gap-2.5">
                <span
                  className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle"
                  aria-hidden
                >
                  <span
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(saved / stage.hoursPerWeek) * 100}%` }}
                  />
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-tertiary">
                  {stage.hoursPerWeek} → {stage.hoursAfter} hrs
                </span>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-accent">
                  −{saved} hrs
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        <p className="border-l-2 border-accent pl-3 text-[13px] leading-5 text-secondary">
          <span className="font-semibold text-foreground">
            {delta.sellingHoursGained} hours a week
          </span>{" "}
          handed back across {agentic.agentStages} agents — {delta.accountsGained} more
          accounts a week at the same headcount, {delta.cycleDays} days faster to
          signature.
        </p>
      </div>
    </section>
  );
}
