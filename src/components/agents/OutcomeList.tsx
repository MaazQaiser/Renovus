import { Text } from "@/components/primitives/Text";
import type { AgentOutcome } from "@/types/agent";

export interface OutcomeCardProps {
  item: AgentOutcome;
}

export function OutcomeCard({ item }: OutcomeCardProps) {
  return (
    <li className="flex items-start gap-3 border-t border-border-subtle py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-muted" aria-hidden />
      <Text>{item.label}</Text>
    </li>
  );
}

export interface OutcomeListProps {
  items: AgentOutcome[];
}

export function OutcomeList({ items }: OutcomeListProps) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <OutcomeCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
