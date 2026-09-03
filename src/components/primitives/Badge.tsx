import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

const tones = {
  neutral: {
    subtle: "bg-surface-tertiary text-secondary",
    solid: "bg-primary text-inverse",
    outline: "border border-border text-secondary",
  },
  accent: {
    subtle: "bg-accent-subtle text-accent",
    solid: "bg-accent text-inverse",
    outline: "border border-accent-border text-accent",
  },
  success: {
    subtle: "bg-success-subtle text-success",
    solid: "bg-success text-inverse",
    outline: "border border-success-border text-success",
  },
  warning: {
    subtle: "bg-warning-subtle text-warning",
    solid: "bg-warning text-inverse",
    outline: "border border-warning-border text-warning",
  },
  error: {
    subtle: "bg-error-subtle text-error",
    solid: "bg-error text-inverse",
    outline: "border border-error-border text-error",
  },
  info: {
    subtle: "bg-info-subtle text-info",
    solid: "bg-info text-inverse",
    outline: "border border-info-border text-info",
  },
} as const;

export interface BadgeProps {
  tone?: keyof typeof tones;
  variant?: "subtle" | "solid" | "outline";
  size?: "sm" | "md";
  icon?: LucideIcon;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  tone = "neutral",
  variant = "subtle",
  size = "sm",
  icon: Icon,
  dot,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        // nowrap is load-bearing: the pill is a fixed h-5/h-6, so a label that
        // wraps paints its second line outside the background.
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm font-semibold uppercase tracking-[0.06em]",
        size === "sm" ? "h-5 px-1.5 text-[11px] leading-4" : "h-6 px-2 text-xs leading-4",
        tones[tone][variant],
        className,
      )}
    >
      {dot ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden />
      ) : null}
      {Icon ? <Icon size={12} strokeWidth={1.75} aria-hidden /> : null}
      {children}
    </span>
  );
}
