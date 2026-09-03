"use client";

import { Badge } from "@/components/primitives/Badge";
import { Tooltip } from "@/components/primitives/Tooltip";
import type { CompanyStage } from "@/types/company";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "error" | "info";

// Cool -> warm as the work progresses, so a scan of the column reads as motion.
const STAGE_TONE: Record<CompanyStage, BadgeTone> = {
  "Not started": "neutral",
  Assessing: "warning",
  Baseline: "info",
  "Roadmap defined": "accent",
  Implementation: "success",
};

const STAGE_HINT: Record<CompanyStage, string> = {
  "Not started": "No assessment has been run for this PortCo yet.",
  Assessing: "An assessment is under way — answers are still being captured.",
  Baseline: "The function has been baselined and the report is saved.",
  "Roadmap defined": "Opportunities have been prioritised into an agreed plan.",
  Implementation: "The roadmap is being delivered.",
};

export interface StageBadgeProps {
  stage?: CompanyStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  if (!stage) {
    return (
      <Tooltip content="No stage set for this PortCo yet." className={className}>
        <span tabIndex={0} className="cursor-default whitespace-nowrap focus-visible:outline-none">
          <Badge tone="neutral" variant="outline">
            No stage
          </Badge>
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={`${stage} — ${STAGE_HINT[stage]}`} className={className}>
      <span tabIndex={0} className="cursor-default whitespace-nowrap focus-visible:outline-none">
        <Badge tone={STAGE_TONE[stage]} variant="subtle">
          {stage}
        </Badge>
      </span>
    </Tooltip>
  );
}
