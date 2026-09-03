"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { Card } from "@/components/primitives/Card";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { SummaryPart } from "@/lib/home/summary";

export interface GreetingBandProps {
  name?: string;
  /** The state of play, one entry per line — see buildHomeSummary. */
  summary: SummaryPart[][];
}

const weekday = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * Time-of-day greeting and today's date. Both are safe to compute at render
 * time because AuthGuard holds this tree behind a spinner until the session
 * hydrates — nothing here is ever server-rendered, so the clock cannot cause a
 * hydration mismatch.
 */
function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function GreetingBand({ name, summary }: GreetingBandProps) {
  const firstName = name?.split(" ")[0];
  const now = new Date();

  return (
    <>
      {/* Mirrors the header pattern on Companies — same pt-8, same h1 size,
          same items-end button row — so the pages start on the same line. */}
      <header className="flex flex-wrap items-end justify-between gap-4 pt-8">
        <div className="min-w-0">
          <Heading level={1} size="h1">
            {greetingFor(now.getHours())}
            {firstName ? `, ${firstName}` : ""}
          </Heading>
          <Text tone="secondary" className="mt-1.5">
            {weekday.format(now)}
          </Text>
        </div>

        <Button href="/agents" trailingIcon={ArrowRight} className="shrink-0">
          New assessment
        </Button>
      </header>

      <Card padding="compact">
        <div className="max-w-[92ch] space-y-1">
          {summary.map((line, lineIndex) => (
            <p key={lineIndex} className="text-[17px] leading-7 text-secondary">
              {line.map((part, index) =>
                part.emphasis ? (
                  <strong
                    key={index}
                    className="text-[19px] font-semibold tabular-nums text-foreground"
                  >
                    {part.text}
                  </strong>
                ) : (
                  <span key={index}>{part.text}</span>
                ),
              )}
            </p>
          ))}
        </div>
      </Card>
    </>
  );
}
