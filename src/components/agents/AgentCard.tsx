import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { AgentIcon } from "./AgentIcon";
import { isAgentLaunchable } from "./AgentStatus";
import type { AgentStatus as AgentStatusValue } from "@/types/agent";
import type { AppHref } from "@/lib/routes";
import { cn } from "@/lib/cn";

export interface AgentCardProps {
  name: string;
  description: string;
  status: AgentStatusValue;
  artSrc?: string;
  icon?: string;
  href: AppHref;
}

export function AgentCard({
  name,
  description,
  status,
  artSrc,
  icon,
  href,
}: AgentCardProps) {
  const launchable = isAgentLaunchable(status);

  const footerLabel = launchable
    ? "Begin assessment"
    : status === "in-progress"
      ? "In progress"
      : status === "coming-soon"
        ? "Coming soon"
        : "Unavailable";

  return (
    <Card
      href={launchable ? href : undefined}
      interactive={launchable}
      padding="none"
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl",
        launchable && "hover:border-border-strong",
        !launchable && "cursor-default",
      )}
      aria-disabled={!launchable || undefined}
    >
      <div className="relative flex min-h-[220px] items-center justify-center px-8 pt-10 pb-4">
        {artSrc ? (
          <Image
            src={artSrc}
            alt=""
            width={220}
            height={220}
            className={cn(
              "h-[180px] w-[180px] object-contain",
              !launchable && "opacity-70",
            )}
            priority
            // The optimizer flattens this art's alpha onto white, which puts a
            // solid square behind it on the glass card. Serve the PNG as-is;
            // it is line art, so optimization buys little anyway.
            unoptimized
          />
        ) : (
          // Agents without hero art still need to fill the art well, so the
          // glyph stands in at the same footprint.
          <AgentIcon
            name={icon}
            size="lg"
            className={cn(
              "size-[180px] bg-transparent text-tertiary [&>svg]:size-16",
              !launchable && "opacity-70",
            )}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-7 pt-2 text-left">
        <Heading level={2} size="h3">
          {name}
        </Heading>
        <Text tone="secondary" className="mt-3 flex-1 text-[14px] leading-6">
          {description}
        </Text>
        <span
          className={cn(
            "mt-6 inline-flex h-8 items-center gap-1.5 self-end rounded-md px-3 text-[13px] font-semibold transition-colors duration-[120ms] ease-[var(--ease-standard)]",
            launchable
              ? "bg-surface text-foreground group-hover:bg-primary group-hover:text-inverse"
              : "text-tertiary",
          )}
        >
          {footerLabel}
          {launchable ? <ArrowRight size={16} strokeWidth={1.75} aria-hidden /> : null}
        </span>
      </div>
    </Card>
  );
}
