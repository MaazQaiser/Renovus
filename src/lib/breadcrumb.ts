import type { BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import type { AppHref } from "@/lib/routes";

const labels: Record<string, string> = {
  agents: "AI Agents",
  assessment: "Sales function Assessment",
  offshoring: "Offshoring potential assessment",
  operational: "Operational assessment",
  processing: "Analysis",
  results: "Results",
  records: "Records",
};

export function breadcrumbForPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}` as AppHref;
    const last = index === segments.length - 1;
    return {
      // Record ids are opaque; show what the page is instead of the id.
      label: labels[segment] ?? (segment.startsWith("rec-") ? "Saved report" : segment),
      href: last ? undefined : href,
    };
  });
}
