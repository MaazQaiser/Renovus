"use client";

import { useEffect, useState } from "react";
import { CircleCheck } from "lucide-react";
import { Heading } from "@/components/primitives/Heading";
import { Spinner } from "@/components/primitives/Spinner";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

/**
 * The work between the upload and the questions, and between the questions and
 * the report.
 *
 * The steps are named rather than shown as one anonymous spinner: the point of
 * this screen is that the reader can see the file being taken apart, and knows
 * which pass is running when it pauses.
 */

export interface IntakeProgressProps {
  title: string;
  caption: string;
  steps: string[];
  /** Time across every step. The last one is left running until `onDone`. */
  durationMs?: number;
  onDone: () => void;
}

export function IntakeProgress({
  title,
  caption,
  steps,
  durationMs = 2800,
  onDone,
}: IntakeProgressProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const each = durationMs / steps.length;
    const timers = steps.map((_, index) =>
      window.setTimeout(
        () => (index === steps.length - 1 ? onDone() : setActive(index + 1)),
        each * (index + 1),
      ),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
    // Steps and duration are fixed for the life of one pass; onDone is stable.
  }, [durationMs, steps, onDone]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16">
      <div className="flex w-full max-w-[30rem] flex-col items-center text-center">
        <Spinner
          size="lg"
          tone="accent"
          label={title}
          className="size-8 border-[2.5px]"
        />
        <Heading level={1} size="h2" className="mt-6">
          {title}
        </Heading>
        <Text tone="secondary" className="mt-2 max-w-[42ch]">
          {caption}
        </Text>

        <ul className="mt-7 flex w-full flex-col gap-2 text-left">
          {steps.map((step, index) => {
            const done = index < active;
            const running = index === active;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
                  running
                    ? "border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl"
                    : "border-transparent",
                )}
              >
                {done ? (
                  <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
                ) : running ? (
                  <Spinner size="sm" tone="accent" label="" className="shrink-0" />
                ) : (
                  <span
                    className="size-4 shrink-0 rounded-full border border-border-subtle"
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "text-[13px] leading-5",
                    done
                      ? "text-secondary"
                      : running
                        ? "font-semibold text-foreground"
                        : "text-tertiary",
                  )}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
