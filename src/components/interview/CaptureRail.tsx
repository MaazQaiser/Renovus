"use client";

import { useEffect, useRef, useState } from "react";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";
import type { CaptureProgress } from "@/lib/interview/capture";
import { CaptureProgressBar } from "./CaptureProgressBar";
import { CaptureSectionRow } from "./CaptureSectionRow";

export interface CaptureRailProps {
  progress: CaptureProgress;
  /** Hide the sticky heading when the rail is nested under the mobile summary bar. */
  showHeader?: boolean;
  /**
   * `true` (the desktop aside) makes the section list the flex scroller inside a
   * fixed-height column. `false` lets the rail size to its content so it can sit
   * inside the mobile disclosure panel, which owns the scrolling.
   */
  fill?: boolean;
  className?: string;
}

export function CaptureRail({
  progress,
  showHeader = true,
  fill = true,
  className,
}: CaptureRailProps) {
  const [announcement, setAnnouncement] = useState("");
  const previousCaptured = useRef(progress.totalCaptured);

  // Announce once per newly captured answer, not on every re-render.
  useEffect(() => {
    if (progress.totalCaptured === previousCaptured.current) return;
    previousCaptured.current = progress.totalCaptured;

    const latest = [...progress.sections]
      .reverse()
      .find((section) => section.captured > 0);
    setAnnouncement(
      latest
        ? `${latest.label}: ${latest.captured} of ${latest.total} captured. ${progress.totalCaptured} of ${progress.totalItems} overall.`
        : `${progress.totalCaptured} of ${progress.totalItems} captured.`,
    );
  }, [progress]);

  return (
    <div className={cn("flex flex-col", fill && "min-h-0 flex-1", className)}>
      {showHeader ? (
        <div className="shrink-0 px-4 pb-3 pt-5">
          <Text size="overline" tone="tertiary">
            What I&rsquo;m capturing
          </Text>
          <Text size="body" weight="semibold" className="mt-1.5 tabular-nums">
            {progress.totalCaptured} of {progress.totalItems} captured
          </Text>
        </div>
      ) : null}

      <div
        className={cn(
          "px-1 pb-4",
          fill && "min-h-0 flex-1 overflow-y-auto overscroll-contain",
        )}
      >
        <div className="flex flex-col">
          {progress.sections.map((section) => (
            <CaptureSectionRow key={section.id} section={section} />
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-4 py-3">
        <CaptureProgressBar percent={progress.percent} />
      </div>

      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
