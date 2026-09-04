import type { BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import { companyHref } from "@/components/companies/companyMeta";
import { getCompanyById } from "@/lib/companies";
import { getDepartmentById } from "@/data/departments";
import type { AppHref } from "@/lib/routes";
import type { AssessmentRecord } from "@/types/record";

const labels: Record<string, string> = {
  home: "Home",
  agents: "AI Agents",
  assessment: "Sales function Assessment",
  offshoring: "Offshoring potential assessment",
  operational: "Operational assessment",
  intake: "From an export",
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

/**
 * A saved report's trail runs through its PortCo, not the agent that produced
 * it: PortCos → the company → the report. The URL still lives under /agents
 * for deep-link stability, so the trail cannot be read off the path.
 *
 * Returns undefined until the record is known — during hydration the caller's
 * store snapshot is empty, and the path-based trail stands in.
 */
function recordTrail(
  recordId: string,
  records: AssessmentRecord[],
): BreadcrumbItem[] | undefined {
  const record = records.find((entry) => entry.id === recordId);
  if (!record) return undefined;

  const company = record.companyId ? getCompanyById(record.companyId) : undefined;

  return [
    { label: labels.companies, href: "/companies" as AppHref },
    {
      label: company?.name ?? record.companyName,
      href: company ? companyHref(company.id) : undefined,
    },
    { label: record.title },
  ];
}

export function breadcrumbForPath(
  pathname: string,
  records: AssessmentRecord[] = [],
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [];

  const last = segments[segments.length - 1];
  if (last?.startsWith("rec-")) {
    const trail = recordTrail(last, records);
    if (trail) return trail;
  }

  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}` as AppHref;
    const isLast = index === segments.length - 1;
    return {
      // Ids are opaque, so resolve the ones we can name: a saved report, a
      // company slug, and a department slug nested under one.
      label:
        labels[segment] ??
        (segment.startsWith("rec-")
          ? "Saved report"
          : (segments[index - 1] === "companies"
              ? getCompanyById(segment)?.name
              : segments[index - 2] === "companies"
                ? getDepartmentById(segment)?.name
                : undefined) ?? segment),
      href: isLast || NO_PAGE.has(segment) ? undefined : href,
    };
  });
}
