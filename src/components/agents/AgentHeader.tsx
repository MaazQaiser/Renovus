import { AgentIcon } from "./AgentIcon";
import { AgentStatus } from "./AgentStatus";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { AgentStatus as AgentStatusValue } from "@/types/agent";
import { cn } from "@/lib/cn";

export interface AgentHeaderProps {
  icon: string;
  eyebrow: string;
  title: string;
  description?: string;
  status?: AgentStatusValue;
  actions?: React.ReactNode;
  className?: string;
}

export function AgentHeader({
  icon,
  eyebrow,
  title,
  description,
  status,
  actions,
  className,
}: AgentHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-lg border border-border bg-surface p-6 md:p-8",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <AgentIcon name={icon} size="lg" />
        {status ? <AgentStatus status={status} /> : null}
      </div>
      <Text size="overline" tone="secondary" className="mt-5">
        {eyebrow}
      </Text>
      <Heading level={1} size="h1" className="mt-2">
        {title}
      </Heading>
      {description ? (
        <Text tone="secondary" className="mt-3 max-w-[65ch]">
          {description}
        </Text>
      ) : null}
      {actions ? <div className="mt-8">{actions}</div> : null}
    </header>
  );
}
