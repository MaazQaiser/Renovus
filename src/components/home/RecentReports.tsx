import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { Text } from "@/components/primitives/Text";
import { AGENT_LABEL, recordHref } from "@/components/records/recordMeta";
import { SectionLabel } from "./SectionLabel";
import { formatDate } from "@/lib/format";
import type { AssessmentRecord } from "@/types/record";

/**
 * A read-only digest. Deleting is deliberately absent — home is a summary
 * surface, and destructive actions belong on the company detail page that owns
 * the record.
 */
export function RecentReports({ records }: { records: AssessmentRecord[] }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <SectionLabel>Recent reports</SectionLabel>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 text-[13px] leading-5 font-semibold text-accent hover:text-accent-hover hover:underline"
        >
          All PortCos
          <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
        </Link>
      </div>

      <ul className="mt-3 overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-3xl">
        {records.map((record) => (
          <li key={record.id} className="border-b border-glass-hairline last:border-b-0">
            <Link
              href={recordHref(record.id)}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4 transition-colors duration-[140ms] hover:bg-glass-strong"
            >
              <Text weight="semibold" className="min-w-0 truncate">
                {record.companyName}
              </Text>
              <Badge
                tone={record.agent === "sales" ? "accent" : "info"}
                className="shrink-0"
              >
                {AGENT_LABEL[record.agent]}
              </Badge>
              <Text size="body-sm" tone="tertiary" className="hidden min-w-0 truncate md:block">
                {record.title}
              </Text>
              <Text size="caption" tone="tertiary" className="ml-auto shrink-0">
                {formatDate(record.completedAt)}
              </Text>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
