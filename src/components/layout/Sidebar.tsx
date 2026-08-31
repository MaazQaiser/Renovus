"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NavItem } from "@/components/navigation/NavItem";
import { IconButton } from "@/components/primitives/IconButton";
import { isNavItemActive, type NavItemConfig } from "@/data/nav";
import { cn } from "@/lib/cn";

export interface SidebarProps {
  items: NavItemConfig[];
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  footer?: React.ReactNode;
  className?: string;
}

export function Sidebar({
  items,
  collapsed = false,
  onCollapsedChange,
  footer,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col bg-surface-inverse text-inverse transition-[width] duration-[120ms] ease-[var(--ease-standard)]",
        collapsed ? "w-[72px]" : "w-[264px]",
        className,
      )}
      aria-expanded={!collapsed}
    >
      <div
        className={cn(
          "flex shrink-0 border-b border-border-inverse",
          collapsed
            ? "flex-col items-center gap-2 px-2 py-3"
            : "h-16 items-center justify-between px-3",
        )}
      >
        {collapsed ? (
          <Logo variant="mark" tone="inverse" size="sm" priority />
        ) : (
          <Logo variant="lockup" tone="inverse" size="sm" priority />
        )}
        {onCollapsedChange ? (
          <IconButton
            icon={collapsed ? PanelLeftOpen : PanelLeftClose}
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            size="sm"
            className="text-inverse/72 hover:bg-white/8 hover:text-inverse"
            aria-expanded={!collapsed}
            aria-controls="sidebar-nav"
            onClick={() => onCollapsedChange(!collapsed)}
          />
        ) : null}
      </div>
      <nav
        id="sidebar-nav"
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
        aria-label="Primary"
      >
        {items.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            active={isNavItemActive(item, pathname)}
          />
        ))}
      </nav>
      {footer ? (
        <div className="shrink-0 border-t border-border-inverse p-3">{footer}</div>
      ) : null}
    </aside>
  );
}
