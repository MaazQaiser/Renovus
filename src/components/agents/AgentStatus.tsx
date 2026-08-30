import { Badge } from "@/components/primitives/Badge";
import type { AgentStatus as AgentStatusValue } from "@/types/agent";

const labels: Record<AgentStatusValue, string> = {
  available: "Available",
  beta: "Beta",
  "coming-soon": "Coming soon",
  "in-progress": "In progress",
  maintenance: "Maintenance",
};

const tones: Record<
  AgentStatusValue,
  "success" | "accent" | "neutral" | "warning" | "info"
> = {
  available: "success",
  beta: "accent",
  "coming-soon": "neutral",
  "in-progress": "warning",
  maintenance: "warning",
};

export interface AgentStatusProps {
  status: AgentStatusValue;
}

export function AgentStatus({ status }: AgentStatusProps) {
  return (
    <Badge tone={tones[status]} variant="subtle" dot>
      {labels[status]}
    </Badge>
  );
}

export function isAgentLaunchable(status: AgentStatusValue): boolean {
  return status === "available" || status === "beta";
}
