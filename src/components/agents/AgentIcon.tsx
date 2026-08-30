import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { getLucideIcon } from "@/lib/icons";

const sizes = {
  sm: { box: "size-8", icon: 16 },
  md: { box: "size-10", icon: 20 },
  lg: { box: "size-12", icon: 24 },
} as const;

export interface AgentIconProps {
  name?: string;
  icon?: LucideIcon;
  size?: keyof typeof sizes;
  className?: string;
}

export function AgentIcon({ name, icon, size = "md", className }: AgentIconProps) {
  const scale = sizes[size];
  const glyph = icon ?? getLucideIcon(name ?? "");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-accent-subtle text-accent",
        scale.box,
        className,
      )}
      aria-hidden
    >
      {createElement(glyph, { size: scale.icon, strokeWidth: 1.75 })}
    </span>
  );
}
