"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import { CaptureProgressBar } from "@/components/interview/CaptureProgressBar";
import { Badge } from "@/components/primitives/Badge";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { formatRelativeTime } from "@/lib/format";
import type { Resumable } from "@/lib/home/resumable";

export interface ResumeCardProps {
  item: Resumable;
  onStartOver: (item: Resumable) => void;
}

/**
 * One paused assessment as a single bar. Home is a glance surface, so this
 * carries only what decides whether to click Continue — company, where you
 * stopped, how far in, how long ago. The detail lives in the assessment itself.
 */
export function ResumeCard({ item, onStartOver }: ResumeCardProps) {
  const processing = item.status === "processing";

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-glass-hairline px-5 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 basis-48 flex-wrap items-center gap-x-3">
        <span className="truncate text-[15px] leading-6 font-semibold text-foreground">
          {item.companyName ?? "No PortCo selected"}
        </span>
        <Badge tone={item.agent === "sales" ? "accent" : "info"} className="shrink-0">
          {item.agent === "sales" ? "Sales" : "Offshoring"}
        </Badge>
        <Text size="body-sm" tone="secondary" className="truncate">
          {processing ? "Analysing" : item.phaseLabel}
        </Text>
      </div>

      {item.total > 0 ? (
        <CaptureProgressBar percent={item.percent} className="w-32 shrink-0" />
      ) : null}

      <Text size="caption" tone="tertiary" className="shrink-0">
        {formatRelativeTime(item.updatedAt)}
      </Text>

      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" href={item.continueHref} trailingIcon={ArrowRight}>
          {processing ? "View" : "Continue"}
        </Button>
        <IconButton
          icon={RotateCcw}
          label={`Start the ${item.agentLabel.toLowerCase()} over`}
          size="sm"
          variant="ghost"
          onClick={() => onStartOver(item)}
        />
      </div>
    </li>
  );
}
