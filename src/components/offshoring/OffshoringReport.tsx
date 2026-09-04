"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/primitives/Button";
import { getCompanyById } from "@/lib/companies";
import { getMockOffshoringReport } from "@/data/offshoringReport";
import {
  getOrInitOffshoringSession,
  getServerOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import type { AppHref } from "@/lib/routes";
import { cn } from "@/lib/cn";
import type { Sector } from "@/types/company";
import {
  Caption,
  ColHead,
  DetailSection,
  DocTable,
  DocTitle,
  Flag,
  FootLine,
  Kicker,
  ModelTag,
  RiskCard,
  Rollup,
  ShareBar,
  StatBlock,
  StatRow,
  Tag,
  Td,
  Th,
  Tile,
  TileRow,
  TwoCol,
  WaveCard,
} from "@/components/report/DocPrimitives";

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
  /**
   * Where "back" goes for an archived report — the owning company's page, which
   * is where saved assessments are listed. Falls back to the whole roster when
   * the record predates `companyId`.
   */
  backHref?: AppHref;
}

export function OffshoringReport({ archived, backHref }: OffshoringReportProps = {}) {
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

  const topbarMeta = useMemo(() => {
    const back = archived
      ? {
          href: backHref ?? ("/companies" as AppHref),
          label: backHref ? "Back to PortCo" : "Back to PortCos",
        }
      : { href: "/agents/offshoring" as AppHref, label: "Back to conversation" };

    return {
      title: "Workforce Sourcing Assessment",
      badges: [companyName],
      actions: (
        <Button href={back.href} variant="secondary" size="sm">
          {back.label}
        </Button>
      ),
    };
  }, [companyName, archived, backHref]);
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
        className="flex gap-6 overflow-x-auto border-b border-doc-sep px-8"
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

      <div className="px-8 py-10">
        {tab === "answer" ? (
          <section>
            <Kicker>Workforce Sourcing Assessment · Portfolio Operations</Kicker>
            <DocTitle highlight={report.answerHeadlineValue}>
              {report.answerHeadlineRest}
            </DocTitle>
            <Caption>{report.subline}</Caption>

            <p className="mt-6 max-w-[100ch] font-serif text-[17px] leading-[1.62] text-doc-body md:text-[18px]">
              {report.summaryExec}
            </p>

            <TileRow>
              {report.kpis.map((kpi) => (
                <Tile
                  key={kpi.label}
                  value={kpi.value}
                  suffix={kpi.suffix}
                  label={kpi.label}
                  note={kpi.hint}
                />
              ))}
            </TileRow>

            <p className="mt-5 max-w-[96ch] text-[12.5px] leading-[1.55] text-doc-muted">
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

            <StatRow>
              {report.costStats.map((stat) => (
                <StatBlock key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </StatRow>

            <div className="mt-8">
              <DocTable
                head={
                  <tr>
                    <Th>Function</Th>
                    <Th right>HC</Th>
                    <Th right>Burdened cost</Th>
                    <Th width="44%">Share of {report.costStats[1]?.value}</Th>
                  </tr>
                }
              >
                {report.costRows.map((row) => (
                  <tr key={row.function}>
                    <Td className="text-doc-ink">{row.function}</Td>
                    <Td right>{row.fte}</Td>
                    <Td right>{row.loadedCost}</Td>
                    <Td>
                      <ShareBar percent={row.sharePct} />
                    </Td>
                  </tr>
                ))}
              </DocTable>
            </div>
          </section>
        ) : null}

        {tab === "move" ? (
          <section>
            <Kicker>Outsourcing potential</Kicker>
            <DocTitle>What can move</DocTitle>
            <Caption>{report.moveCaption}</Caption>

            <div className="mt-8">
              <DocTable
                head={
                  <tr>
                    <Th>Function</Th>
                    <Th right>Score</Th>
                    <Th>Band</Th>
                    <Th>Engagement model</Th>
                    <Th right>Addressable</Th>
                    <Th>Primary constraint</Th>
                  </tr>
                }
              >
                {report.moveRows.map((row) => (
                  <tr key={row.function}>
                    <Td className="text-doc-ink">{row.function}</Td>
                    <Td right>{row.score}</Td>
                    <Td>
                      <Tag band={row.band}>{row.band}</Tag>
                    </Td>
                    <Td>
                      <ModelTag model={row.engagementModel} />
                    </Td>
                    <Td right>{row.addressable}</Td>
                    <Td muted>{row.primaryConstraint}</Td>
                  </tr>
                ))}
              </DocTable>
              <Rollup>{report.moveRollup}</Rollup>
            </div>
          </section>
        ) : null}

        {tab === "save" ? (
          <section>
            <Kicker>Savings model</Kicker>
            <DocTitle>What it saves</DocTitle>
            <Caption>{report.saveCaption}</Caption>

            <div className="mt-7">
              <DocTable
                head={
                  <tr>
                    <Th>Scenario</Th>
                    <Th>Basis</Th>
                    <Th right>Addressable FTE</Th>
                    <Th right>Annual run-rate</Th>
                    <Th right>% of labour cost</Th>
                    <Th right>3-yr net</Th>
                    <Th right>Payback</Th>
                  </tr>
                }
              >
                {report.scenarios.map((scenario) => (
                  <tr key={scenario.name} className={cn(scenario.headline && "bg-doc-gold-5")}>
                    <Td className={cn(scenario.headline && "font-semibold text-doc-ink")}>
                      {scenario.name}
                    </Td>
                    <Td muted>{scenario.basis}</Td>
                    <Td right>{scenario.fte}</Td>
                    <Td right>{scenario.runRate}</Td>
                    <Td right>{scenario.pctOfLabour}</Td>
                    <Td right>{scenario.net3}</Td>
                    <Td right>{scenario.payback}</Td>
                  </tr>
                ))}
              </DocTable>
            </div>

            <TwoCol>
              <div className="min-w-0">
                <ColHead>Base-case saving by function</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Function</Th>
                      <Th right>Run-rate saving</Th>
                    </tr>
                  }
                >
                  {report.savingByFunction.map((row) => (
                    <tr key={row.function}>
                      <Td className="text-doc-ink">{row.function}</Td>
                      <Td right>{row.saving}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>

              <div className="min-w-0">
                <ColHead>Cash profile, base case</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Period</Th>
                      <Th right>Gross saving</Th>
                      <Th right>One-offs</Th>
                      <Th right>Net</Th>
                    </tr>
                  }
                >
                  {report.cashProfile.map((row) => (
                    <tr key={row.period}>
                      <Td className="text-doc-ink">{row.period}</Td>
                      <Td right>{row.grossSaving}</Td>
                      <Td right>{row.oneOffs}</Td>
                      <Td right>{row.net}</Td>
                    </tr>
                  ))}
                </DocTable>
                <Rollup>{report.scenariosRollup}</Rollup>
              </div>
            </TwoCol>
          </section>
        ) : null}

        {tab === "waves" ? (
          <section>
            <Kicker>Transition roadmap</Kicker>
            <DocTitle>How it happens</DocTitle>
            <Caption>{report.wavesCaption}</Caption>

            <TwoCol>
              <div className="min-w-0">
                <ColHead>Waves</ColHead>
                {report.waves.map((wave) => (
                  <WaveCard
                    key={wave.n}
                    title={`${wave.n} · ${wave.title}`}
                    when={`${wave.from} · ${wave.rolesMoving} roles · ${wave.loadedCost}`}
                    figure={wave.runRate}
                  >
                    {wave.functions.join(", ")}
                  </WaveCard>
                ))}
                <Rollup>{report.wavesSequence}</Rollup>
              </div>

              <div className="min-w-0">
                <ColHead>Governance and gates</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Gate</Th>
                      <Th>Test to pass</Th>
                      <Th>Owner</Th>
                    </tr>
                  }
                >
                  {report.gates.map((gate) => (
                    <tr key={gate.gate}>
                      <Td className="text-doc-ink">{gate.gate}</Td>
                      <Td muted>{gate.test}</Td>
                      <Td>
                        <Tag variant="owner">{gate.owner}</Tag>
                      </Td>
                    </tr>
                  ))}
                </DocTable>

                <div className="mt-6">
                  <ColHead>Retained onshore by design</ColHead>
                  <p className="text-[11.5px] leading-[1.55] text-doc-muted">
                    {report.retainedOnshore}
                  </p>
                </div>
              </div>
            </TwoCol>
          </section>
        ) : null}

        {tab === "risks" ? (
          <section>
            <Kicker>Execution</Kicker>
            <DocTitle>Risks &amp; next steps</DocTitle>
            <Caption>{report.risksCaption}</Caption>

            <TwoCol>
              <div className="min-w-0">
                <ColHead>Principal risks</ColHead>
                {report.risks.map((risk) => (
                  <RiskCard key={risk.risk} title={risk.risk}>
                    <span className="font-semibold text-doc-body">{risk.impact} · </span>
                    {risk.mitigation}
                    <span className="text-doc-faint"> — {risk.owner}</span>
                  </RiskCard>
                ))}
              </div>

              <div className="min-w-0">
                <ColHead>First 30 days</ColHead>
                <DocTable
                  head={
                    <tr>
                      <Th>Action</Th>
                      <Th>Owner</Th>
                      <Th>Timing</Th>
                    </tr>
                  }
                >
                  {report.nextSteps.map((step) => (
                    <tr key={step.step}>
                      <Td className="text-doc-ink">{step.step}</Td>
                      <Td>
                        <Tag variant="owner">{step.owner}</Tag>
                      </Td>
                      <Td muted>{step.timing}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
            </TwoCol>

            <Flag>{report.flag}</Flag>
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

            <DetailSection num="D3 · Data" title="Data tier and source">
              <p className="text-[12px] leading-[1.6] text-doc-muted">{report.dataTier}</p>
              <p className="mt-3 text-[12px] leading-[1.6] text-doc-muted">
                {report.functionRollup}
              </p>
            </DetailSection>

            <DetailSection num="D4 · Ceilings" title="Constraints applied as hard ceilings">
              <ul className="flex flex-col gap-2">
                {report.constraintCeilings.map((item) => (
                  <li key={item} className="text-[12px] leading-[1.6] text-doc-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection num="D5 · Data quality" title="Data quality items">
              <ul className="flex flex-col gap-2">
                {report.dataQuality.map((item) => (
                  <li key={item} className="text-[12px] leading-[1.6] text-doc-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection num="D6 · Exclusions" title="What is not modelled">
              <ul className="flex flex-col gap-2">
                {report.notModelled.map((item) => (
                  <li key={item} className="text-[12px] leading-[1.6] text-doc-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <DetailSection num="D7 · Reconciliation" title="Reconciliation">
              <p className="text-[12px] leading-[1.6] text-doc-muted">
                {report.reconciliation}
              </p>
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
