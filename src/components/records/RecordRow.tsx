"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { formatDateTime } from "@/lib/format";
import type { AssessmentRecord } from "@/types/record";
import { AGENT_LABEL, recordHref } from "./recordMeta";

export interface RecordRowProps {
  record: AssessmentRecord;
  onDelete: (record: AssessmentRecord) => void;
}

export function RecordRow({ record, onDelete }: RecordRowProps) {
  return (
    <li className="group relative flex items-center gap-4 border-b border-border-subtle px-4 py-3.5 last:border-b-0 hover:bg-glass-strong">
      <div className="min-w-0 flex-1">
        <Link
          href={recordHref(record.id)}
          className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <span className="text-[15px] font-semibold text-foreground">
            {record.companyName}
          </span>
        </Link>
        <Text size="caption" tone="tertiary" className="mt-0.5 truncate">
          {record.title}
        </Text>
      </div>

      <div className="hidden shrink-0 md:block">
        <Badge tone="accent">{AGENT_LABEL[record.agent]}</Badge>
      </div>

      <dl className="hidden shrink-0 gap-6 lg:flex">
        {record.metrics.slice(0, 2).map((metric) => (
          <div key={metric.label} className="text-right">
            <dd className="text-[14px] font-semibold tabular-nums text-foreground">
              {metric.value}
            </dd>
            <dt className="text-[11px] uppercase tracking-[0.08em] text-tertiary">
              {metric.label}
            </dt>
          </div>
        ))}
      </dl>

      <Text size="caption" tone="tertiary" className="hidden w-40 shrink-0 text-right sm:block">
        {formatDateTime(record.completedAt)}
      </Text>

      <IconButton
        icon={Trash2}
        label={`Delete ${record.companyName} record`}
        size="sm"
        variant="ghost"
        className="relative z-10 shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        onClick={() => onDelete(record)}
      />
    </li>
  );
}
