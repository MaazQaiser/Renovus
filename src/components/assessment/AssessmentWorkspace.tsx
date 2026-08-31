"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CaptureRail } from "@/components/interview/CaptureRail";
import { CaptureRailMobile } from "@/components/interview/CaptureRailMobile";
import { getSalesCaptureProgress } from "@/lib/assessment/sales-progress";
import {
  getOrInitSalesSession,
  getServerSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import { AssessmentChat } from "./chat/AssessmentChat";

export function AssessmentWorkspace() {
  const session = useSyncExternalStore(
    subscribeToSalesSession,
    getOrInitSalesSession,
    getServerSalesSession,
  );

  const progress = useMemo(() => getSalesCaptureProgress(session), [session]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CaptureRailMobile progress={progress} />
        <AssessmentChat />
      </div>

      <aside
        aria-label="What I'm capturing"
        className="hidden h-full w-[320px] shrink-0 flex-col border-l border-slate-300 md:flex xl:w-[360px]"
      >
        <CaptureRail key={session.id} progress={progress} />
      </aside>
    </div>
  );
}
