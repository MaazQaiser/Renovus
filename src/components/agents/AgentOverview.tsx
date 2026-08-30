import { AgentHeader } from "./AgentHeader";
import { AgentStepList } from "./AgentStepList";
import { OutcomeList } from "./OutcomeList";
import { InProgressPanel } from "./InProgressPanel";
import { Button } from "@/components/primitives/Button";
import { ButtonGroup } from "@/components/primitives/ButtonGroup";
import { ContentSection } from "@/components/layout/ContentSection";
import { Text } from "@/components/primitives/Text";
import type { Agent } from "@/types/agent";
import type { AppHref } from "@/lib/routes";

export interface AgentOverviewProps {
  agent: Agent;
  startHref: AppHref;
  backHref: AppHref;
}

export function AgentOverview({ agent, startHref, backHref }: AgentOverviewProps) {
  const overview = agent.overview;
  if (!overview) return null;

  return (
    <div>
      <AgentHeader
        icon={agent.icon}
        eyebrow={agent.name}
        title={overview.heading}
        description={overview.description}
        status={agent.status}
        actions={
          <ButtonGroup align="start" stackOn="sm" reverseOnStack>
            <Button variant="ghost" href={backHref}>
              {overview.backLabel}
            </Button>
            <Button size="lg" href={startHref}>
              {overview.startLabel}
            </Button>
          </ButtonGroup>
        }
      />

      <InProgressPanel agent={agent} continueHref={startHref} />

      <ContentSection title={overview.aboutTitle}>
        <Text tone="secondary" className="max-w-[65ch]">
          {overview.about}
        </Text>
      </ContentSection>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <ContentSection title={overview.processTitle} className="mt-0">
          <AgentStepList steps={overview.processSteps} />
        </ContentSection>
        <ContentSection title={overview.outcomesTitle} className="mt-0">
          <OutcomeList items={overview.outcomes} />
        </ContentSection>
      </div>
    </div>
  );
}
