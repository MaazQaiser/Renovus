"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { CaptureProgress } from "@/lib/interview/capture";
import { CaptureProgressBar } from "./CaptureProgressBar";
import { CaptureRail } from "./CaptureRail";

export interface CaptureRailMobileProps {
  progress: CaptureProgress;
}

export function CaptureRailMobile({ progress }: CaptureRailMobileProps) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className="shrink-0 border-b border-border bg-surface md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
      >
        <span className="shrink-0 text-[13px] leading-5 font-semibold tabular-nums">
          {progress.totalCaptured} of {progress.totalItems} captured
        </span>
        <CaptureProgressBar percent={progress.percent} className="min-w-0 flex-1" />
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden
          className={cn(
            "shrink-0 text-tertiary transition-transform duration-150",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="max-h-[60vh] overflow-y-auto overscroll-contain border-t border-border"
        >
          <CaptureRail progress={progress} showHeader={false} fill={false} />
        </div>
      ) : null}
    </div>
  );
}
