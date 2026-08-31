"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/primitives/Button";
import {
  Caption,
  ColHead,
  DetailSection,
  DocTable,
  DocTitle,
  FootLine,
  Kicker,
  KpiCard,
  KpiGrid,
  Rollup,
  StatBlock,
  StatRow,
  Tag,
  Td,
  Th,
} from "@/components/report/DocPrimitives";
import { buildSalesReport, type SalesReportData } from "@/lib/assessment/sales-report";
import {
  getOrInitSalesSession,
  getServerSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import { assessedCompanyCount } from "@/lib/records";
import { cn } from "@/lib/cn";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";

const TABS = [
  { id: "snapshot", label: "Snapshot" },
  { id: "baseline", label: "Baseline" },
  { id: "gaps", label: "Gaps & numbers" },
  { id: "maps", label: "Channels & people" },
  { id: "instrumentation", label: "Instrumentation" },
  { id: "open", label: "Open questions" },
  { id: "opportunities", label: "Opportunities & AI" },
  { id: "portfolio", label: "Portfolio" },
  { id: "appendix", label: "Appendix" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export interface SalesReportProps {
  /** A rebuilt archived report. Omit to render the live session. */
  report?: SalesReportData;
}

export function SalesReport({ report: archived }: SalesReportProps = {}) {
  const session = useSyncExternalStore(
    subscribeToSalesSession,
    getOrInitSalesSession,
    getServerSalesSession,
  );

  const report = useMemo(
    () =>
      archived ??
      buildSalesReport(session, { assessedCompanyCount: assessedCompanyCount() }),
    [archived, session],
  );

  const channelsInUse = report.partA.channels.filter(
    (row) => row.status === "Using",
  ).length;
  const respondentCount = report.meta.respondents.length;

  const [tab, setTab] = useState<TabId>("snapshot");

  const topbarMeta = useMemo(
    () => ({
      title: "Sales Baseline Report",
      badges: [report.meta.companyName],
      actions: (
        <Button
          href={archived ? "/agents/records" : "/agents/assessment"}
          variant="secondary"
          size="sm"
        >
          {archived ? "Back to records" : "Back to conversation"}
        </Button>
      ),
    }),
    [report.meta.companyName, archived],
  );
  useSetTopbarMeta(topbarMeta);

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
        {tab === "snapshot" ? (
          <section>
            <Kicker>Sales &amp; Marketing Baseline · Portfolio Operations</Kicker>
            <DocTitle highlight={`${report.partC.measuredPct}%`}>
              of what we captured is measured, not remembered
            </DocTitle>
            <Caption>
              {report.meta.companyName} · {report.meta.date} · {respondentCount}{" "}
              {respondentCount === 1 ? "respondent" : "respondents"} · question bank{" "}
              {report.meta.qbankVersion}
            </Caption>

            <KpiGrid>
              <KpiCard
                lead
                value={report.partC.measuredPct}
                suffix="%"
                label="Measured"
                hint="Answers backed by a system or record."
              />
              <KpiCard
                value={channelsInUse}
                label="Channels in use"
                hint={`Of ${report.partA.channels.length} mapped routes to market.`}
              />
              <KpiCard
                value={report.partB.keyNumbers.length}
                label="Key numbers"
                hint="Figures captured against the question bank."
              />
              <KpiCard
                value={report.partD.length}
                label="Open questions"
                hint="Outstanding before discovery can close."
              />
            </KpiGrid>

            <div className="mt-10 grid gap-10 lg:grid-cols-[54fr_46fr]">
              <dl className="flex min-w-0 flex-col gap-3">
                {report.partA.lines.map((line) => (
                  <div key={line.label} className="flex flex-wrap gap-x-4 border-b border-doc-hair pb-2.5">
                    <dt className="w-44 shrink-0 text-[12px] uppercase tracking-[0.08em] text-doc-faint">
                      {line.label}
                    </dt>
                    <dd className="min-w-0 flex-1 text-[14px] text-doc-body">{line.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="min-w-0">
                <ColHead>Channel map</ColHead>
                <DocTable head={<tr><Th>Channel</Th><Th>Status</Th><Th>Blocker</Th></tr>}>
                  {report.partA.channels.map((row) => (
                    <tr key={row.channel}>
                      <Td className="text-doc-ink">{row.channel}</Td>
                      <Td>{row.status}</Td>
                      <Td muted>{row.blocker ?? "—"}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
            </div>
            <FootLine
              confidentiality={report.meta.confidentiality}
              preparedBy={report.meta.preparedBy}
            />
          </section>
        ) : null}

        {tab === "baseline" ? (
          <section>
            <Kicker>Baseline</Kicker>
            <DocTitle>How this company wins business today</DocTitle>
            <div className="mt-6 flex max-w-[70ch] flex-col gap-4">
              {report.partB.execSummary.map((paragraph) => (
                <p key={paragraph} className="font-serif text-[19px] leading-[1.66] text-doc-body md:text-[21px]">
                  {paragraph}
                </p>
              ))}
            </div>
            {report.partB.engineNarrative.length > 0 ? (
              <div className="mt-9">
                <ColHead>The engine, in their words</ColHead>
                <ul className="flex max-w-[80ch] flex-col gap-2">
                  {report.partB.engineNarrative.map((line) => (
                    <li key={line} className="border-b border-doc-hair pb-2 text-[14px] text-doc-body">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : null}

        {tab === "gaps" ? (
          <section>
            <Kicker>Diagnosis</Kicker>
            <DocTitle>Gaps and key numbers</DocTitle>
            <Caption>
              Each gap is anchored to something the respondents said; nothing here is
              inferred from outside the interview.
            </Caption>
            <div className="mt-8">
              <ColHead>Gaps by used channel</ColHead>
              <DocTable
                minWidth={640}
                head={<tr><Th width="22%">Channel</Th><Th>What happens today</Th><Th>The gap</Th><Th>Evidence</Th></tr>}
              >
                {report.partB.gaps.map((row) => (
                  <tr key={`${row.channel}-${row.evidence}`}>
                    <Td className="text-doc-ink">{row.channel}</Td>
                    <Td muted>{row.today}</Td>
                    <Td muted>{row.gap}</Td>
                    <Td muted>{row.evidence}</Td>
                  </tr>
                ))}
              </DocTable>
            </div>

            <div className="mt-10">
              <ColHead>Key numbers</ColHead>
              <DocTable
                minWidth={640}
                head={
                  <tr>
                    <Th width="26px">#</Th><Th>Metric</Th><Th>Value</Th>
                    <Th>Confidence</Th><Th>Who would know</Th><Th right>Source</Th>
                  </tr>
                }
              >
                {report.partB.keyNumbers.map((row) => (
                  <tr key={row.sourceQid}>
                    <Td className="font-semibold tabular-nums text-doc-amber">{row.index}</Td>
                    <Td muted>{row.metric}</Td>
                    <Td className="text-doc-ink">{row.value}</Td>
                    <Td>
                      {row.confidence ? (
                        <Tag band={row.confidence === "A" || row.confidence === "E" ? "High" : "Low"}>
                          {row.confidence}
                        </Tag>
                      ) : "—"}
                    </Td>
                    <Td muted>{row.who ?? "—"}</Td>
                    <Td right className="font-mono text-[11.5px]">{row.sourceQid}</Td>
                  </tr>
                ))}
              </DocTable>
              <Rollup>
                {report.partB.keyNumbers.length} figures captured · {report.partC.measuredPct}%
                measured.
              </Rollup>
            </div>
          </section>
        ) : null}

        {tab === "maps" ? (
          <section>
            <Kicker>Coverage</Kicker>
            <DocTitle>Channels and people</DocTitle>
            {report.partB.bet ? (
              <Caption>Their bet, in their words: &ldquo;{report.partB.bet}&rdquo;</Caption>
            ) : null}
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="min-w-0">
                <ColHead>Channel &amp; market map</ColHead>
                <DocTable head={<tr><Th>Channel</Th><Th>Status</Th><Th>Detail</Th></tr>}>
                  {report.partB.channelMap.map((row) => (
                    <tr key={row.channel}>
                      <Td className="text-doc-ink">{row.channel}</Td>
                      <Td>{row.status}</Td>
                      <Td muted>{row.blocker ?? "—"}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
              <div className="min-w-0">
                <ColHead>People map</ColHead>
                <DocTable head={<tr><Th>Person / role</Th><Th>Appears as</Th><Th>Interviewed?</Th></tr>}>
                  {report.partB.people.map((row) => (
                    <tr key={row.name}>
                      <Td className="text-doc-ink">{row.name}</Td>
                      <Td muted>{row.appearsAs}</Td>
                      <Td>{row.interviewed}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "instrumentation" ? (
          <section>
            <Kicker>Instrumentation</Kicker>
            <DocTitle highlight={`${report.partC.measuredPct}%`}>
              of the quantitative answers are measured
            </DocTitle>
            <Caption>{report.partC.verdict}</Caption>

            <StatRow>
              <StatBlock value={report.partC.taggedCount} label="Tagged answers" />
              <StatBlock value={`${report.partC.measuredPct}%`} label="Measured" />
              <StatBlock value={report.partD.length} label="Open questions" />
            </StatRow>

            <div className="mt-8 max-w-[720px]">
              <DocTable head={<tr><Th>Confidence</Th><Th right>Count</Th><Th right>Share</Th><Th>What it means</Th></tr>}>
                {report.partC.rows.map((row) => (
                  <tr key={row.confidence}>
                    <Td className="font-semibold text-doc-ink">{row.confidence}</Td>
                    <Td right>{row.count}</Td>
                    <Td right>{row.share}</Td>
                    <Td muted>{row.meaning}</Td>
                  </tr>
                ))}
              </DocTable>
              <Rollup>
                {report.partC.taggedCount} answers carried a confidence tag.
              </Rollup>
            </div>
          </section>
        ) : null}

        {tab === "open" ? (
          <section>
            <Kicker>Outstanding</Kicker>
            <DocTitle>Open questions</DocTitle>
            {report.partD.length === 0 ? (
              <Caption>Nothing outstanding — every answer was measured and attributed.</Caption>
            ) : (
              <ol className="mt-8 flex max-w-[80ch] list-decimal flex-col gap-3 pl-5">
                {report.partD.map((item) => (
                  <li key={item} className="text-[14px] leading-[1.6] text-doc-body">
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </section>
        ) : null}

        {tab === "opportunities" ? (
          <section>
            <Kicker>Where the value sits</Kicker>
            <DocTitle>Preliminary opportunities &amp; AI candidates</DocTitle>
            <Caption>{report.partE.readinessNote}</Caption>

            {report.partE.opportunities.length > 0 ? (
              <div className="mt-8">
                <ColHead>Opportunities</ColHead>
                <DocTable
                  minWidth={640}
                  head={<tr><Th width="26px">#</Th><Th>Opportunity</Th><Th>Evidence</Th><Th>Fix type</Th><Th>First step</Th></tr>}
                >
                  {report.partE.opportunities.map((row) => (
                    <tr key={row.opportunity}>
                      <Td className="font-semibold tabular-nums text-doc-amber">{row.index}</Td>
                      <Td className="text-doc-ink">{row.opportunity}</Td>
                      <Td muted>{row.evidence}</Td>
                      <Td><Tag variant="model">{row.fixType}</Tag></Td>
                      <Td muted>{row.firstStep}</Td>
                    </tr>
                  ))}
                </DocTable>
              </div>
            ) : null}

            <div className="mt-10">
              <ColHead>AI candidate menu</ColHead>
              <DocTable
                minWidth={680}
                head={<tr><Th>Candidate</Th><Th>Typical trigger</Th><Th>Selected?</Th><Th>This company&rsquo;s evidence</Th></tr>}
              >
                {report.partE.candidates.map((row) => (
                  <tr key={row.candidate} className={cn(row.selected && "bg-doc-gold-5")}>
                    <Td className="text-doc-ink">{row.candidate}</Td>
                    <Td muted>{row.trigger}</Td>
                    <Td>{row.selected ? <Tag band="High">Yes</Tag> : <span className="text-doc-faint">—</span>}</Td>
                    <Td muted>{row.evidence || "—"}</Td>
                  </tr>
                ))}
              </DocTable>
              <Rollup>
                {report.partE.candidates.filter((row) => row.selected).length} of{" "}
                {report.partE.candidates.length} candidates carry evidence from this
                assessment.
              </Rollup>
            </div>
          </section>
        ) : null}

        {tab === "portfolio" ? (
          <section>
            <Kicker>Portfolio</Kicker>
            <DocTitle>Portfolio context</DocTitle>
            <Caption>{report.partF.note}</Caption>
            <div className="mt-8 max-w-[820px]">
              <DocTable head={<tr><Th>Dimension</Th><Th>This company</Th><Th>Portfolio position</Th></tr>}>
                {report.partF.rows.map((row) => (
                  <tr key={row.dimension}>
                    <Td className="text-doc-ink">{row.dimension}</Td>
                    <Td>{row.thisCompany}</Td>
                    <Td muted>{row.portfolioPosition}</Td>
                  </tr>
                ))}
              </DocTable>
            </div>
          </section>
        ) : null}

        {tab === "appendix" ? (
          <section>
            <Kicker>Appendix</Kicker>
            <DocTitle>Everything behind the numbers</DocTitle>

            <DetailSection num="Appendix A · Answer log" title="Answer log">
              <DocTable
                minWidth={760}
                head={<tr><Th>QID</Th><Th>Question</Th><Th>Respondent</Th><Th>Answer</Th><Th>Conf.</Th><Th>→WHO</Th></tr>}
              >
                {report.appendixA.map((row) => (
                  <tr key={row.qid}>
                    <Td className="font-mono text-[11.5px] text-doc-muted">{row.qid}</Td>
                    <Td muted>{row.question}</Td>
                    <Td muted>{row.respondent}</Td>
                    <Td className="text-doc-ink">{row.answer}</Td>
                    <Td>{row.confidence ?? "—"}</Td>
                    <Td muted>{row.who ?? "—"}</Td>
                  </tr>
                ))}
              </DocTable>
            </DetailSection>

            {report.appendixB.length > 0 ? (
              <DetailSection num="Appendix B · Handoffs" title="Handoff notes">
                <DocTable minWidth={520} head={<tr><Th>Topic</Th><Th>Quote</Th><Th>Suggested agent</Th></tr>}>
                  {report.appendixB.map((row) => (
                    <tr key={row.topic}>
                      <Td className="text-doc-ink">{row.topic}</Td>
                      <Td muted>{row.quote}</Td>
                      <Td>{row.suggestedAgent}</Td>
                    </tr>
                  ))}
                </DocTable>
              </DetailSection>
            ) : null}

            <Rollup>Question bank {report.meta.qbankVersion}</Rollup>
            <FootLine
              confidentiality={report.meta.confidentiality}
              preparedBy={report.meta.preparedBy}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
