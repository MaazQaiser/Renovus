"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { StageComposer } from "@/components/interview/StageComposer";
import { classificationLabel } from "@/lib/assessment/sales-routing";
import { cn } from "@/lib/cn";
import type { Classification, SalesAssessmentSession } from "@/types/sales-assessment";
import { buildInterimSnapshot } from "@/lib/assessment/sales-report";

const CLASSIFICATIONS: Classification[] = [
  "pipeline-driven",
  "relationship-driven",
  "mixed",
];

export interface GatePanelProps {
  session: SalesAssessmentSession;
  classification: Classification;
  onCorrect: (text: string) => void;
  onOverride: (classification: Classification) => void;
  onAccept: () => void;
}

/**
 * The Phase 1 gate: the interim snapshot shown live, corrections accepted, and
 * the classification the respondent can overrule before the deep dive starts.
 */
export function GatePanel({
  session,
  classification,
  onCorrect,
  onOverride,
  onAccept,
}: GatePanelProps) {
  const [correction, setCorrection] = useState("");
  const snapshot = buildInterimSnapshot(session);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-border bg-surface p-5">
        <Text size="overline" tone="tertiary">
          Interim snapshot
        </Text>
        <dl className="mt-3 flex flex-col gap-2.5">
          {snapshot.lines.map((line) => (
            <div key={line.label} className="flex flex-wrap gap-x-3 gap-y-0.5">
              <dt className="w-40 shrink-0">
                <Text size="body-sm" tone="tertiary">
                  {line.label}
                </Text>
              </dt>
              <dd className="min-w-0 flex-1">
                <Text size="body-sm" weight="medium">
                  {line.value}
                </Text>
              </dd>
            </div>
          ))}
        </dl>

        {snapshot.channels.length > 0 ? (
          <div className="mt-5 border-t border-border-subtle pt-4">
            <Text size="caption" tone="tertiary">
              Channel map
            </Text>
            <ul className="mt-2 flex flex-col gap-1">
              {snapshot.channels.map((row) => (
                <li key={row.channel} className="flex justify-between gap-3">
                  <Text size="body-sm">{row.channel}</Text>
                  <Text size="body-sm" tone="secondary">
                    {row.status}
                    {row.blocker ? ` · ${row.blocker}` : ""}
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section>
        <Text size="caption" tone="secondary">
          I read this as a <b>{classificationLabel(classification).toLowerCase()}</b>{" "}
          business. Change it if that&rsquo;s wrong — your read wins.
        </Text>
        <div className="mt-2 flex flex-wrap gap-2">
          {CLASSIFICATIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={option === classification}
              onClick={() => onOverride(option)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-[13px] font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                option === classification
                  ? "border-accent bg-accent-subtle text-accent"
                  : "border-border bg-surface text-secondary hover:text-foreground",
              )}
            >
              {classificationLabel(option)}
            </button>
          ))}
        </div>
      </section>

      {session.gate.corrections.length > 0 ? (
        <ul className="flex flex-col gap-1.5 rounded-md border border-border-subtle bg-surface-tertiary p-3">
          {session.gate.corrections.map((entry) => (
            <li key={entry}>
              <Text size="body-sm" tone="secondary">
                Noted: {entry}
              </Text>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-3">
        <Text size="caption" tone="tertiary">
          Anything wrong above? Tell me and I&rsquo;ll record the correction.
        </Text>
        <StageComposer
          value={correction}
          onChange={setCorrection}
          onSend={() => {
            onCorrect(correction);
            setCorrection("");
          }}
          sendDisabled={correction.trim().length === 0}
          supportsSpeech={false}
          multiline
        />
      </div>

      <Button size="lg" fullWidth onClick={onAccept}>
        Looks right — continue to the deep dive
      </Button>
    </div>
  );
}
