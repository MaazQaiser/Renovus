"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";
import type { CaptureSection } from "@/lib/interview/capture";

export interface CaptureSectionRowProps {
  section: CaptureSection;
}

export function CaptureSectionRow({ section }: CaptureSectionRowProps) {
  const triggerId = useId();
  const panelId = useId();
  // Openness follows the interview by default; a manual toggle overrides it
  // until the section's status changes again.
  const [override, setOverride] = useState<boolean | null>(null);
  const lastStatus = useRef(section.status);

  useEffect(() => {
    if (lastStatus.current === section.status) return;
    lastStatus.current = section.status;
    setOverride(null);
  }, [section.status]);

  const open = override ?? section.status !== "waiting";

  const badgeTone =
    section.status === "done" ? "success" : section.status === "active" ? "accent" : "neutral";

  return (
    <div
      className={cn(
        // A hairline under each row, rather than a panel fill or a left bar.
        "border-b border-slate-300 py-1 last:border-b-0",
      )}
    >
      <button
        type="button"
        id={triggerId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOverride(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {section.status === "done" ? (
          <Check size={14} strokeWidth={2.25} className="shrink-0 text-success" aria-hidden />
        ) : null}
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px] leading-5 font-semibold",
            section.status === "waiting" ? "text-tertiary" : "text-foreground",
          )}
        >
          {section.label}
        </span>
        {section.total > 0 ? (
          <Badge tone={badgeTone} className="shrink-0 tabular-nums">
            {section.captured} / {section.total}
          </Badge>
        ) : null}
        <ChevronDown
          size={14}
          strokeWidth={2}
          aria-hidden
          className={cn(
            "shrink-0 text-tertiary transition-transform duration-150",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>

      {open ? (
        <div id={panelId} role="region" aria-labelledby={triggerId} className="px-3 pb-2 pl-5">
          {section.items.length === 0 ? (
            <Text size="body-sm" tone="tertiary" className="italic">
              {section.placeholder ?? "Waiting for answers…"}
            </Text>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {section.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5">
                  <Text size="caption" tone="tertiary" className="line-clamp-2">
                    {item.label}
                  </Text>
                  <Text size="body-sm" weight="medium" className="line-clamp-3">
                    {item.value}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
