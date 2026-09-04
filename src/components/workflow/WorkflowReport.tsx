"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import {
  Caption,
  DocTitle,
  FootLine,
  Kicker,
  Rollup,
} from "@/components/report/DocPrimitives";
import { getMockWorkflowReport } from "@/data/workflowReport";
import type { AppHref } from "@/lib/routes";
import type { StepOwner, WorkflowReportData, WorkflowStage } from "@/types/workflow";
import { cn } from "@/lib/cn";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";

/** Human-owned stages read as a deliberate choice, not a gap. */
const OWNER_STYLE: Record<StepOwner, { chip: string; node: string; short: string }> = {
  Agent: { chip: "bg-doc-gold text-doc-ink", node: "border-doc-gold bg-doc-gold-4", short: "Agent" },
  "Agent + review": {
    chip: "bg-doc-gold-4 text-doc-amber",
    node: "border-doc-gold bg-doc-gold-4",
    short: "Agent",
  },
  Human: { chip: "bg-doc-hair text-doc-muted", node: "border-doc-hair bg-white", short: "Human" },
};

function money(value: number): string {
  return `$${(value / 1000).toFixed(0)}k`;
}

/** One part's figures. Same shape both sides, so they compare at a glance. */
function Figures({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-4">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd className="text-[22px] leading-none font-semibold tabular-nums text-doc-ink">
            {stat.value}
          </dd>
          <dt className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}

/** The stage chain. `agentic` colours each node by who owns it afterwards. */
function Flow({ stages, agentic }: { stages: WorkflowStage[]; agentic: boolean }) {
  return (
    <ol className="mt-4 flex items-stretch gap-1 overflow-x-auto pb-1">
      {stages.map((stage, index) => (
        <li key={stage.id} className="flex shrink-0 items-center gap-1">
          <div
            className={cn(
              "w-[92px] rounded-md border px-2 py-2",
              agentic ? OWNER_STYLE[stage.owner].node : "border-doc-hair bg-white",
            )}
          >
            <p className="text-[10px] font-semibold tabular-nums text-doc-faint">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-0.5 truncate text-[12.5px] font-semibold text-doc-ink">
              {stage.name}
            </p>
            <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-doc-muted">
              {agentic ? OWNER_STYLE[stage.owner].short : "Manual"}
            </p>
          </div>
          {index < stages.length - 1 ? (
            <ArrowRight size={12} className="shrink-0 text-doc-faint" aria-hidden />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

const TABS = [
  { id: "current", label: "Current manual process", note: "Baseline — what the workflow costs now" },
  { id: "agentic", label: "Agentic workflow", note: "The same stages, redesigned" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface WorkflowReportProps {
  /** A saved report. Omit to render the mock for the live session. */
  report?: WorkflowReportData;
  /** Where "back" goes — the owning PortCo's page. */
  backHref?: AppHref;
}

export function WorkflowReport({ report: archived, backHref }: WorkflowReportProps = {}) {
  const report = useMemo(
    () => archived ?? getMockWorkflowReport("Portfolio company"),
    [archived],
  );

  const topbarMeta = useMemo(
    () => ({
      title: "Workflow Assessment",
      badges: [report.companyName, report.department],
      actions: (
        <Button href={backHref ?? ("/companies" as AppHref)} variant="secondary" size="sm">
          {backHref ? "Back to PortCo" : "Back to PortCos"}
        </Button>
      ),
    }),
    [report.companyName, report.department, backHref],
  );
  useSetTopbarMeta(topbarMeta);

  // ?tab=agentic lets the department page's workflow card land on the redesign,
  // since that card already shows the current state.
  const params = useSearchParams();
  const requested = params.get("tab");
  const [tab, setTab] = useState<TabId>(
    TABS.some((item) => item.id === requested) ? (requested as TabId) : "current",
  );

  const step = useCallback((delta: number) => {
    setTab((current) => {
      const index = TABS.findIndex((item) => item.id === current);
      return TABS[Math.min(Math.max(index + delta, 0), TABS.length - 1)].id;
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const { baseline, agentic, delta, stages } = report;
  const peakHours = Math.max(...stages.map((stage) => stage.hoursPerWeek));
  const activeNote = TABS.find((item) => item.id === tab)?.note;

  return (
    <div className="bg-surface font-sans text-doc-ink">
      <div className="mx-auto max-w-[1100px] px-8 py-10">
        <Kicker>
          Workflow Assessment · {report.department} · {report.processModel}
        </Kicker>
        <DocTitle highlight={report.headlineValue}>{report.headlineRest}</DocTitle>
        <Caption>
          {report.companyName} · {stages.length} stages · current process measured, then
          redesigned
        </Caption>

        {/* Two tabs: the workflow as it runs, then as it would run. Both
            panels carry the same figure shape so they compare directly. */}
        <div
          role="tablist"
          aria-label="Report parts"
          className="mt-8 flex gap-6 border-b border-doc-sep"
        >
          {TABS.map((item, index) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex h-[46px] shrink-0 items-center gap-1.5 border-b-2 text-[13px] transition-colors",
                  active
                    ? "border-doc-gold font-semibold text-doc-ink"
                    : "border-transparent font-medium text-doc-muted hover:text-doc-ink",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] font-semibold tabular-nums",
                    active ? "text-doc-amber" : "text-doc-faint",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.label}
              </button>
            );
          })}
          <span className="ml-auto hidden items-center whitespace-nowrap text-[11px] text-doc-faint lg:flex">
            ← → to switch
          </span>
        </div>

        {activeNote ? (
          <p className="mt-3 text-[12px] text-doc-faint">{activeNote}</p>
        ) : null}

        {tab === "current" ? (
          <section>
          <Figures
            stats={[
              { value: `${baseline.hoursPerWeek} hrs`, label: "On the workflow" },
              { value: `${baseline.clericalHours} hrs`, label: "Of it clerical" },
              { value: String(baseline.people), label: "People" },
              { value: money(baseline.annualCost), label: "Budget a year" },
              { value: `${baseline.cycleDays} days`, label: "Lead to signature" },
              { value: String(baseline.accountsPerWeek), label: "Accounts a week" },
            ]}
          />

          <Flow stages={stages} agentic={false} />

          <ul className="mt-4 divide-y divide-doc-hair border-y border-doc-hair">
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                className="grid items-center gap-x-4 gap-y-1 py-2.5 md:grid-cols-[auto_8rem_1fr_6rem]"
              >
                <span className="text-[11px] font-semibold tabular-nums text-doc-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] font-semibold text-doc-ink">{stage.name}</span>
                <span className="min-w-0 text-[12.5px] leading-[1.5] text-doc-muted">
                  {stage.who} {stage.today}.
                </span>
                <span className="flex items-center justify-end gap-2">
                  <span className="flex h-1.5 w-12 overflow-hidden rounded-full bg-doc-hair">
                    <span
                      className="h-full rounded-full bg-doc-muted"
                      style={{ width: `${(stage.hoursPerWeek / peakHours) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-[11.5px] tabular-nums text-doc-muted">
                    {stage.hoursPerWeek} hrs
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Rollup>
            {baseline.clericalHours} of the {baseline.hoursPerWeek} hours are clerical —
            list building, note-taking, proposal assembly, re-keying signed terms. That
            is the ceiling on how many accounts the team can carry.
          </Rollup>
          </section>
        ) : null}

        {tab === "agentic" ? (
          <section>
          <Figures
            stats={[
              { value: `${agentic.hoursPerWeek} hrs`, label: "On the workflow" },
              { value: `${agentic.clericalHours} hrs`, label: "Of it clerical" },
              { value: String(agentic.people), label: "People — unchanged" },
              { value: money(agentic.annualCost), label: "Budget — unchanged" },
              { value: `${agentic.cycleDays} days`, label: "Lead to signature" },
              { value: String(agentic.accountsPerWeek), label: "Accounts a week" },
            ]}
          />

          <Flow stages={stages} agentic />

          <ul className="mt-4 divide-y divide-doc-hair border-y border-doc-hair">
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                className="grid items-center gap-x-4 gap-y-1 py-2.5 md:grid-cols-[auto_8rem_1fr_6rem]"
              >
                <span className="text-[11px] font-semibold tabular-nums text-doc-faint">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-doc-ink">
                    {stage.name}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
                      OWNER_STYLE[stage.owner].chip,
                    )}
                  >
                    {OWNER_STYLE[stage.owner].short}
                  </span>
                </span>
                <span className="min-w-0 border-l-2 border-doc-gold pl-3 text-[12.5px] leading-[1.5] text-doc-body">
                  <span className="font-semibold">{stage.agentName}</span>{" "}
                  {stage.withAgent}.
                </span>
                <span className="flex items-center justify-end gap-2">
                  <span className="flex h-1.5 w-12 overflow-hidden rounded-full bg-doc-hair">
                    <span
                      className="h-full rounded-full bg-doc-gold"
                      style={{ width: `${(stage.hoursAfter / peakHours) * 100}%` }}
                    />
                  </span>
                  <span className="w-12 text-right text-[11.5px] tabular-nums text-doc-muted">
                    {stage.hoursAfter} hrs
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <Rollup>
            Nobody leaves and nothing is cut: the same {agentic.people} people on the same
            budget put {delta.sellingHoursGained} more hours a week in front of customers.
            Negotiation stays human — the agent keeps the record and the guardrails, not
            the conversation.
          </Rollup>
          </section>
        ) : null}

        {/* The two parts subtracted, so the claim is not left to be inferred. */}
        <section className="mt-10 rounded-lg border border-doc-gold bg-doc-gold-4 px-5 py-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-amber">
            01 → 02 · same team, same budget
          </p>
          <dl className="mt-3 flex flex-wrap gap-x-10 gap-y-4">
            {[
              { value: `+${delta.sellingHoursGained} hrs`, label: "Selling time a week" },
              { value: `+${delta.accountsGained}`, label: "Accounts a week" },
              { value: `${delta.cycleDays} days`, label: "Faster to signature" },
              { value: "$0", label: "More budget" },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="text-[24px] leading-none font-semibold tabular-nums text-doc-ink">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-doc-amber">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
              Order of play
            </p>
            <ol className="mt-3 flex flex-col gap-2.5">
              {report.waves.map((wave, index) => (
                <li key={wave.id} className="flex gap-3">
                  <span className="mt-0.5 text-[11px] font-semibold tabular-nums text-doc-faint">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="text-[13px] font-semibold text-doc-ink">
                      {wave.title}
                    </span>
                    <span className="ml-2 text-[11px] text-doc-faint">{wave.window}</span>
                    <p className="text-[12.5px] leading-[1.5] text-doc-muted">
                      {wave.detail}
                    </p>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
              Needed first
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {report.prerequisites.map((item) => (
                <li
                  key={item}
                  className="flex gap-2.5 text-[12.5px] leading-[1.5] text-doc-muted"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] size-1 shrink-0 rounded-full bg-doc-gold"
                  />
                  {item}
                </li>
              ))}
            </ul>
            <Rollup>The first two are process decisions, not technology.</Rollup>
          </div>
        </div>

        <FootLine
          confidentiality="Confidential — Renovus Capital internal / operating review"
          preparedBy="Renovus Capital · Portfolio Operations"
        />
      </div>
    </div>
  );
}
