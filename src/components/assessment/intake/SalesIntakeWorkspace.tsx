"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CaptureRail } from "@/components/interview/CaptureRail";
import { CaptureRailMobile } from "@/components/interview/CaptureRailMobile";
import { InterviewTopbarActions } from "@/components/interview/InterviewTopbarActions";
import { ShareDialog } from "@/components/interview/ShareDialog";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { getSalesCaptureProgress } from "@/lib/assessment/sales-progress";
import {
  clearSalesSession,
  getOrInitSalesSession,
  getServerSalesSession,
  startFreshSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import { getCompanyById } from "@/lib/companies";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import { SalesIntake } from "./SalesIntake";

/**
 * The export route in the same frame as the interview: the stage on the left,
 * the "What I'm capturing" rail on the right, and the same topbar.
 *
 * It is the same assessment either way, so it cannot look like a different
 * screen — the rail reads the same session and the same progress function the
 * interview does, which is why it opens at zero and fills as answers land.
 */
export function SalesIntakeWorkspace() {
  const session = useSyncExternalStore(
    subscribeToSalesSession,
    getOrInitSalesSession,
    getServerSalesSession,
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  /** Bumped by "Start over", which remounts the stage on a fresh session. */
  const [run, setRun] = useState(0);

  const progress = useMemo(() => getSalesCaptureProgress(session), [session]);

  const company = session.companyId ? getCompanyById(session.companyId) : undefined;
  const companyLabel = session.companyName ?? company?.name;
  const canReview = Object.keys(session.answers).length > 0;

  useSetTopbarMeta(
    useMemo(
      () => ({
        title: "Sales function Assessment",
        badges: companyLabel ? [companyLabel, "Sales"] : undefined,
        actions: (
          <InterviewTopbarActions
            canReview={false}
            onReview={() => undefined}
            onRestart={() => setRestartOpen(true)}
            onShare={() => setShareOpen(true)}
          />
        ),
      }),
      [companyLabel],
    ),
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CaptureRailMobile progress={progress} />
        <SalesIntake key={run} />
      </div>

      <aside
        aria-label="What I'm capturing"
        className="hidden h-full w-[320px] shrink-0 flex-col border-l border-slate-300 md:flex xl:w-[360px]"
      >
        <CaptureRail key={`${session.id}-${run}`} progress={progress} />
      </aside>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        subject="sales"
        path="/agents/assessment/intake"
        label={
          companyLabel
            ? `sales assessment for ${companyLabel}`
            : "sales function assessment"
        }
      />

      <ConfirmationDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        title="Start over?"
        description={
          canReview
            ? "This discards the assessment in progress on this device, including the answers captured so far."
            : "This discards the assessment in progress on this device."
        }
        confirmLabel="Start over"
        cancelLabel="Keep progress"
        tone="danger"
        onConfirm={() => {
          clearSalesSession();
          startFreshSalesSession();
          setRun((current) => current + 1);
          setRestartOpen(false);
        }}
      />
    </div>
  );
}
