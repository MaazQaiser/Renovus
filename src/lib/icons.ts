import type { LucideIcon } from "lucide-react";
import { Activity, ClipboardList, Globe, LayoutGrid, Workflow } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "clipboard-list": ClipboardList,
  globe: Globe,
  activity: Activity,
  workflow: Workflow,
};

export function getLucideIcon(name: string): LucideIcon {
  return iconMap[name] ?? LayoutGrid;
}
