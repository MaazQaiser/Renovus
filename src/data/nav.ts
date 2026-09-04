import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  House,
  LayoutGrid,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { AppHref } from "@/lib/routes";

export interface NavItemConfig {
  /** Omitted on placeholders — a disabled item renders as a span, not a link. */
  href?: AppHref;
  label: string;
  icon: LucideIcon;
  /** Short trailing hint shown after the label. */
  badge?: string;
  disabled?: boolean;
  /** Dimmed like a placeholder, but interactive. */
  ghost?: boolean;
  /** A behaviour rather than a destination. See Sidebar's onAction. */
  action?: "reset";
  /**
   * Sub-paths that should NOT mark this item active — needed where one nav
   * href is a prefix of another (/agents vs /agents/records).
   */
  excludePrefixes?: AppHref[];
}

export const primaryNav: NavItemConfig[] = [
  {
    href: "/home",
    label: "Home",
    icon: House,
  },
  {
    href: "/agents",
    label: "AI Agents",
    icon: LayoutGrid,
  },
  {
    href: "/companies",
    label: "PortCos",
    icon: Building2,
  },
  // No pages behind these yet. They render as dimmed, non-interactive rows
  // rather than links to nowhere, so the nav shows the shape of the product
  // without promising a destination.
  {
    label: "Roles management",
    icon: ShieldCheck,
    disabled: true,
  },
  {
    label: "Knowledge base",
    icon: BookOpen,
    disabled: true,
  },
];

/**
 * Pinned to the foot of the sidebar, above the user menu. Settings has no page
 * yet, so it doubles as the demo reset: double-clicking it clears this device's
 * data. Deliberately obscure — it reads as a dimmed placeholder, and the
 * gesture is confirmed before anything is deleted.
 */
export const secondaryNav: NavItemConfig[] = [
  {
    label: "Settings",
    icon: Settings,
    ghost: true,
    action: "reset",
  },
];

export function isNavItemActive(item: NavItemConfig, pathname: string): boolean {
  if (!item.href) return false;

  const excluded = item.excludePrefixes?.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (excluded) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
