import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start rounded-lg border border-dashed border-border bg-surface px-6 py-10",
        size === "sm" && "py-8",
        className,
      )}
    >
      {Icon ? (
        <Icon size={32} strokeWidth={1.75} className="text-accent-muted" aria-hidden />
      ) : null}
      <Heading level={2} size="h3" className={cn(Icon && "mt-4")}>
        {title}
      </Heading>
      {description ? (
        <Text tone="secondary" className="mt-2 max-w-[65ch]">
          {description}
        </Text>
      ) : null}
      {action || secondaryAction ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}
