import { LayoutGrid } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/primitives/Skeleton";
import { Card } from "@/components/primitives/Card";
import { AgentCard } from "./AgentCard";
import type { Agent } from "@/types/agent";

export interface AgentGridProps {
  agents: Agent[];
  loading?: boolean;
}

function AgentCardSkeleton() {
  return (
    <Card className="flex h-full flex-col" padding="none">
      <Skeleton variant="rect" className="mx-auto mt-10 size-[180px] rounded-xl" />
      <div className="px-6 pb-7 pt-4">
        <Skeleton variant="rect" className="h-6 w-40" />
        <Skeleton variant="text" lines={3} className="mt-3" />
        <Skeleton variant="rect" className="mt-6 h-4 w-24" />
      </div>
    </Card>
  );
}

export function AgentGrid({ agents, loading = false }: AgentGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
        aria-busy="true"
        aria-label="Loading agents"
      >
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No agents available"
        description="No agents are configured for this workspace. Contact your Renovus administrator if you expected to see one."
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <li key={agent.id} className="h-full">
          <AgentCard
            name={agent.name}
            description={agent.description}
            status={agent.status}
            artSrc={agent.artSrc}
            icon={agent.icon}
            href={agent.route}
          />
        </li>
      ))}
    </ul>
  );
}
