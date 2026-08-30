import { cn } from "@/lib/cn";
import type { AgentProgressStep } from "@/types/agent";

export interface AgentProgressProps {
  steps: AgentProgressStep[];
  currentStepId: string;
  completedStepIds?: string[];
  className?: string;
}

export function AgentProgress({
  steps,
  currentStepId,
  completedStepIds = [],
  className,
}: AgentProgressProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <nav aria-label="Workflow progress" className={cn("w-full", className)}>
      <ol className="flex flex-wrap items-center gap-y-2">
        {steps.map((step, index) => {
          const current = step.id === currentStepId;
          const completed = completedStepIds.includes(step.id) || (currentIndex >= 0 && index < currentIndex);
          const stateLabel = current ? "Current step" : completed ? "Completed" : "Upcoming";

          return (
            <li key={step.id} className="flex items-center">
              {index > 0 ? (
                <span
                  className={cn(
                    "mx-2 hidden h-px w-6 sm:mx-3 sm:w-8 md:block",
                    completed || current ? "bg-accent-border" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-2 py-1",
                  current && "bg-accent-subtle",
                )}
              >
                <span
                  className={cn(
                    "font-display text-[13px] font-semibold tabular-nums",
                    current ? "text-accent" : completed ? "text-accent-muted" : "text-tertiary",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "text-[13px] leading-4",
                    current ? "font-semibold text-foreground" : "text-tertiary",
                  )}
                >
                  {step.label}
                  <span className="sr-only"> — {stateLabel}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
