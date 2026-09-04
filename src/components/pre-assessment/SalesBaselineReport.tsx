"use client";

import { Fragment, useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Info, MessagesSquare, Upload } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { useAssessmentStart } from "@/components/companies/useAssessmentStart";
import { getSalesBaselineReport } from "@/data/salesBaseline";
import { getCompanyById, subscribeToCompanies } from "@/lib/companies";
import type { SalesMethod } from "@/lib/home/start-assessment";
import type { AppHref } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import {
  BASELINE_STAGES,
  type BaselineDataCard,
  type BaselineIntervention,
  type BaselineMotion,
  type BaselineProvenance,
  type SalesBaselineData,
} from "@/types/sales-baseline";

/**
 * The sales process pre-assessment, in the app's own surface.
 *
 * Same four sections as the full report so the two read alike, but everything
 * here is an approximation and the page never lets you forget it: each figure
 * carries the chip that says whether it came from the CRM or from someone
 * saying it out loud.
 */

const SECTIONS = [
  { id: "data", label: "Data we have" },
  { id: "asis", label: "As-is" },
  { id: "tobe", label: "To-be" },
  { id: "calculation", label: "Calculation" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Glass, per DESIGN.md: translucent fill, wide blur, lit top edge. */
const CARD =
  "flex h-full flex-col rounded-xl border p-5 shadow-[var(--shadow-glass)] backdrop-blur-3xl";
const CARD_PLAIN = "border-glass-border bg-glass";
/** The stage that costs the most, lifted in the brand blue. */
const CARD_HL = "border-accent-border bg-accent-subtle";

const SOURCE_STYLE: Record<
  BaselineDataCard["kind"],
  { label: string; className: string }
> = {
  interview: { label: "Interview", className: "bg-accent-subtle text-accent" },
  export: { label: "Export", className: "bg-accent text-inverse" },
  todo: {
    label: "To get to the full version",
    className: "bg-border-subtle text-secondary",
  },
};

const PROVENANCE_LABEL: Record<BaselineProvenance, string> = {
  est: "est.",
  crm: "CRM",
};

/**
 * The chip that says where a figure came from.
 *
 * On every single figure, deliberately. The whole report is approximations, and
 * a number without its provenance would read as measured.
 */
function Chip({ source }: { source: BaselineProvenance }) {
  return (
    <span className="ml-1.5 rounded bg-border-subtle px-1 py-px align-middle text-[9px] font-semibold uppercase tracking-[0.06em] text-secondary">
      {PROVENANCE_LABEL[source]}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="max-w-[60ch] font-display text-[30px] leading-[1.22] font-semibold tracking-[-0.01em] text-foreground md:text-[34px]">
      {children}
    </h1>
  );
}

function Lede({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 max-w-[820px] text-[15px] leading-[1.6] text-secondary">
      {children}
    </p>
  );
}

/** A figure that changed, shown as old → new with the delta. */
function Delta({
  from,
  to,
  delta,
}: {
  from: string;
  to: string;
  delta?: string;
}) {
  return (
    <span>
      <span className="mr-1.5 text-secondary line-through decoration-border-strong">
        {from}
      </span>
      {to}
      {delta ? (
        <span className="ml-1.5 text-[11px] font-semibold text-accent">{delta}</span>
      ) : null}
    </span>
  );
}

function Unchanged({ value }: { value: string }) {
  return (
    <span>
      {value}
      <span className="ml-1.5 text-[11px] font-normal text-tertiary">unchanged</span>
    </span>
  );
}

/** The metrics strip above the stage cards. */
function Metrics({
  items,
}: {
  items: { value: React.ReactNode; label: string; lead?: boolean }[];
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end gap-x-8 gap-y-5 border-b border-glass-hairline pb-6 md:flex-nowrap">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 md:flex-1",
            item.lead && "border-border-subtle pr-6 sm:border-r",
            index === 0 && "max-sm:w-full",
          )}
        >
          <p
            className={cn(
              "font-display font-semibold leading-tight",
              item.lead ? "text-[30px] text-accent" : "text-[22px] text-foreground",
            )}
          >
            {item.value}
          </p>
          <p
            className={cn(
              "mt-1 text-[9px] font-semibold uppercase tracking-[0.08em]",
              item.lead ? "text-accent" : "text-tertiary",
            )}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/** One labelled line inside a stage card. */
function Row({
  value,
  label,
  last,
}: {
  value: React.ReactNode;
  label: string;
  last?: boolean;
}) {
  return (
    <div className={cn("pb-3", !last && "mb-3 border-b border-border-subtle")}>
      <p className="text-[14px] leading-tight font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[10.5px] leading-[1.35] text-secondary">{label}</p>
    </div>
  );
}

/** How much of one input is in hand. Zero included — that is the point. */
function DataProgress({ pct }: { pct: number }) {
  const value = Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-tertiary">
          Collected
        </p>
        <p className="text-[11.5px] font-semibold tabular-nums text-foreground">
          {value}%
        </p>
      </div>
      <span
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${value}% collected`}
        className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-border-subtle"
      >
        <span
          className={cn("h-full rounded-full", value === 0 ? "" : "bg-accent")}
          style={{ width: `${value}%` }}
        />
      </span>
    </div>
  );
}

/**
 * How to go and get the rest of this input. What a system holds is uploaded,
 * what only people know is interviewed, and the full version needs both.
 *
 * Both start a fresh assessment rather than linking to the agent: the session
 * this report was built from is finished, so resuming it would open an
 * interview with nothing left to ask.
 */
function DataActions({
  kind,
  onStart,
}: {
  kind: BaselineDataCard["kind"];
  onStart: (method: SalesMethod) => void;
}) {
  const upload = kind === "export" || kind === "todo";
  const interview = kind === "interview" || kind === "todo";

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {upload ? (
        <Button
          size="sm"
          variant="secondary"
          leadingIcon={Upload}
          onClick={() => onStart("export")}
        >
          Upload CSV
        </Button>
      ) : null}
      {interview ? (
        <Button
          size="sm"
          variant={kind === "todo" ? "ghost" : "secondary"}
          leadingIcon={MessagesSquare}
          onClick={() => onStart("questionnaire")}
        >
          Start interview
        </Button>
      ) : null}
    </div>
  );
}

export interface SalesBaselineReportProps {
  report?: SalesBaselineData;
  backHref?: AppHref;
  /** Whose report this is, so the card actions can start its assessment. */
  companyId?: string;
}

export function SalesBaselineReport({
  report: archived,
  backHref,
  companyId,
}: SalesBaselineReportProps = {}) {
  const report = useMemo(
    () => archived ?? getSalesBaselineReport("Portfolio company"),
    [archived],
  );

  const company = useSyncExternalStore(
    subscribeToCompanies,
    () => (companyId ? getCompanyById(companyId) : undefined),
    () => undefined,
  );
  const { start, overlays } = useAssessmentStart(company);

  const [section, setSection] = useState<SectionId>("data");
  const [motionCode, setMotionCode] = useState("overview");
  const [openWhy, setOpenWhy] = useState<string | undefined>();

  useSetTopbarMeta(
    useMemo(
      () => ({
        title: "Sales Process Pre-Assessment",
        badges: [report.companyName],
        actions: (
          <Button href={backHref ?? ("/companies" as AppHref)} variant="secondary" size="sm">
            {backHref ? "Back to PortCo" : "Back to PortCos"}
          </Button>
        ),
      }),
      [report.companyName, backHref],
    ),
  );

  // The motion rail is per-section, so switching section returns to the roll-up.
  const changeSection = useCallback((next: SectionId) => {
    setSection(next);
    setMotionCode("overview");
  }, []);

  const showMotions = section === "asis" || section === "tobe";
  const tobe = section === "tobe";

  useEffect(() => {
    if (!showMotions) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const codes = ["overview", ...report.motions.map((motion) => motion.code)];
      const index = codes.indexOf(motionCode);
      const delta = event.key === "ArrowRight" ? 1 : -1;
      setMotionCode(codes[(index + delta + codes.length) % codes.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showMotions, motionCode, report.motions]);

  const motion = report.motions.find((item) => item.code === motionCode);

  return (
    <div className="font-sans text-foreground">
      <nav
        role="tablist"
        aria-label="Report sections"
        className="sticky top-0 z-30 flex gap-8 overflow-x-auto border-b border-glass-border bg-glass-strong px-6 backdrop-blur-2xl md:px-12"
      >
        {SECTIONS.map((item, index) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeSection(item.id)}
              className={cn(
                "flex h-[50px] shrink-0 items-center gap-2 whitespace-nowrap border-b-2 text-[13px] transition-colors",
                active
                  ? "border-accent font-semibold text-foreground"
                  : "border-transparent text-secondary hover:text-secondary",
              )}
            >
              <span className="text-[11px] font-semibold tabular-nums text-tertiary">
                {String(index + 1).padStart(2, "0")}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mx-auto max-w-[1520px] px-6 py-10 md:px-12">
        {/* ── 01 Data we have ── */}
        {section === "data" ? (
          <section>
            <SectionTitle>What this version is built on</SectionTitle>

            <div className="mt-7 flex max-w-[900px] items-start gap-3 rounded-xl border border-accent-border bg-accent-subtle px-4 py-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
              <p className="text-[13px] leading-[1.55] text-secondary">
                <b className="mr-2 text-[9.5px] font-semibold uppercase tracking-[0.11em] whitespace-nowrap text-accent">
                  Read this first
                </b>
                {report.notice}
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {report.dataCards.map((card) => (
                <article key={card.title} className={cn(CARD, CARD_PLAIN)}>
                  <span
                    className={cn(
                      "self-start rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em]",
                      SOURCE_STYLE[card.kind].className,
                    )}
                  >
                    {SOURCE_STYLE[card.kind].label}
                  </span>
                  <h3 className="mt-3 font-display text-[16px] font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.55] text-secondary">
                    {card.what}
                  </p>

                  {card.gaveUs ? (
                    <div className="mt-3">
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-tertiary">
                        What it gave us
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.55] text-secondary">
                        {card.gaveUs}
                      </p>
                    </div>
                  ) : null}

                  {card.items ? (
                    <ul className="mt-3 flex flex-col">
                      {card.items.map((item) => (
                        <li
                          key={item}
                          className="border-t border-border-subtle py-1.5 text-[12px] leading-[1.45] text-secondary"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {card.footnote ? (
                    <p className="mt-3 text-[12px] leading-[1.55] text-secondary">
                      {card.footnote}
                    </p>
                  ) : null}

                  {/* Pinned to the foot so the meters line up across the row. */}
                  <div className="mt-auto pt-4">
                    <DataProgress pct={card.collectedPct} />
                    <DataActions
                      kind={card.kind}
                      onStart={(method) => start("sales", method)}
                    />
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-5 text-[11.5px] text-secondary">
              <span>
                <b className="font-semibold text-foreground">Export</b> from the CRM dump,
                partial
              </span>
              <span>
                <b className="font-semibold text-foreground">Interview</b> from the
                conversation, an estimate
              </span>
            </div>
          </section>
        ) : null}

        {/* ── 02 As-is / 03 To-be ──
            The title sits in the content column rather than above both, so it
            lines up with the motion it describes and the rail starts level
            with it instead of under a full-width heading. */}
        {showMotions ? (
          <section>
            {/* Pulled back out of the page gutter so the rail sits hard against
                the left edge rather than floating in a column of its own. */}
            <div className="-ml-6 grid items-start gap-6 md:-ml-12 md:grid-cols-[218px_minmax(0,1fr)] md:gap-9">
              <nav
                role="tablist"
                aria-label="Sales motions"
                className="flex flex-col gap-0.5 md:sticky md:top-[74px] max-md:flex-row max-md:overflow-x-auto max-md:pl-6"
              >
                {[
                  { code: "overview", label: "Overview", n: undefined },
                  ...report.motions.map((item) => ({
                    code: item.code,
                    label: item.name,
                    n: item.code,
                  })),
                ].map((item) => {
                  const active = motionCode === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setMotionCode(item.code)}
                      className={cn(
                        "shrink-0 rounded-r-lg border-l-2 py-2.5 pr-3 pl-2.5 text-left transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        active
                          ? "border-accent bg-accent-subtle text-foreground"
                          : "border-transparent text-secondary hover:bg-glass-quiet hover:text-foreground",
                      )}
                    >
                      <span className="flex items-baseline gap-1.5">
                        {item.n ? (
                          <span
                            className={cn(
                              "w-3 shrink-0 text-[10.5px] font-semibold tracking-[0.06em]",
                              active ? "text-accent" : "text-tertiary",
                            )}
                          >
                            {item.n}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "text-[13.5px] leading-[1.35]",
                            active ? "font-semibold" : "font-medium",
                          )}
                        >
                          {item.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div>
                <SectionTitle>
                  {tobe
                    ? "How sales works after transformation"
                    : "How selling works here"}
                </SectionTitle>

                <div className="mt-6">
                  {motion ? (
                    <MotionPanel motion={motion} tobe={tobe} />
                  ) : (
                    <OverviewPanel report={report} tobe={tobe} />
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ── 04 Calculation ── */}
        {section === "calculation" ? (
          <section>
            <SectionTitle>Calculation</SectionTitle>
            <Lede>{report.calculationLede}</Lede>

            <h2 className="mt-12 font-display text-[22px] font-semibold text-foreground">
              The interventions and their arithmetic
            </h2>
            <p className="mt-1.5 max-w-[760px] text-[13.5px] leading-[1.55] text-secondary">
              Two per motion. Open a row for the reasoning.
            </p>

            {report.motions.map((item) => (
              <MotionCalculation
                key={item.code}
                motion={item}
                rows={report.interventions.filter((row) => row.motion === item.code)}
                openWhy={openWhy}
                onToggleWhy={(id) =>
                  setOpenWhy((current) => (current === id ? undefined : id))
                }
              />
            ))}
          </section>
        ) : null}
      </div>

      {overlays}
    </div>
  );
}

/** The roll-up across all three motions, as-is or to-be. */
function OverviewPanel({
  report,
  tobe,
}: {
  report: SalesBaselineData;
  tobe: boolean;
}) {
  const { overview, overviewTarget, motions } = report;
  const view = tobe ? overviewTarget : overview;

  return (
    <div>
      <p className="mb-7 max-w-[900px] text-[14px] leading-[1.6] text-secondary">
        {view.intro}
      </p>

      <Metrics
        items={[
          {
            lead: true,
            label: `Revenue won · trailing 12 mo${tobe ? " · low to high" : ""}`,
            value: tobe ? (
              <Delta
                from={overview.revenue}
                to={overviewTarget.revenue}
                delta={overviewTarget.revenueDelta}
              />
            ) : (
              <>
                {overview.revenue}
                <Chip source="crm" />
              </>
            ),
          },
          {
            label: "Deals won · all motions",
            value: tobe ? (
              <Delta from={overview.dealsWon} to={overviewTarget.dealsWon} />
            ) : (
              <>
                {overview.dealsWon}
                <Chip source="crm" />
              </>
            ),
          },
          {
            label: "Time to close · by motion",
            value: tobe ? (
              <Delta from={overview.daysToClose} to={overviewTarget.daysToClose} />
            ) : (
              <>
                {overview.daysToClose}
                <Chip source="est" />
              </>
            ),
          },
          {
            label: "People selling",
            value: tobe ? (
              <Unchanged value={overview.fte} />
            ) : (
              <>
                {overview.fte}
                <Chip source="est" />
              </>
            ),
          },
        ]}
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {BASELINE_STAGES.map((stage, index) => (
          <article
            key={stage}
            className={cn(CARD, index === 2 ? CARD_HL : CARD_PLAIN)}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">
              Stage {index + 1} · {stage}
            </p>
            <h3 className="mt-1.5 mb-4 font-display text-[16px] leading-[1.3] font-semibold text-foreground">
              {stage}
            </h3>

            {(
              [
                {
                  label: "volume",
                  read: (item: BaselineMotion) => ({
                    now: item.stages[index].volume,
                    next: item.target.stages[index].volume,
                    delta: item.target.stages[index].volumeDelta,
                    label: item.stages[index].volumeLabel,
                  }),
                },
                {
                  label: "time in stage",
                  read: (item: BaselineMotion) => ({
                    now: item.stages[index].cycle,
                    next: item.target.stages[index].cycle,
                    delta: undefined,
                    label: item.stages[index].conversion
                      ? `${item.stages[index].conversion} to next stage · in stage`
                      : "in stage · deal is won",
                  }),
                },
                {
                  label: "hours",
                  read: (item: BaselineMotion) => ({
                    now: item.stages[index].hours,
                    next: item.target.stages[index].hours,
                    delta: item.target.stages[index].hoursDelta,
                    label: "per week",
                  }),
                },
              ] as const
            ).map((line, lineIndex) => (
              <div
                key={line.label}
                className={cn(
                  "pb-3",
                  lineIndex < 2 && "mb-3 border-b border-border-subtle",
                )}
              >
                <dl className="flex flex-col gap-2">
                  {motions.map((item) => {
                    const read = line.read(item);
                    return (
                      <div key={item.code} className="flex gap-2">
                        <dt className="w-2.5 shrink-0 pt-[3px] text-[9.5px] font-semibold tracking-[0.06em] text-accent">
                          {item.code}
                        </dt>
                        <div className="min-w-0">
                          <dd className="text-[13px] leading-tight font-semibold tabular-nums text-foreground">
                            {tobe ? (
                              <Delta from={read.now} to={read.next} delta={read.delta} />
                            ) : (
                              read.now
                            )}
                          </dd>
                          <dd className="mt-0.5 text-[10.5px] leading-[1.35] text-secondary">
                            {read.label}
                          </dd>
                        </div>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}

            <Row
              last
              label="information lives in"
              value={motions
                .map((item) =>
                  tobe
                    ? item.target.stages[index].system
                    : item.stages[index].system,
                )
                .join(" · ")}
            />

            <p className="mt-auto pt-4 text-[11.5px] leading-[1.55] text-secondary">
              {view.stageNotes[index]}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

/** One motion's four stages, as-is or to-be. */
function MotionPanel({ motion, tobe }: { motion: BaselineMotion; tobe: boolean }) {
  const target = motion.target;

  return (
    <div>
      <p className="mb-7 max-w-[900px] text-[14px] leading-[1.6] text-secondary">
        {tobe ? target.intro : motion.intro}
      </p>

      <Metrics
        items={[
          {
            lead: true,
            label: `Revenue won · trailing 12 mo${tobe ? " · low to high" : ""}`,
            value: tobe ? (
              <Delta
                from={motion.revenue}
                to={target.revenue}
                delta={target.revenueDelta}
              />
            ) : (
              <>
                {motion.revenue}
                <Chip source="crm" />
              </>
            ),
          },
          {
            label: `Win rate${tobe ? " · held flat" : ""}`,
            value: tobe ? (
              <Unchanged value={motion.winRate} />
            ) : (
              <>
                {motion.winRate}
                <Chip source="est" />
              </>
            ),
          },
          {
            label: "Time to close",
            value: tobe ? (
              <Delta from={motion.daysToClose} to={target.daysToClose} />
            ) : (
              <>
                {motion.daysToClose}
                <Chip source="est" />
              </>
            ),
          },
          {
            label: "Deals won",
            value: tobe ? (
              <Delta from={motion.dealsWon} to={target.dealsWon} />
            ) : (
              <>
                {motion.dealsWon}
                <Chip source="crm" />
              </>
            ),
          },
          {
            label: "People selling",
            value: tobe ? (
              <Unchanged value={motion.fte} />
            ) : (
              <>
                {motion.fte}
                <Chip source="est" />
              </>
            ),
          },
        ]}
      />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {motion.stages.map((stage, index) => {
          const next = target.stages[index];
          const highlight = index === motion.heaviestStage;

          return (
            <article
              key={stage.name}
              className={cn(CARD, highlight ? CARD_HL : CARD_PLAIN)}
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">
                Stage {index + 1} · {BASELINE_STAGES[index]}
              </p>
              <h3 className="mt-1.5 mb-4 min-h-[42px] font-display text-[16px] leading-[1.3] font-semibold text-foreground">
                {stage.name}
              </h3>

              <Row
                label={stage.volumeLabel}
                value={
                  tobe ? (
                    <Delta from={stage.volume} to={next.volume} delta={next.volumeDelta} />
                  ) : (
                    <>
                      {stage.volume}
                      <Chip source={stage.volumeSource} />
                    </>
                  )
                }
              />

              <Row
                label={
                  stage.conversion
                    ? "advance to next stage · time in stage"
                    : "time in stage · deal is won"
                }
                value={
                  <>
                    {stage.conversion ? `${stage.conversion} · ` : ""}
                    {tobe ? (
                      <Delta from={stage.cycle} to={next.cycle} />
                    ) : (
                      <>
                        {stage.cycle}
                        <Chip source="est" />
                      </>
                    )}
                  </>
                }
              />

              <Row
                label={`per week, all people in this motion${
                  tobe ? " · freed time goes back into selling" : ""
                }`}
                value={
                  tobe ? (
                    <Delta from={stage.hours} to={next.hours} delta={next.hoursDelta} />
                  ) : (
                    <>
                      {stage.hours}
                      <Chip source="est" />
                    </>
                  )
                }
              />

              <Row
                last
                label="information lives in"
                value={tobe ? next.system : stage.system}
              />

              {tobe ? (
                <p className="mt-auto pt-4 text-[11.5px] leading-[1.55] text-secondary">
                  {next.note}
                </p>
              ) : (
                <p className="mt-auto pt-4 text-[11.5px] leading-[1.55] text-secondary italic">
                  <span className="mb-0.5 block text-[9px] font-semibold uppercase not-italic tracking-[0.1em] text-tertiary">
                    Head of sales
                  </span>
                  &ldquo;{stage.quote}&rdquo;
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

/** One motion's intervention table, with the reasoning behind each row. */
function MotionCalculation({
  motion,
  rows,
  openWhy,
  onToggleWhy,
}: {
  motion: BaselineMotion;
  rows: BaselineIntervention[];
  openWhy?: string;
  onToggleWhy: (id: string) => void;
}) {
  const lo = rows.reduce((sum, row) => sum + row.lo, 0);
  const hi = rows.reduce((sum, row) => sum + row.hi, 0);

  return (
    <div className={cn(CARD, CARD_PLAIN, "mt-6 gap-0 p-0")}>
      {/* The motion's own header, ruled off from its arithmetic. */}
      <div className="border-b border-border px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-accent">
          {motion.code}
        </p>
        <h3 className="mt-1 font-display text-[18px] font-semibold text-foreground">
          {motion.name}
        </h3>
        <p className="mt-0.5 text-[12px] text-secondary">
          {motion.revenue} today · {motion.dealsWon}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
          {/* Fixed proportions: the arithmetic column will otherwise take
              whatever it wants and squeeze the result out of sight. */}
          <colgroup>
            <col className="w-[23%]" />
            <col className="w-[19%]" />
            <col className="w-[21%]" />
            <col className="w-[21%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-glass-quiet">
              {[
                "Intervention",
                "Base figure today",
                "Assumption",
                "Arithmetic",
                "Result · low to high",
              ].map((head, index) => (
                <th
                  key={head}
                  className={cn(
                    "border-b border-border py-2.5 pr-4 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary",
                    index === 0 && "pl-5",
                    index === 4 && "pr-5 text-right",
                  )}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const id = `${motion.code}-${index}`;
              const open = openWhy === id;

              return (
                <Fragment key={id}>
                  <tr
                    tabIndex={0}
                    role="button"
                    aria-expanded={open}
                    onClick={() => onToggleWhy(id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggleWhy(id);
                      }
                    }}
                    className="cursor-pointer border-b border-border-subtle align-top transition-colors hover:bg-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <td className="py-4 pr-4 pl-5 font-semibold text-foreground">
                      {row.name}
                      <span className="mt-1.5 block w-fit rounded bg-accent-subtle px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-accent">
                        Tier {row.tier}
                      </span>
                    </td>
                    <td className="py-4 pr-4 leading-[1.45] text-secondary">
                      {row.base}
                      <span className="mt-1 block text-[11px] text-tertiary">
                        {row.source}
                      </span>
                    </td>
                    <td className="py-4 pr-4 leading-[1.45] text-secondary">
                      {row.assumption}
                    </td>
                    <td className="py-4 pr-4 leading-[1.45] text-secondary">
                      {row.arithmetic}
                    </td>
                    <td className="py-4 pr-5 text-right">
                      {row.capacity ? (
                        <>
                          <b className="block font-display text-[17px] font-semibold text-foreground">
                            {row.capacity}
                          </b>
                          <span className="text-[12.5px] text-secondary">
                            counted as $0
                          </span>
                        </>
                      ) : (
                        <span className="font-display text-[16px] font-semibold whitespace-nowrap text-accent">
                          +~${row.lo}M to +~${row.hi}M
                        </span>
                      )}
                    </td>
                  </tr>

                  {open ? (
                    <tr className="border-b border-accent-border">
                      <td colSpan={5} className="bg-accent-subtle px-5 py-3.5">
                        <span className="mr-2.5 text-[9.5px] font-semibold uppercase tracking-[0.11em] text-accent">
                          Why
                        </span>
                        <span className="text-[12.5px] leading-[1.5] text-secondary">
                          {row.why}
                        </span>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}

            <tr className="bg-glass-quiet">
              <td colSpan={4} className="py-3.5 pl-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-tertiary">
                Motion total
              </td>
              <td className="py-3.5 pr-5 text-right font-display text-[17px] font-semibold whitespace-nowrap text-foreground">
                +~${lo}M to +~${hi}M
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
