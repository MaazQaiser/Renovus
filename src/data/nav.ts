import type { LucideIcon } from "lucide-react";
import { Archive, LayoutGrid } from "lucide-react";
import type { AppHref } from "@/lib/routes";

export interface NavItemConfig {
  href: AppHref;
  label: string;
  icon: LucideIcon;
  /**
   * Sub-paths that should NOT mark this item active — needed where one nav
   * href is a prefix of another (/agents vs /agents/records).
   */
  excludePrefixes?: AppHref[];
}

export const primaryNav: NavItemConfig[] = [
  {
    href: "/agents",
    label: "AI Agents",
    icon: LayoutGrid,
    excludePrefixes: ["/agents/records"],
  },
  {
    href: "/agents/records",
    label: "Records",
    icon: Archive,
  },
];

export function isNavItemActive(item: NavItemConfig, pathname: string): boolean {
  const excluded = item.excludePrefixes?.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (excluded) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
