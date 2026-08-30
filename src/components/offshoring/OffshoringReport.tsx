"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/primitives/Button";
import { getCompanyById } from "@/data/companies";
import { getMockOffshoringReport } from "@/data/offshoringReport";
import {
  getOrInitOffshoringSession,
  getServerOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import { cn } from "@/lib/cn";
import type { Sector } from "@/types/company";
import { BridgeChart } from "./report/BridgeChart";
import { CostChart, CostLegend } from "./report/CostChart";
import {
  Caption,
  ColHead,
  DocTable,
  DocTitle,
  FootLine,
  Kicker,
  ModelTag,
  Rollup,
  Tag,
  Td,
  Th,
} from "@/components/report/DocPrimitives";
import { HeatLegend, HeatTable } from "./report/HeatTable";

const TABS = [
  { id: "answer", label: "The answer" },
  { id: "cost", label: "Where the cost sits" },
  { id: "move", label: "What can move" },
  { id: "save", label: "What it saves" },
  { id: "waves", label: "How it happens" },
  { id: "risks", label: "Risks & next steps" },
  { id: "detail", label: "Detail" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface OffshoringReportProps {
  /** An archived record. Omit to render the live session. */
  archived?: { companyName: string; sector: Sector };
}

export function OffshoringReport({ archived }: OffshoringReportProps = {}) {
  const session = useSyncExternalStore(
    subscribeToOffshoringSession,
    getOrInitOffshoringSession,
    getServerOffshoringSession,
  );
  const company = session.companyId ? getCompanyById(session.companyId) : undefined;
  const companyName =
    archived?.companyName ?? session.companyName ?? company?.name ?? "Portfolio company";
  const sector: Sector = archived?.sector ?? company?.sector ?? "Education";
  const report = useMemo(
    () => getMockOffshoringReport(companyName, sector),
    [companyName, sector],
  );
  const [tab, setTab] = useState<TabId>("answer");

  const topbarMeta = useMemo(
    () => ({
      title: "Workforce Sourcing Assessment",
      badges: [companyName],
      actions: (
        <Button
          href={archived ? "/agents/records" : "/agents/offshoring"}
          variant="secondary"
          size="sm"
        >
          {archived ? "Back to records" : "Back to conversation"}
        </Button>
      ),
    }),
    [companyName, archived],
  );
  useSetTopbarMeta(topbarMeta);

  // ← / → step through the panels, as in the printed deck.
  const step = useCallback((delta: number) => {
    setTab((current) => {
      const index = TABS.findIndex((item) => item.id === current);
      const next = Math.min(Math.max(index + delta, 0), TABS.length - 1);
      return TABS[next].id;
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

  return (
    <div className="bg-surface font-sans text-doc-ink">
      <div
        role="tablist"
        aria-label="Report sections"
        className="flex gap-6 overflow-x-auto border-b border-doc-sep px-6 md:px-10"
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
                "flex h-[50px] shrink-0 items-center gap-1.5 border-b-2 text-[12.5px] transition-colors",
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
        <span className="ml-auto hidden shrink-0 items-center whitespace-nowrap text-[11px] text-doc-faint lg:flex">
          ← → to navigate
        </span>
      </div>

      <div className="px-6 py-10 md:px-10">
        {tab === "answer" ? (
          <section>
            <Kicker>Workforce Sourcing Assessment · Portfolio Operations</Kicker>
            <DocTitle highlight={report.answerHeadlineValue}>
              {report.answerHeadlineRest}
            </DocTitle>

            <p className="mt-6 max-w-[70ch] font-serif text-[19px] leading-[1.66] text-doc-body md:text-[21px]">
              {report.summaryExec}
            </p>

            <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {report.kpis.map((kpi) => (
                <li
                  key={kpi.label}
                  className={cn(
                    "flex min-h-[138px] flex-col rounded-[10px] border p-5",
                    kpi.lead
                      ? "border-doc-lead-border bg-doc-gold-5"
                      : "border-doc-sep bg-surface",
                  )}
                >
                  <p className="text-[38px] font-semibold leading-[1.1] tracking-[-0.01em] tabular-nums text-doc-ink">
                    {kpi.value}
                    {kpi.suffix ? (
                      <span className="ml-1 text-[17px] font-medium text-doc-faint">
                        {kpi.suffix}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
                    {kpi.label}
                  </p>
                  <p className="mt-1.5 text-[12px] text-doc-muted">{kpi.hint}</p>
                </li>
              ))}
            </ul>

            <p className="mt-5 max-w-[80ch] text-[15px] text-doc-muted">
              {report.conservativeFloor}
            </p>

            <FootLine
              confidentiality={report.confidentiality}
              preparedBy={report.preparedBy}
            />
          </section>
        ) : null}

        {tab === "cost" ? (
          <section>
            <Kicker>Cost base</Kicker>
            <DocTitle>Where the cost sits</DocTitle>
            <Caption>{report.costCaption}</Caption>

            <div className="mt-7 flex flex-wrap gap-x-14 gap-y-5">
              {report.costStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-[30px] font-semibold tracking-[-0.01em] tabular-nums text-doc-ink">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-doc-faint">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <CostChart rows={report.costRows} />
              <CostLegend />
            </div>
          </section>
        ) : null}

        {tab === "move" ? (
          <section>
            <Kicker>Outsourcing potential</Kicker>
            <DocTitle>What can move</DocTitle>
            <Caption>{report.moveCaption}</Caption>

            <div className="mt-8 grid gap-10 lg:grid-cols-[58fr_42fr]">
              <div className="min-w-0">
                <ColHead>Potential by function × level (0–100)</ColHead>
                <HeatTable rows={report.heatRows} />
                <Rollup>{report.heatRollup}</Rollup>
                <HeatLegend />
              </div>

              <div className="min-w-0">
                <ColHead>Largest movers — base case</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Role</Th>
                      <Th>Band</Th>
                      <Th right>Saving / yr</Th>
                    </tr>
                  }
                >
                  {report.movers.map((mover) => (
                    <tr key={mover.id}>
                      <Td>
                        <span className="font-mono text-[11.5px] text-doc-ink">{mover.id}</span>
                        <span className="text-doc-faint">
                          {" "}
                          · {mover.function} · {mover.level}
                        </span>
                      </Td>
                      <Td>
                        <Tag band={mover.band}>{mover.band}</Tag>
                      </Td>
                      <Td right>{mover.savingPerYear}</Td>
                    </tr>
                  ))}
                </DocTable>
                <Rollup>{report.moversRollup}</Rollup>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "save" ? (
          <section>
            <Kicker>Savings model</Kicker>
            <DocTitle>What it saves</DocTitle>
            <Caption>{report.saveCaption}</Caption>

            <div className="mt-8 grid gap-10 lg:grid-cols-[58fr_42fr]">
              <div className="min-w-0">
                <ColHead>Year 1 bridge — base case</ColHead>
                <BridgeChart bars={report.bridge} />
              </div>

              <div className="min-w-0">
                <ColHead>Scenarios</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Scenario</Th>
                      <Th right>FTE</Th>
                      <Th right>Run-rate</Th>
                      <Th right>3-yr net</Th>
                      <Th right>Payback</Th>
                    </tr>
                  }
                >
                  {report.scenarios.map((scenario) => (
                    <tr
                      key={scenario.name}
                      className={cn(scenario.headline && "bg-doc-gold-5 font-semibold")}
                    >
                      <Td className={cn(scenario.headline && "font-semibold text-doc-ink")}>
                        {scenario.name}
                      </Td>
                      <Td right>{scenario.fte}</Td>
                      <Td right>{scenario.runRate}</Td>
                      <Td right>{scenario.net3}</Td>
                      <Td right>{scenario.payback}</Td>
                    </tr>
                  ))}
                </DocTable>
                <Rollup>{report.scenariosRollup}</Rollup>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "waves" ? (
          <section>
            <Kicker>Transition roadmap</Kicker>
            <DocTitle>How it happens</DocTitle>
            <Caption>{report.wavesCaption}</Caption>

            <ul className="mt-8 grid gap-6 lg:grid-cols-3">
              {report.waves.map((wave) => (
                <li
                  key={wave.n}
                  className="flex flex-col rounded-[12px] border border-doc-sep bg-surface p-6"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-doc-amber">
                    {wave.n} · {wave.from}
                  </p>
                  <h3 className="mb-3 mt-1 font-serif text-[23px] font-semibold text-doc-ink">
                    {wave.title}
                  </h3>

                  {[
                    ["Roles moving", wave.rolesMoving],
                    ["Loaded cost", wave.loadedCost],
                    ["Run-rate saving", wave.runRate],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between border-t border-doc-hair py-1.5 text-[13.5px] text-doc-muted"
                    >
                      <span>{label}</span>
                      <b className="font-semibold tabular-nums text-doc-ink">{value}</b>
                    </div>
                  ))}

                  <p className="mt-3 text-[12px] leading-[1.55] text-doc-muted">
                    {wave.functions.join(" · ")}
                  </p>

                  <div className="mt-3.5 border-t border-doc-hair pt-3">
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-doc-faint">
                      Gates to start
                    </p>
                    <ul className="list-disc pl-4">
                      {wave.gates.map((gate) => (
                        <li
                          key={gate}
                          className="mb-1.5 text-[12px] leading-[1.5] text-doc-muted"
                        >
                          {gate}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-[90ch] text-[13px] leading-[1.6] text-doc-muted">
              {report.wavesSequence}
            </p>
          </section>
        ) : null}

        {tab === "risks" ? (
          <section>
            <Kicker>Execution</Kicker>
            <DocTitle>Risks &amp; next steps</DocTitle>
            <Caption>{report.risksCaption}</Caption>

            <div className="mt-8 grid gap-10 lg:grid-cols-[54fr_46fr]">
              <div className="min-w-0">
                <ColHead>Principal risks</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th width="38%">Risk</Th>
                      <Th>Mitigation</Th>
                      <Th>Owner</Th>
                    </tr>
                  }
                >
                  {report.risks.map((risk) => (
                    <tr key={risk.risk}>
                      <Td className="text-doc-ink">{risk.risk}</Td>
                      <Td muted>{risk.mitigation}</Td>
                      <Td>
                        <Tag variant="owner">{risk.owner}</Tag>
                      </Td>
                    </tr>
                  ))}
                </DocTable>
              </div>

              <div className="min-w-0">
                <ColHead>Next steps</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th width="26px">#</Th>
                      <Th>Step</Th>
                      <Th right width="150px">
                        Owner · timing
                      </Th>
                    </tr>
                  }
                >
                  {report.nextSteps.map((next, index) => (
                    <tr key={next.step}>
                      <Td className="pr-3 font-semibold tabular-nums text-doc-amber">
                        {index + 1}
                      </Td>
                      <Td className="text-doc-ink">{next.step}</Td>
                      <Td right className="whitespace-nowrap text-[11.5px] text-doc-muted">
                        {next.owner} · {next.timing}
                      </Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "detail" ? (
          <section className="max-w-[900px]">
            <Kicker>Detail</Kicker>
            <DocTitle>Everything behind the numbers</DocTitle>

            <DetailSection num="D1 · Approach & scope" title="Approach and scope">
              {report.detailApproach.map((paragraph) => (
                <p key={paragraph} className="mb-3 text-[14px] text-doc-body">
                  {paragraph}
                </p>
              ))}
              <h4 className="mb-2 mt-5 text-[14px] font-semibold text-doc-ink">
                Scoring dimensions
              </h4>
              <ul className="ml-4 list-disc text-[14px] text-doc-body">
                {report.scoringDimensions.map((dimension) => (
                  <li key={dimension.name} className="mb-1.5">
                    <b className="font-semibold text-doc-ink">{dimension.name}</b> —{" "}
                    {dimension.detail}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection num="D2 · Sourcing model" title="Recommended sourcing model">
              <DocTable
                minWidth={640}
                head={
                  <tr>
                    <Th>Function</Th>
                    <Th right>FTE</Th>
                    <Th right>Loaded cost</Th>
                    <Th>Model</Th>
                    <Th>Rationale</Th>
                  </tr>
                }
              >
                {report.modelRows.map((row) => (
                  <tr key={row.function}>
                    <Td className="text-doc-ink">{row.function}</Td>
                    <Td right>{row.fte}</Td>
                    <Td right>{row.loadedCost}</Td>
                    <Td>
                      <ModelTag model={row.model} />
                    </Td>
                    <Td muted>{row.rationale}</Td>
                  </tr>
                ))}
              </DocTable>
            </DetailSection>

            <DetailSection num="Appendix A · Assumptions" title="Assumptions register">
              <DocTable
                minWidth={520}
                head={
                  <tr>
                    <Th>Assumption</Th>
                    <Th>Value</Th>
                    <Th>Source</Th>
                  </tr>
                }
              >
                {report.assumptions.map((row) => (
                  <tr key={row.assumption}>
                    <Td className="text-doc-ink">{row.assumption}</Td>
                    <Td>{row.value}</Td>
                    <Td muted>{row.source}</Td>
                  </tr>
                ))}
              </DocTable>
            </DetailSection>

            <DetailSection num="Appendix B · Methodology" title="Methodology">
              {report.methodology.map((paragraph) => (
                <p key={paragraph} className="mb-3 text-[14px] text-doc-body">
                  {paragraph}
                </p>
              ))}
            </DetailSection>

            <FootLine
              confidentiality={report.confidentiality}
              preparedBy={report.preparedBy}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function DetailSection({
  num,
  title,
  children,
}: {
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-doc-hair py-8 last:border-b-0">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-doc-amber">
        {num}
      </p>
      <h3 className="mb-3.5 font-serif text-[23px] font-semibold text-doc-ink">{title}</h3>
      {children}
    </section>
  );
}
