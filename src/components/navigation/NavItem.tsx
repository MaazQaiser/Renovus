"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

export interface NavItemProps {
  href: AppHref;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
  collapsed?: boolean;
  disabled?: boolean;
}

export function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
  collapsed,
  disabled,
}: NavItemProps) {
  const classes = cn(
    "flex items-center gap-3 rounded-md px-3 h-10 text-[13px] font-semibold transition-colors duration-[120ms]",
    collapsed && "justify-center px-0",
    disabled && "pointer-events-none opacity-40",
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

  if (disabled) {
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
