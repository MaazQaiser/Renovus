"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

export interface NavItemProps {
  /** Absent on placeholders, which render as a span. */
  href?: AppHref;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
  collapsed?: boolean;
  disabled?: boolean;
  /** Dimmed like a disabled item, but still interactive. */
  ghost?: boolean;
  onDoubleClick?: () => void;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
  collapsed,
  disabled,
  ghost,
  onDoubleClick,
}: NavItemProps) {
  const classes = cn(
    "flex items-center gap-3 rounded-md px-3 h-10 text-[13px] font-semibold transition-colors duration-[120ms]",
    collapsed && "justify-center px-0",
    disabled && "pointer-events-none opacity-40",
    ghost && "opacity-40 hover:opacity-100",
    active
      ? "bg-white/8 text-inverse"
      : "text-inverse/72 hover:bg-white/6 hover:text-inverse",
  );

  const content = (
    <>
      <Icon size={20} strokeWidth={1.75} aria-hidden />
      {collapsed ? null : <span className="flex-1 truncate">{label}</span>}
      {badge && !collapsed ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-accent-muted">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (onDoubleClick) {
    return (
      <button
        type="button"
        className={cn(classes, "w-full text-left")}
        title={`${label} — double-click to reset local data`}
        onDoubleClick={onDoubleClick}
      >
        {content}
      </button>
    );
  }

  if (disabled || !href) {
    return (
      <span className={classes} title={label}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      {content}
    </Link>
  );
}
