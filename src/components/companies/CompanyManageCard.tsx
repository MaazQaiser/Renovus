"use client";

import Link from "next/link";
import { ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Heading } from "@/components/primitives/Heading";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { formatAssessmentCount } from "@/lib/format";
import type { CompanyCoverage } from "@/lib/coverage";
import { CompanyAvatar } from "./CompanyAvatar";
import { CoverageMeter, DepartmentBadges } from "./CoverageIndicators";
import { StageBadge } from "./StageBadge";
import { companyHref } from "./companyMeta";
import type { Company } from "@/types/company";

export interface CompanyManageCardProps {
  company: Company;
  /** Saved assessments naming this company, across every agent. */
  assessmentCount: number;
  coverage: CompanyCoverage;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

/**
 * The card-view tile. CompanyCard is deliberately left alone — it carries radio
 * semantics for the assessment picker, which does not want row actions.
 */
export function CompanyManageCard({
  company,
  assessmentCount,
  coverage,
  onEdit,
  onDelete,
}: CompanyManageCardProps) {
  return (
    <Card padding="compact" className="group relative flex h-full flex-col">
      <div className="flex items-start gap-3">
        <CompanyAvatar company={company} size="lg" />

        <div className="min-w-0 flex-1">
          <Link
            href={companyHref(company.id)}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Heading level={3} size="h3">
              {company.name}
            </Heading>
          </Link>
          <Text size="caption" tone="tertiary" className="mt-1">
            {company.sector}
          </Text>
        </div>

        <div className="relative z-10 flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
          <IconButton
            icon={Pencil}
            label={`Edit ${company.name}`}
            size="sm"
            variant="ghost"
            onClick={() => onEdit(company)}
          />
          <IconButton
            icon={Trash2}
            label={`Delete ${company.name}`}
            size="sm"
            variant="ghost"
            onClick={() => onDelete(company)}
          />
        </div>
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
        <StageBadge stage={company.stage} />
        <span className="flex items-center gap-1.5 text-[12px] text-tertiary">
          <ClipboardCheck className="size-3.5 shrink-0" aria-hidden />
          {formatAssessmentCount(assessmentCount)}
        </span>
      </div>

      <div className="relative z-10 mt-4 border-t border-border-subtle pt-3">
        <CoverageMeter coverage={coverage} withCaption />
        <DepartmentBadges coverage={coverage} className="mt-2.5" />
      </div>
    </Card>
  );
}
