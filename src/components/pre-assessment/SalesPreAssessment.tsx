"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Modal } from "@/components/overlay/Modal";
import { Button } from "@/components/primitives/Button";
import { getMockSalesPreAssessment } from "@/data/salesPreAssessment";
import {
  allStats,
  formatCostK,
  impactTotals,
  MODE_LABEL,
  motionStats,
  stageRollup,
  stageStats,
  tierLadder,
  TIER_NAME,
  TIER_WHEN,
} from "@/lib/pre-assessment";
import type { AppHref } from "@/lib/routes";
import type {
  DataSource,
  Metric,
  Motion,
  MotionStage,
  SalesPreAssessmentData,
  SystemMapEntry,
  TaskMode,
} from "@/types/sales-pre-assessment";
import { cn } from "@/lib/cn";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";

const SECTIONS = [
  { id: "data", label: "Data we need" },
  { id: "asis", label: "As-is" },
  { id: "tobe", label: "To-be" },
  { id: "impact", label: "Impact" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SOURCE_STYLE: Record<DataSource, { label: string; className: string }> = {
  export: { label: "Export", className: "bg-gold text-foreground" },
  interview: { label: "Interview", className: "bg-gold-subtle text-gold-ink" },
  both: { label: "Interview + Export", className: "bg-border-subtle text-secondary" },
};

/**
 * Gold marks what moves to software, blue what a person still owns.
 *
 * `human` must not be the same token as the bar's track, or the hours left
 * with people read as empty space rather than as a deliberate choice.
 */
const MODE_FILL: Record<TaskMode, string> = {
  auto: "bg-gold",
  ai: "bg-accent",
  human: "bg-border-strong",
  rm: "bg-accent-muted",
};

/**
 * Glass, per DESIGN.md: translucent fill, wide blur, and the lit top edge from
 * --shadow-glass. Every surface on the page gets it — a single opaque card
 * reads as a patch stuck on top.
 */
const CARD =
  "flex h-full flex-col rounded-xl border p-5 shadow-[var(--shadow-glass)] backdrop-blur-3xl";
const CARD_PLAIN = "border-glass-border bg-glass";
/** The stage that costs the most, lifted with the brand gold rather than cream. */
const CARD_HL = "border-gold-border bg-gold-subtle";

/**
 * Task cards inside the flow modal. The modal panel is opaque white, so glass
 * would have nothing to sit against and the card edges would disappear.
 */
const CARD_ON_PANEL = "border-border-subtle bg-surface-tertiary";

/** Uppercase eyebrow above a section heading. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-ink">
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mt-3 max-w-[60ch] font-display text-[30px] leading-[1.22] font-semibold tracking-[-0.01em] text-foreground md:text-[34px]">
      {children}
    </h1>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-[22px] font-semibold text-foreground">{children}</h2>
  );
}

function Metrics({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="mt-7 flex flex-wrap items-end gap-x-14 gap-y-5">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={cn(metric.lead && "border-border-subtle pr-8 sm:border-r sm:pr-14")}
        >
          <p
            className={cn(
              "font-display leading-none font-semibold tabular-nums",
              metric.lead ? "text-[40px] text-gold-ink" : "text-[28px] text-foreground",
            )}
          >
            {metric.value}
          </p>
          <p
            className={cn(
              "mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em]",
              metric.lead ? "text-gold-ink" : "text-tertiary",
            )}
          >
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function Row({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("pb-3", !last && "mb-3 border-b border-border-subtle")}>{children}</div>
  );
}

function Value({ value, label }: { value: string; label: string }) {
  return (
    <>
      <p className="text-[15px] leading-tight font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-[11px] leading-[1.35] text-secondary">{label}</p>
    </>
  );
}

/** Coded figure lines, one per motion, used on the roll-up cards. */
function Coded({
  rows,
}: {
  rows: { code: string; value: string; label: string }[];
}) {
  return (
    <dl className="flex flex-col gap-0.5">
      {rows.map((row) => (
        <div key={row.code} className="flex items-baseline gap-2 text-[11px]">
          <dt className="w-2.5 shrink-0 text-[9.5px] font-semibold tracking-[0.06em] text-gold-ink">
            {row.code}
          </dt>
          <dd className="shrink-0 text-[14px] font-semibold tabular-nums text-foreground">
            {row.value}
          </dd>
          <dd className="text-secondary">{row.label}</dd>
        </div>
      ))}
    </dl>
  );
}

function SystemMap({ entries }: { entries: SystemMapEntry[] }) {
  return (
    <div className="mt-9 border-t border-border-subtle pt-6">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">
        <span className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
          System map
        </span>
        <span className="text-[12px] text-secondary">
          where information lives at each stage, and how many times a person re-keys,
          re-uploads or forwards it to get to the next one
        </span>
      </div>
      <ol className="flex items-stretch max-md:flex-col">
        {entries.map((entry, index) => (
          <li key={entry.stage} className="flex flex-1 items-stretch max-md:flex-col">
            <div className="flex-1 rounded-xl border border-glass-border bg-glass px-4 py-3.5 shadow-[var(--shadow-glass)] backdrop-blur-3xl">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-secondary">
                {entry.stage}
              </p>
              <p className="mt-1.5 min-h-[36px] text-[13px] leading-[1.4] font-semibold text-foreground">
                {entry.systems}
              </p>
              <p className="mt-2.5 text-[11px] text-secondary">
                <b className="mr-0.5 text-[14px] font-semibold text-foreground">
                  {entry.handoffs}
                </b>{" "}
                manual handoff{entry.handoffs === 1 ? "" : "s"}
              </p>
            </div>
            {index < entries.length - 1 ? (
              <span className="flex w-7 shrink-0 items-center justify-center text-tertiary max-md:h-6 max-md:w-full max-md:rotate-90">
                <ArrowRight size={14} aria-hidden />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Today's hours split by what happens to them, with a key underneath. */
function MixBar({ mix, total }: { mix: Record<TaskMode, number>; total: number }) {
  const modes: TaskMode[] = ["auto", "ai", "human", "rm"];
  return (
    <div className="mt-3">
      <span className="flex h-1.5 overflow-hidden rounded-full bg-border-subtle" aria-hidden>
        {modes.map((mode) => (
          <span
            key={mode}
            className={MODE_FILL[mode]}
            style={{ width: `${total === 0 ? 0 : (mix[mode] / total) * 100}%` }}
          />
        ))}
      </span>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-secondary">
        {modes
          .filter((mode) => mix[mode] > 0)
          .map((mode) => (
            <span key={mode}>
              <b className="font-semibold text-foreground">{mix[mode]} h</b>{" "}
              {MODE_LABEL[mode].toLowerCase()}
            </span>
          ))}
      </p>
    </div>
  );
}

export interface SalesPreAssessmentProps {
  report?: SalesPreAssessmentData;
  backHref?: AppHref;
}

export function SalesPreAssessment({
  report: archived,
  backHref,
}: SalesPreAssessmentProps = {}) {
  const report = useMemo(
    () => archived ?? getMockSalesPreAssessment("Portfolio company"),
    [archived],
  );

  const [section, setSection] = useState<SectionId>("data");
  const [motionCode, setMotionCode] = useState("overview");
  const [flow, setFlow] = useState<
    { stage: MotionStage; motion: Motion; mode: "asis" | "tobe" } | undefined
  >();
  const [openWhy, setOpenWhy] = useState<string | undefined>();

  const topbarMeta = useMemo(
    () => ({
      title: "Sales Process AI Pre-Assessment",
      badges: [report.companyName],
      actions: (
        <Button href={backHref ?? ("/companies" as AppHref)} variant="secondary" size="sm">
          {backHref ? "Back to PortCo" : "Back to PortCos"}
        </Button>
      ),
    }),
    [report.companyName, backHref],
  );
  useSetTopbarMeta(topbarMeta);

  // Motion tabs are per-section, so switching section resets to the roll-up.
  const changeSection = useCallback((next: SectionId) => {
    setSection(next);
    setMotionCode("overview");
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (flow) return;
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
  }, [flow, motionCode, report.motions]);

  const motion = report.motions.find((item) => item.code === motionCode);
  const totals = useMemo(() => allStats(report.motions), [report.motions]);
  const ladder = useMemo(() => tierLadder(report.motions), [report.motions]);
  const impact = useMemo(() => impactTotals(report.interventions), [report.interventions]);

  const showMotionTabs = section === "asis" || section === "tobe";

  return (
    <div className="font-sans text-foreground">
      <nav
        role="tablist"
        aria-label="Report sections"
        className="flex gap-8 overflow-x-auto border-b border-glass-border px-6 md:px-12"
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
                  ? "border-gold-border font-semibold text-foreground"
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
        {/* ── 01 Data we need ── */}
        {section === "data" ? (
          <section>
            <Eyebrow>01 · Data we need</Eyebrow>
            <SectionTitle>What this report is built on</SectionTitle>
            <p className="mt-5 max-w-[760px] text-[15px] leading-[1.6] text-secondary">
              Everything in the report comes from five kinds of information. Some of it
              is exported from systems. Some of it is people telling us how they work.
              The tags say which is which. About one day of the company&apos;s time in
              total.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {report.dataNeeded.map((item) => (
                <article
                  key={item.title}
                  className={cn(CARD, CARD_PLAIN, "min-h-[320px]")}
                >
                  <span
                    className={cn(
                      "self-start rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em]",
                      SOURCE_STYLE[item.source].className,
                    )}
                  >
                    {SOURCE_STYLE[item.source].label}
                  </span>
                  <h3 className="mt-3 font-display text-[16px] font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.55] text-secondary">
                    {item.what}
                  </p>

                  {[
                    { label: "Why", text: item.why },
                    { label: "How", text: item.how },
                  ].map((block) => (
                    <div key={block.label} className="mt-3">
                      <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-tertiary">
                        {block.label}
                      </p>
                      <p className="mt-1 text-[12px] leading-[1.55] text-secondary">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-4 text-[11.5px] text-secondary">
              <span>
                <b className="font-semibold text-foreground">Export</b> pulled from a system,
                reliable
              </span>
              <span>
                <b className="font-semibold text-foreground">Interview</b> what people tell
                us, an estimate
              </span>
              <span>
                <b className="font-semibold text-foreground">Interview + Export</b> a system
                pull plus what people tell us
              </span>
            </div>
          </section>
        ) : null}

        {/* ── Section header for as-is / to-be ── */}
        {showMotionTabs ? (
          <section>
            <Eyebrow>
              {section === "asis"
                ? `02 · As-is · ${report.sector} · ${report.motions.length} motions`
                : "03 · To-be with automation and AI"}
            </Eyebrow>
            <SectionTitle>
              {section === "asis" ? report.asIsTitle : report.toBeTitle}
            </SectionTitle>
            <p className="mt-5 max-w-[820px] text-[14px] leading-[1.55] text-secondary">
              {section === "asis" ? report.asIsLede : report.toBeLede}
            </p>

            {section === "tobe" ? (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11.5px] text-secondary">
                {(["auto", "ai", "human", "rm"] as TaskMode[]).map((mode) => (
                  <span key={mode} className="flex items-center gap-1.5">
                    <span
                      className={cn("size-2.5 rounded-sm", MODE_FILL[mode])}
                      aria-hidden
                    />
                    {MODE_LABEL[mode]}
                  </span>
                ))}
              </div>
            ) : null}

            <div
              role="tablist"
              aria-label="Sales motions"
              className="mt-7 flex gap-8 overflow-x-auto border-b border-glass-border"
            >
              {[{ code: "overview", name: "Overview" }, ...report.motions].map((item) => {
                const active = item.code === motionCode;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMotionCode(item.code)}
                    className={cn(
                      "flex h-[46px] shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 text-[13.5px] transition-colors",
                      active
                        ? "border-gold-border font-semibold text-foreground"
                        : "border-transparent text-secondary hover:text-secondary",
                    )}
                  >
                    {item.code !== "overview" ? (
                      <span className="text-[10.5px] font-semibold tracking-[0.06em]">
                        {item.code}
                      </span>
                    ) : null}
                    {item.name}
                  </button>
                );
              })}
              <span className="ml-auto hidden items-center whitespace-nowrap text-[11px] text-tertiary lg:flex">
                ← → to switch
              </span>
            </div>

            <p className="mt-6 max-w-[820px] text-[14px] leading-[1.55] text-secondary">
              {section === "asis"
                ? (motion?.intro ?? report.overviewIntro)
                : (motion?.toBeIntro ?? report.toBeOverviewIntro)}
            </p>

            {/* ── As-is cards ── */}
            {section === "asis" ? (
              <>
                <Metrics metrics={motion?.metrics ?? report.overviewMetrics} />
                <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {motion
                    ? motion.stages.map((stage) => (
                        <article
                          key={stage.id}
                          className={cn(
                            CARD,
                            stage.heaviest ? CARD_HL : CARD_PLAIN,
                            "min-h-[520px]",
                          )}
                        >
                          <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                            {stage.stageLabel}
                          </p>
                          <h3 className="mt-1.5 mb-4 min-h-[46px] font-display text-[17.5px] leading-[1.3] font-semibold text-foreground">
                            {stage.name}
                          </h3>
                          <Row>
                            <Value {...stage.volume} />
                          </Row>
                          <Row>
                            <Value {...stage.conversion} />
                          </Row>
                          <Row>
                            <Value value={`${stage.hoursPerWeek} h`} label="per week" />
                          </Row>
                          <Row>
                            <Value
                              value={formatCostK(stage.costK)}
                              label="people cost / yr"
                            />
                          </Row>
                          <Row last>
                            <Value value={stage.systems} label="information lives in" />
                            <p className="mt-1.5 text-[11px] text-secondary">
                              <b className="mr-0.5 font-semibold text-gold-ink">
                                {stage.handoffs}
                              </b>
                              manual handoff{stage.handoffs === 1 ? "" : "s"} (re-keys,
                              re-uploads, forwarded emails)
                            </p>
                          </Row>
                          <p className="mt-1.5 text-[12px] leading-[1.6] text-secondary">
                            {stage.note}
                          </p>
                          <div className="mt-auto pt-4">
                            <button
                              type="button"
                              onClick={() => setFlow({ stage, motion, mode: "asis" })}
                              className={cn(
                                "flex w-full items-center justify-between rounded-control border px-3 py-2.5 text-[11.5px] text-secondary transition-colors hover:border-gold-border hover:text-foreground",
                                stage.heaviest ? "border-gold-border" : "border-border-subtle",
                              )}
                            >
                              <span>
                                {stage.tasks.length} activities · {stage.hoursPerWeek} h/wk
                              </span>
                              <span className="flex items-center gap-1 text-gold-ink">
                                View flow
                                <ArrowRight size={12} aria-hidden />
                              </span>
                            </button>
                          </div>
                        </article>
                      ))
                    : report.overviewStages.map((overview, index) => {
                        const roll = stageRollup(report.motions, index);
                        return (
                          <article
                            key={overview.stageLabel}
                            className={cn(
                              CARD,
                              overview.heaviest ? CARD_HL : CARD_PLAIN,
                              "min-h-[520px]",
                            )}
                          >
                            <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                              {overview.stageLabel}
                            </p>
                            <h3 className="mt-1.5 mb-4 min-h-[46px] font-display text-[17.5px] leading-[1.3] font-semibold text-foreground">
                              {overview.name}
                            </h3>
                            <Row>
                              <Coded rows={roll.volumes} />
                            </Row>
                            <Row>
                              <Coded rows={roll.conversions} />
                            </Row>
                            <Row>
                              <Value
                                value={`${roll.hoursPerWeek} h`}
                                label="per week"
                              />
                            </Row>
                            <Row>
                              <Value
                                value={formatCostK(roll.costK)}
                                label="people cost / yr"
                              />
                              <p className="mt-1.5 flex gap-3 text-[11px] text-secondary">
                                {roll.costSplit.map((split) => (
                                  <span key={split.code}>
                                    <b className="mr-0.5 font-semibold text-gold-ink">
                                      {split.code}
                                    </b>
                                    {split.value}
                                  </span>
                                ))}
                              </p>
                            </Row>
                            <Row last>
                              <Value
                                value={overview.systems}
                                label="information lives in"
                              />
                              <p className="mt-1.5 text-[11px] text-secondary">
                                <b className="mr-0.5 font-semibold text-gold-ink">
                                  {roll.handoffs}
                                </b>
                                manual handoffs across the three motions
                              </p>
                            </Row>
                            <p className="mt-1.5 text-[12px] leading-[1.6] text-secondary">
                              {overview.note}
                            </p>
                          </article>
                        );
                      })}
                </div>
                <SystemMap
                  entries={motion ? motion.systemMap : report.overviewSystemMap}
                />
              </>
            ) : null}

            {/* ── To-be cards ── */}
            {section === "tobe" ? (
              <>
                <Metrics
                  metrics={(() => {
                    const stats = motion ? motionStats(motion) : totals;
                    return [
                      {
                        value: `${stats.freed} h`,
                        label: "Freed per week · back into selling",
                        lead: true,
                      },
                      {
                        value: `${stats.now} → ${stats.after}`,
                        label: "Selling hours / week",
                      },
                      {
                        value: `${Math.round((stats.freed / stats.now) * 100)}%`,
                        label: "Less time on non-selling work",
                      },
                      {
                        value: (stats.freed / 40).toFixed(1),
                        label: "FTE-equivalents of selling time gained",
                      },
                      {
                        value:
                          motion?.metrics.find((m) => m.label === "Selling FTE")?.value ??
                          "25.9",
                        label: "Selling FTE · unchanged",
                      },
                    ];
                  })()}
                />

                <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {motion
                    ? motion.stages.map((stage) => {
                        const stats = stageStats(stage);
                        return (
                          <article
                            key={stage.id}
                            className={cn(
                              CARD,
                              stage.heaviest ? CARD_HL : CARD_PLAIN,
                              "min-h-[420px]",
                            )}
                          >
                            <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                              {stage.stageLabel}
                            </p>
                            <h3 className="mt-1.5 mb-4 min-h-[46px] font-display text-[17.5px] leading-[1.3] font-semibold text-foreground">
                              {stage.name}
                            </h3>

                            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="text-[15px] font-semibold tabular-nums text-secondary line-through">
                                {stats.now} h
                              </span>
                              <span className="text-tertiary">→</span>
                              <span className="font-display text-[26px] leading-none font-semibold tabular-nums text-foreground">
                                {stats.after}
                                <span className="ml-1 font-sans text-[10px] font-semibold tracking-[0.06em] text-secondary">
                                  H / WK
                                </span>
                              </span>
                              <span className="text-[11.5px] font-semibold text-gold-ink">
                                {stats.freed} h freed
                              </span>
                            </p>

                            <span
                              className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-border-subtle"
                              aria-hidden
                            >
                              <span
                                className="h-full rounded-full bg-gold"
                                style={{
                                  width: `${(stats.after / stats.now) * 100}%`,
                                }}
                              />
                            </span>

                            <MixBar mix={stats.mix} total={stats.now} />

                            <p className="mt-3 border-l-2 border-gold-border pl-3 text-[12px] leading-[1.55] text-secondary">
                              <span className="font-semibold">Stays human — </span>
                              {stage.toBe.stays}
                            </p>

                            <div className="mt-auto pt-4">
                              <button
                                type="button"
                                onClick={() => setFlow({ stage, motion, mode: "tobe" })}
                                className={cn(
                                  "flex w-full items-center justify-between rounded-control border px-3 py-2.5 text-[11.5px] text-secondary transition-colors hover:border-gold-border hover:text-foreground",
                                  stage.heaviest ? "border-gold-border" : "border-border-subtle",
                                )}
                              >
                                <span>{stage.tasks.length} tasks · what changes</span>
                                <span className="flex items-center gap-1 text-gold-ink">
                                  View flow
                                  <ArrowRight size={12} aria-hidden />
                                </span>
                              </button>
                            </div>
                          </article>
                        );
                      })
                    : report.overviewStages.map((overview, index) => {
                        const roll = stageRollup(report.motions, index);
                        return (
                          <article
                            key={overview.stageLabel}
                            className={cn(
                              CARD,
                              overview.heaviest ? CARD_HL : CARD_PLAIN,
                              "min-h-[420px]",
                            )}
                          >
                            <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                              {overview.stageLabel}
                            </p>
                            <h3 className="mt-1.5 mb-4 font-display text-[17.5px] font-semibold text-foreground">
                              {overview.name}
                            </h3>
                            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <span className="text-[15px] font-semibold tabular-nums text-secondary line-through">
                                {roll.now} h
                              </span>
                              <span className="text-tertiary">→</span>
                              <span className="font-display text-[26px] leading-none font-semibold tabular-nums text-foreground">
                                {roll.after}
                                <span className="ml-1 font-sans text-[10px] font-semibold tracking-[0.06em] text-secondary">
                                  H / WK
                                </span>
                              </span>
                              <span className="text-[11.5px] font-semibold text-gold-ink">
                                {roll.freed} h freed
                              </span>
                            </p>
                            <div className="mt-4">
                              <p className="text-[11px] text-secondary">
                                by motion · after / before
                              </p>
                              <ul className="mt-2 flex flex-col gap-1.5">
                                {roll.parts.map((part) => (
                                  <li
                                    key={part.code}
                                    className="flex items-center gap-2 text-[11px]"
                                  >
                                    <span className="w-2.5 shrink-0 font-semibold text-gold-ink">
                                      {part.code}
                                    </span>
                                    <span className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle">
                                      <span
                                        className="h-full rounded-full bg-gold"
                                        style={{
                                          width: `${(part.stats.after / part.stats.now) * 100}%`,
                                        }}
                                      />
                                    </span>
                                    <span className="shrink-0 tabular-nums text-secondary">
                                      {part.stats.after} / {part.stats.now} h
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <MixBar mix={roll.mix} total={roll.now} />
                          </article>
                        );
                      })}
                </div>

                {/* The tier ladder only makes sense on the roll-up. */}
                {!motion ? (
                  <div className="mt-9 grid gap-4 md:grid-cols-3">
                    {ladder.map((rung) => (
                      <article
                        key={rung.tier}
                        className={cn(CARD, CARD_PLAIN, "min-h-[300px]")}
                      >
                        <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                          Tier {rung.tier}
                        </p>
                        <h3 className="mt-1.5 font-display text-[17.5px] font-semibold text-foreground">
                          {TIER_NAME[rung.tier]}
                        </h3>
                        <p className="mt-1 text-[11.5px] text-secondary">
                          {TIER_WHEN[rung.tier]}
                        </p>
                        <p className="mt-4 font-display text-[32px] leading-none font-semibold tabular-nums text-foreground">
                          {rung.freed}
                          <span className="ml-1.5 font-sans text-[10px] font-semibold tracking-[0.06em] text-secondary">
                            H / WK FREED
                          </span>
                        </p>
                        <ul className="mt-4 flex flex-col gap-1.5">
                          {rung.items.slice(0, 5).map((item) => (
                            <li
                              key={`${item.motionCode}-${item.task}`}
                              className="flex items-baseline justify-between gap-3 border-b border-border-subtle pb-1.5 text-[12px]"
                            >
                              <span className="min-w-0 text-secondary">
                                {item.task}{" "}
                                <span className="text-[10px] font-semibold text-gold-ink">
                                  {item.motionCode}
                                </span>
                              </span>
                              <span className="shrink-0 font-semibold tabular-nums text-foreground">
                                {item.hours} h
                              </span>
                            </li>
                          ))}
                          {rung.items.length > 5 ? (
                            <li className="text-[12px] text-secondary">
                              + {rung.items.length - 5} more tasks
                            </li>
                          ) : null}
                        </ul>
                      </article>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        ) : null}

        {/* ── 04 Impact ── */}
        {section === "impact" ? (
          <section>
            <Eyebrow>04 · Impact</Eyebrow>
            <SectionTitle>What this is worth</SectionTitle>
            <p className="mt-5 max-w-[820px] text-[14px] leading-[1.55] text-secondary">
              {report.impactLede}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "More revenue won",
                  now: `Today $${report.totalRevenueM.toFixed(1)}M a year`,
                  range: `+$${impact.revLoM.toFixed(1)}M to +$${impact.revHiM.toFixed(1)}M`,
                  unit: "/ YR",
                  sub: `${Math.round((impact.revLoM / report.totalRevenueM) * 100)}% to ${Math.round((impact.revHiM / report.totalRevenueM) * 100)}% more. Conversion rates held flat.`,
                },
                {
                  label: "More deals won",
                  now: `Today ${report.dealsPerMonth} a month`,
                  range: `${Math.round(report.dealsPerMonth + impact.winsLo / 12)} to ${Math.round(report.dealsPerMonth + impact.winsHi / 12)}`,
                  unit: "/ MO",
                  sub: "From more conversations, more bids, more touches",
                },
                {
                  label: "Selling time freed",
                  now: `Today ${totals.now.toLocaleString()} h a week on selling work`,
                  range: `${impact.hoursFreed} h`,
                  unit: "/ WK",
                  sub: `About ${Math.round(impact.hoursFreed / 40)} FTE of time. All of it routed back into selling volume.`,
                },
              ].map((card) => (
                <article key={card.label} className={cn(CARD, CARD_HL)}>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                    {card.label}
                  </p>
                  <p className="mt-2 text-[12px] text-secondary">{card.now}</p>
                  <p className="mt-3 font-display text-[30px] leading-none font-semibold tabular-nums text-foreground">
                    {card.range}
                    <span className="ml-1.5 font-sans text-[10px] font-semibold tracking-[0.06em] text-secondary">
                      {card.unit}
                    </span>
                  </p>
                  <p className="mt-3 text-[12px] leading-[1.55] text-secondary">
                    {card.sub}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-11">
              <SubTitle>The interventions and their arithmetic</SubTitle>
            </div>
            <p className="mt-1.5 text-[13px] text-secondary">
              Grouped by motion. Open a row for the reasoning behind the assumption.
            </p>

            {report.motions.map((item) => {
              const rows = report.interventions.filter(
                (row) => row.motionCode === item.code,
              );
              const sums = impactTotals(rows);
              const today = report.today[item.code];
              return (
                <div key={item.code} className="mt-7">
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                    {item.code}
                  </p>
                  <h3 className="mt-1 font-display text-[17.5px] font-semibold text-foreground">
                    {item.name}
                  </h3>
                  {today ? (
                    <p className="mt-0.5 text-[12px] text-secondary">
                      ${today.revM.toFixed(1)}M today · {today.wins} wins {today.unit}
                    </p>
                  ) : null}

                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-border-strong">
                          {[
                            "Intervention",
                            "Base figure today",
                            "Assumption",
                            "Arithmetic",
                            "Result · low to high",
                          ].map((head) => (
                            <th
                              key={head}
                              className="pb-2 pr-4 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary"
                            >
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => {
                          const key = `${item.code}-${row.name}`;
                          const open = openWhy === key;
                          return (
                            // Key on the Fragment: the row and its why-row are
                            // one list item, so keying the <tr>s inside it is
                            // what React warns about.
                            <Fragment key={key}>
                              <tr
                                onClick={() => setOpenWhy(open ? undefined : key)}
                                className="cursor-pointer border-b border-border-subtle align-top hover:bg-gold-subtle"
                              >
                                <td className="w-[22%] py-3 pr-4">
                                  <span className="text-[12.5px] font-semibold text-foreground">
                                    {row.name}
                                  </span>
                                  <span className="mt-1 flex items-center gap-1.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-gold-ink">
                                    Tier {row.tier}
                                    <ChevronDown
                                      size={11}
                                      className={cn(
                                        "transition-transform",
                                        open && "rotate-180",
                                      )}
                                      aria-hidden
                                    />
                                  </span>
                                </td>
                                <td className="w-[20%] py-3 pr-4 text-[12px] leading-[1.5] text-secondary">
                                  {row.base}
                                  <span className="mt-1 block text-[10.5px] text-tertiary">
                                    {row.src}
                                  </span>
                                </td>
                                <td className="w-[22%] py-3 pr-4 text-[12px] leading-[1.5] text-secondary">
                                  {row.assume}
                                </td>
                                <td className="w-[20%] py-3 pr-4 text-[11.5px] leading-[1.5] text-secondary">
                                  {row.arith}
                                </td>
                                <td className="w-[16%] py-3 text-[12px]">
                                  {row.capacity ? (
                                    <>
                                      <b className="block font-semibold text-foreground">
                                        {row.capacity}
                                      </b>
                                      <span className="text-secondary">
                                        {row.hoursFreed} h/wk freed · counted as $0
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <b className="block font-semibold text-gold-ink">
                                        +${row.revLoM.toFixed(1)}M to +$
                                        {row.revHiM.toFixed(1)}M
                                      </b>
                                      <span className="text-secondary">
                                        +{row.winsLo} to +{row.winsHi} wins / yr ·{" "}
                                        {row.hoursFreed} h/wk freed
                                      </span>
                                    </>
                                  )}
                                </td>
                              </tr>
                              {open ? (
                                <tr className="border-b border-border-subtle">
                                  <td colSpan={5} className="py-3 text-[12.5px] leading-[1.6] text-secondary">
                                    <b className="mr-1.5 font-semibold text-foreground">Why</b>
                                    {row.why}
                                  </td>
                                </tr>
                              ) : null}
                            </Fragment>
                          );
                        })}
                        <tr className="border-b-2 border-border-strong">
                          <td colSpan={4} className="py-3 pr-4 text-[12px] font-semibold text-foreground">
                            Motion total · {sums.hoursFreed} h/wk freed and routed into
                            volume
                          </td>
                          <td className="py-3 text-[12px]">
                            <b className="block font-semibold text-gold-ink">
                              +${sums.revLoM.toFixed(1)}M to +${sums.revHiM.toFixed(1)}M
                            </b>
                            <span className="text-secondary">
                              +{sums.winsLo} to +{sums.winsHi} wins / yr
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            <div className="mt-11">
              <SubTitle>Not in the headline: if win rates moved</SubTitle>
            </div>
            <p className="mt-1.5 max-w-[820px] text-[13px] leading-[1.55] text-secondary">
              Faster proposals and better follow-up usually lift win rate a little. At
              these deal volumes a few points is a handful of deals and cannot be
              evidenced up front, so it stays out of the numbers above.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border-strong">
                    {["Motion", "If this moved", "Arithmetic", "Would add"].map((head) => (
                      <th
                        key={head}
                        className="pb-2 pr-4 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.sensitivity.map((row) => (
                    <tr key={row.motion} className="border-b border-border-subtle align-top">
                      <td className="py-3 pr-4 text-[12.5px] font-semibold text-foreground">
                        {row.motion}
                      </td>
                      <td className="py-3 pr-4 text-[12px] leading-[1.5] text-secondary">
                        {row.ifMoved}
                      </td>
                      <td className="py-3 pr-4 text-[11.5px] text-secondary">
                        {row.arith}
                      </td>
                      <td className="py-3 text-[12.5px] font-semibold text-gold-ink">
                        {row.wouldAdd}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-11">
              <SubTitle>In what order</SubTitle>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {report.phases.map((phase, index) => (
                <article key={phase.name} className={cn(CARD, CARD_PLAIN)}>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.11em] text-gold-ink">
                    {phase.when}
                  </p>
                  <h3 className="mt-1.5 font-display text-[17.5px] font-semibold text-foreground">
                    {phase.name}
                  </h3>
                  <div className="mt-4 flex gap-8">
                    <div>
                      <p className="font-display text-[24px] leading-none font-semibold tabular-nums text-foreground">
                        {ladder[index]?.freed ?? 0} h
                      </p>
                      <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary">
                        freed / wk
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-display text-[24px] leading-none font-semibold text-foreground">
                        {phase.unlocksLabel}
                      </p>
                      <p className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary">
                        {phase.unlocks}
                      </p>
                    </div>
                  </div>
                  <ol className="mt-4 flex flex-col gap-1.5">
                    {phase.items.map((entry) => (
                      <li
                        key={entry}
                        className="border-b border-border-subtle pb-1.5 text-[12px] text-secondary"
                      >
                        {entry}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-auto pt-4 text-[12px] leading-[1.55] text-secondary">
                    <b className="mr-1 font-semibold text-foreground">Why here</b>
                    {phase.whyHere}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-glass-border pt-4 text-[11.5px] text-tertiary">
          <span>
            {report.companyName} · {report.date} · Confidential, Renovus Capital
            internal / operating review
          </span>
          <span>Prepared by Renovus Capital · Portfolio Operations</span>
        </div>
      </div>

      <Modal
        open={Boolean(flow)}
        onOpenChange={(open) => {
          if (!open) setFlow(undefined);
        }}
        size="xl"
        title={flow?.stage.name ?? ""}
        description={
          flow
            ? flow.mode === "asis"
              ? `Tasks in the order they happen. ${flow.stage.people}.`
              : "Same tasks, same order. Each one is marked automated, AI-assisted, stays human or removed, with hours before and after."
            : undefined
        }
      >
        {flow ? <TaskFlow {...flow} /> : null}
      </Modal>
    </div>
  );
}

/** The task chain for one stage, as it runs today or as it would run. */
function TaskFlow({
  stage,
  motion,
  mode,
}: {
  stage: MotionStage;
  motion: Motion;
  mode: "asis" | "tobe";
}) {
  const stats = stageStats(stage);
  const peak = Math.max(...stage.tasks.map((task) => task.hoursPerWeek));

  return (
    <>
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.13em] text-gold-ink">
        {motion.code} · {motion.name} · {stage.stageLabel}
        {mode === "tobe" ? " · TO-BE" : ""}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-11 gap-y-4 border-b border-border-subtle pb-5">
        {(mode === "asis"
          ? [
              { value: String(stage.tasks.length), label: "Tasks" },
              { value: `${stats.now} h`, label: "People-hours / week" },
              { value: formatCostK(stage.costK), label: "People cost / yr" },
            ]
          : [
              { value: `${stats.now} → ${stats.after} h`, label: "People-hours / week" },
              { value: `${stats.freed} h`, label: "Freed for selling" },
              { value: `${stats.mix.human} h`, label: "Stays human" },
            ]
        ).map((item) => (
          <div key={item.label}>
            <dd className="font-display text-[22px] leading-none font-semibold tabular-nums text-foreground">
              {item.value}
            </dd>
            <dt className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-tertiary">
              {item.label}
            </dt>
          </div>
        ))}
      </dl>

      <ol className="mt-5 flex items-stretch overflow-x-auto pb-2 max-md:flex-col">
        {stage.tasks.map((task, index) => {
          const toBe = stage.toBe.tasks[index];
          const heaviest = mode === "asis" && task.hoursPerWeek === peak;
          const human = mode === "tobe" && toBe?.mode === "human";
          return (
            <li key={task.task} className="flex items-stretch max-md:flex-col">
              <div
                className={cn(
                  "relative flex min-w-[178px] flex-1 flex-col rounded-xl border p-4",
                  heaviest || human ? CARD_HL : CARD_ON_PANEL,
                )}
              >
                {mode === "asis" ? (
                  <>
                    {task.tag ? (
                      <span className="absolute right-3.5 top-3.5 rounded bg-gold-subtle px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-gold-ink">
                        {task.tag}
                      </span>
                    ) : null}
                    <span className="mb-3 flex size-[22px] items-center justify-center rounded-full bg-gold text-[10.5px] font-semibold text-white">
                      {index + 1}
                    </span>
                  </>
                ) : (
                  <div className="mb-3 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em]",
                        toBe?.mode === "human"
                          ? "bg-border-subtle text-secondary"
                          : "bg-gold text-foreground",
                      )}
                    >
                      {toBe ? MODE_LABEL[toBe.mode] : "Unchanged"}
                    </span>
                    {toBe?.tier ? (
                      <span className="rounded bg-gold-subtle px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-gold-ink">
                        Tier {toBe.tier}
                      </span>
                    ) : null}
                  </div>
                )}

                <p className="pr-12 text-[12.5px] leading-[1.4] font-semibold text-foreground">
                  {task.task}
                </p>
                <p className="mt-1 text-[11px] text-secondary">{task.who}</p>

                {mode === "tobe" && toBe ? (
                  <p className="mt-2.5 text-[11.5px] leading-[1.5] text-secondary">
                    {toBe.how}
                  </p>
                ) : null}

                <p className="mt-auto pt-4 flex items-baseline gap-1.5">
                  {mode === "tobe" && toBe && toBe.hoursPerWeek !== task.hoursPerWeek ? (
                    <span className="text-[13px] font-semibold tabular-nums text-secondary line-through">
                      {task.hoursPerWeek}
                    </span>
                  ) : null}
                  <span className="font-display text-[22px] leading-none font-semibold tabular-nums text-foreground">
                    {mode === "asis" ? task.hoursPerWeek : (toBe?.hoursPerWeek ?? task.hoursPerWeek)}
                  </span>
                  <span className="font-sans text-[10px] font-semibold tracking-[0.06em] text-secondary">
                    H / WK
                  </span>
                </p>
                <span className="mt-2.5 flex h-[3px] overflow-hidden rounded-sm bg-border-subtle">
                  <span
                    className="h-full bg-gold"
                    style={{
                      width: `${
                        mode === "asis"
                          ? (task.hoursPerWeek / peak) * 100
                          : task.hoursPerWeek === 0
                            ? 0
                            : ((toBe?.hoursPerWeek ?? task.hoursPerWeek) /
                                task.hoursPerWeek) *
                              100
                      }%`,
                    }}
                  />
                </span>
              </div>

              {index < stage.tasks.length - 1 ? (
                <span className="flex w-7 shrink-0 items-center justify-center text-tertiary max-md:h-6 max-md:w-full max-md:rotate-90">
                  <ArrowRight size={14} aria-hidden />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-[11px] text-secondary">
        <span className="mr-1.5 inline-block size-2.5 -translate-y-px rounded-sm border border-gold-border bg-gold-subtle" />
        {mode === "asis"
          ? "Heaviest task in this stage · hours are people-hours per week, all roles combined"
          : "Cream = stays human on purpose · Tier 1 quick win (0 to 3 mo), Tier 2 next (3 to 9), Tier 3 ambitious (9 to 18)"}
      </p>
    </>
  );
}
