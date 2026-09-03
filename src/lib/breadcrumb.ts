import type { BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import { getCompanyById } from "@/lib/companies";
import type { AppHref } from "@/lib/routes";

const labels: Record<string, string> = {
  home: "Home",
  agents: "AI Agents",
  assessment: "Sales function Assessment",
  offshoring: "Offshoring potential assessment",
  operational: "Operational assessment",
  processing: "Analysis",
  results: "Results",
  records: "Records",
  companies: "PortCos",
};

/**
 * Segments that are path structure only, with no page behind them. Saved
 * reports still live under /agents/records/<id>, but the records index was
 * removed when assessments moved onto the PortCo page — so the crumb has to
 * render as plain text rather than a link to nothing.
 */
const NO_PAGE = new Set(["records"]);

export function breadcrumbForPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}` as AppHref;
    const last = index === segments.length - 1;
    return {
      // Ids are opaque: name the record's page, and resolve company slugs to
      // the company's own name.
      label:
        labels[segment] ??
        (segment.startsWith("rec-")
          ? "Saved report"
          : (segments[index - 1] === "companies"
              ? getCompanyById(segment)?.name
              : undefined) ?? segment),
      href: last || NO_PAGE.has(segment) ? undefined : href,
    };
  });
}
