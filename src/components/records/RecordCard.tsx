"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { formatDateTime } from "@/lib/format";
import type { AssessmentRecord } from "@/types/record";
import { AGENT_LABEL, recordHref } from "./recordMeta";

export interface RecordCardProps {
  record: AssessmentRecord;
  onDelete: (record: AssessmentRecord) => void;
}

export function RecordCard({ record, onDelete }: RecordCardProps) {
  return (
    <li className="group relative flex flex-col rounded-lg border border-border bg-surface p-5 transition-shadow duration-[120ms] hover:border-border-strong hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Badge tone="accent">{AGENT_LABEL[record.agent]}</Badge>
        <IconButton
          icon={Trash2}
          label={`Delete ${record.companyName} record`}
          size="sm"
          variant="ghost"
          className="relative z-10 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          onClick={() => onDelete(record)}
        />
      </div>

      {/* Stretched link so the whole card is the target, but the delete
          button above sits on top of it. */}
      <Link
        href={recordHref(record.id)}
        className="mt-3 before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="text-[17px] font-semibold leading-6 text-foreground">
          {record.companyName}
        </span>
      </Link>

      <Text size="body-sm" tone="secondary" className="mt-1">
        {record.title}
      </Text>
      <Text size="body-sm" tone="tertiary" className="mt-3 line-clamp-2">
        {record.summary}
      </Text>

      {record.metrics.length > 0 ? (
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border-subtle pt-4">
          {record.metrics.map((metric) => (
            <div key={metric.label}>
              <dd className="text-[17px] font-semibold tabular-nums text-foreground">
                {metric.value}
              </dd>
              <dt className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-tertiary">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>
      ) : null}

      <Text size="caption" tone="tertiary" className="mt-4">
        {formatDateTime(record.completedAt)}
      </Text>
    </li>
  );
}
