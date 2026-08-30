import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { AgentProcessStep } from "@/types/agent";

export interface AgentStepListProps {
  steps: AgentProcessStep[];
}

export function AgentStepList({ steps }: AgentStepListProps) {
  return (
    <ol className="flex flex-col gap-6">
      {steps.map((step, index) => (
        <li key={step.id} className="flex gap-4">
          <span className="w-8 shrink-0 font-display text-[13px] font-semibold leading-6 text-accent-muted tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <Heading level={3} size="h3">
              {step.title}
            </Heading>
            <Text tone="secondary" className="mt-1">
              {step.description}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}
