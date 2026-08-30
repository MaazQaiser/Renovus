"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { CHANNELS } from "@/data/sales";
import { cn } from "@/lib/cn";
import type { ChannelId, ChannelStatus } from "@/types/sales-assessment";

const STATUSES: { id: ChannelStatus; label: string }[] = [
  { id: "using", label: "Using" },
  { id: "not-using", label: "Not using" },
  { id: "want", label: "Want to" },
];

export interface ChannelMatrixPromptProps {
  onSubmit: (payload: { value: string[]; label: string }) => void;
}

/**
 * CH1 — the channel map. Ten channels, each tri-state. This is the single most
 * load-bearing answer in Phase 1: "using" decides which deep-dive modules run,
 * "want" seeds the CH2 blocker loop.
 */
export function ChannelMatrixPrompt({ onSubmit }: ChannelMatrixPromptProps) {
  const [statuses, setStatuses] = useState<Partial<Record<ChannelId, ChannelStatus>>>({});

  const complete = CHANNELS.every((channel) => statuses[channel.id]);

  const submit = () => {
    const value = CHANNELS.map(
      (channel) => `${channel.id}:${statuses[channel.id] ?? "not-using"}`,
    );
    const using = CHANNELS.filter((channel) => statuses[channel.id] === "using");
    const want = CHANNELS.filter((channel) => statuses[channel.id] === "want");
    const label = [
      using.length ? `Using: ${using.map((c) => c.label).join(", ")}` : "Using: none",
      want.length ? `Want: ${want.map((c) => c.label).join(", ")}` : undefined,
    ]
      .filter(Boolean)
      .join(" · ");

    onSubmit({ value, label });
  };

  return (
    <div className="flex flex-col gap-4">
      <Text size="body-sm" tone="secondary">
        Mark each one — there are ten.
      </Text>

      <ul className="flex flex-col gap-1.5">
        {CHANNELS.map((channel) => {
          const selected = statuses[channel.id];
          return (
            <li
              key={channel.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
            >
              <span className="min-w-0 flex-1 text-[14px] font-medium text-foreground">
                {channel.label}
              </span>

              <div
                role="radiogroup"
                aria-label={channel.label}
                className="flex shrink-0 gap-1"
              >
                {STATUSES.map((status) => {
                  const active = selected === status.id;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() =>
                        setStatuses((current) => ({ ...current, [channel.id]: status.id }))
                      }
                      className={cn(
                        "rounded-sm border px-2.5 py-1 text-[12px] font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                        active
                          ? "border-accent bg-accent text-inverse"
                          : "border-border bg-surface-tertiary text-secondary hover:text-foreground",
                      )}
                    >
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3">
        <Text size="caption" tone="tertiary">
          {CHANNELS.filter((c) => statuses[c.id]).length} of {CHANNELS.length} marked
        </Text>
        <Button size="md" disabled={!complete} onClick={submit}>
          Continue
        </Button>
      </div>
    </div>
  );
}
