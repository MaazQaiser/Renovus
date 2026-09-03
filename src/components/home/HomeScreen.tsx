"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { companies } from "@/data/companies";
import { clearSalesSession, getSalesSession, subscribeToSalesSession } from "@/lib/assessment/sales-session";
import { listAssessmentCompanies } from "@/lib/assessment/custom-companies";
import { buildResumables, type Resumable } from "@/lib/home/resumable";
import { buildHomeSummary } from "@/lib/home/summary";
import {
  clearOffshoringSession,
  getOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import { formatDate } from "@/lib/format";
import { getServerRecords, listRecords, subscribeToRecords } from "@/lib/records";
import { useSession } from "@/providers/SessionProvider";
import { AskPanel } from "./AskPanel";
import { GreetingBand } from "./GreetingBand";
import { RecentReports } from "./RecentReports";
import { SectionLabel } from "./SectionLabel";
import { ResumeCard } from "./ResumeCard";
import { StatTiles, type StatTile } from "./StatTiles";

const RECENT_LIMIT = 3;

/** Both session stores return null server-side; the guard below keeps that explicit. */
const noSession = () => null;

export function HomeScreen() {
  const { session } = useSession();

  const salesSession = useSyncExternalStore(
    subscribeToSalesSession,
    getSalesSession,
    noSession,
  );
  const offshoringSession = useSyncExternalStore(
    subscribeToOffshoringSession,
    getOffshoringSession,
    noSession,
  );
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);

  const [pendingReset, setPendingReset] = useState<Resumable | undefined>();

  const resumables = useMemo(
    () => buildResumables(salesSession, offshoringSession),
    [salesSession, offshoringSession],
  );

  const coverage = useMemo(
    () => ({
      assessedCompanies: new Set(records.map((record) => record.companyName)).size,
      portfolioSize: listAssessmentCompanies(companies).length,
      salesCount: records.filter((record) => record.agent === "sales").length,
      offshoringCount: records.filter((record) => record.agent === "offshoring").length,
    }),
    [records],
  );

  const summary = useMemo(
    () =>
      buildHomeSummary({
        completedCount: records.length,
        companiesCovered: coverage.assessedCompanies,
        portfolioSize: coverage.portfolioSize,
        salesCount: coverage.salesCount,
        offshoringCount: coverage.offshoringCount,
        // records is newest-first, so [0] is the most recent report.
        lastCompleted: records[0],
        resumables,
      }),
    [records, coverage, resumables],
  );

  const tiles = useMemo<StatTile[]>(() => {
    const { assessedCompanies, portfolioSize } = coverage;

    return [
      {
        id: "in-progress",
        label: "In progress",
        value: String(resumables.length),
        hint: resumables.length > 0 ? "Waiting for you to pick back up" : "Nothing paused",
      },
      {
        id: "reports",
        label: "Saved reports",
        value: String(records.length),
        hint: "Completed and archived",
        href: "/companies",
      },
      {
        id: "companies",
        label: "PortCos covered",
        value: `${assessedCompanies} of ${portfolioSize}`,
        hint: "At least one finished assessment",
      },
      {
        id: "last",
        label: "Last completed",
        value: records[0] ? formatDate(records[0].completedAt) : "—",
        hint: records[0]?.companyName ?? "No assessments finished yet",
      },
    ];
  }, [records, resumables.length, coverage]);

  const recent = records.slice(0, RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <GreetingBand name={session?.name} summary={summary} />

      {/* Nothing to resume means no section at all — an empty placeholder here
          would be a standing reminder of work that does not exist. */}
      {resumables.length > 0 ? (
        <section>
          <SectionLabel>Pick up where you left off</SectionLabel>
          <ul className="mt-3 overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-3xl">
            {resumables.map((item) => (
              <ResumeCard key={item.id} item={item} onStartOver={setPendingReset} />
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <SectionLabel className="mb-3">At a glance</SectionLabel>
        <StatTiles tiles={tiles} />
      </section>

      {recent.length > 0 ? <RecentReports records={recent} /> : null}

      <AskPanel />

      <ConfirmationDialog
        open={Boolean(pendingReset)}
        onOpenChange={(open) => {
          if (!open) setPendingReset(undefined);
        }}
        title="Start over?"
        description={
          pendingReset
            ? `This discards the ${pendingReset.agentLabel.toLowerCase()}${
                pendingReset.companyName ? ` for ${pendingReset.companyName}` : ""
              } on this device, including ${pendingReset.captured} captured answer${
                pendingReset.captured === 1 ? "" : "s"
              }. This cannot be undone.`
            : ""
        }
        confirmLabel="Discard and start over"
        cancelLabel="Keep progress"
        tone="danger"
        onConfirm={() => {
          if (pendingReset?.agent === "sales") clearSalesSession();
          if (pendingReset?.agent === "offshoring") clearOffshoringSession();
          setPendingReset(undefined);
        }}
      />
    </div>
  );
}
