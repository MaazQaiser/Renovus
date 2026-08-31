"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getCaptureProgress } from "@/lib/offshoring/progress";
import {
  getOrInitOffshoringSession,
  getServerOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import { CaptureRail } from "@/components/interview/CaptureRail";
import { CaptureRailMobile } from "@/components/interview/CaptureRailMobile";
import { OffshoringChat } from "./OffshoringChat";

export function OffshoringWorkspace() {
  const session = useSyncExternalStore(
    subscribeToOffshoringSession,
    getOrInitOffshoringSession,
    getServerOffshoringSession,
  );

  const progress = useMemo(() => getCaptureProgress(session), [session]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <CaptureRailMobile progress={progress} />
        <OffshoringChat />
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
