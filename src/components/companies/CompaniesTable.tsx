"use client";

import Link from "next/link";
import { ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";
import { IconButton } from "@/components/primitives/IconButton";
import { Tooltip } from "@/components/primitives/Tooltip";
import { cn } from "@/lib/cn";
import type { CompanyCoverage } from "@/lib/coverage";
import { CompanyAvatar } from "./CompanyAvatar";
import { CoverageMeter, DepartmentBadges } from "./CoverageIndicators";
import { StageBadge } from "./StageBadge";
import { companyHref } from "./companyMeta";
import type { Company } from "@/types/company";

export interface CompanyTableItem {
  company: Company;
  assessmentCount: number;
  coverage: CompanyCoverage;
}

export interface CompaniesTableProps {
  rows: CompanyTableItem[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

/** Columns drop from the right as the viewport narrows; company never drops. */
const COLUMNS = [
  { key: "company", label: "PortCo", className: "" },
  { key: "stage", label: "Stage", className: "hidden sm:table-cell" },
  { key: "industry", label: "Industry", className: "hidden lg:table-cell" },
  { key: "departments", label: "Departments", className: "hidden md:table-cell" },
  { key: "coverage", label: "Coverage", className: "" },
  {
    key: "assessments",
    label: "Assessments",
    className: "hidden xl:table-cell text-right",
  },
] as const;

const CELL = "px-4 py-3 align-middle";

export function CompaniesTable({ rows, onEdit, onDelete }: CompaniesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">
          Portfolio companies with their stage, industry and department coverage
        </caption>
        <thead>
          <tr className="border-b border-border-strong">
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  CELL,
                  "py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary",
                  column.className,
                )}
              >
                {column.label}
              </th>
            ))}
            <th scope="col" className={cn(CELL, "w-20")}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map(({ company, assessmentCount, coverage }) => (
            <tr
              key={company.id}
              className="group border-b border-border-subtle last:border-b-0 hover:bg-glass-strong"
            >
              <td className={cn(CELL, "min-w-[220px]")}>
                <div className="flex items-center gap-3">
                  <CompanyAvatar company={company} size="sm" />
                  <Link
                    href={companyHref(company.id)}
                    className="text-[14.5px] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {company.name}
                  </Link>
                </div>
              </td>

              <td className={cn(CELL, "hidden whitespace-nowrap sm:table-cell")}>
                <StageBadge stage={company.stage} />
              </td>

              <td className={cn(CELL, "hidden lg:table-cell")}>
                <Tooltip content={`Industry — ${company.sector}`}>
                  <span tabIndex={0} className="cursor-default focus-visible:outline-none">
                    <Badge tone="accent">{company.sector}</Badge>
                  </span>
                </Tooltip>
              </td>

              <td className={cn(CELL, "hidden w-[190px] md:table-cell")}>
                <DepartmentBadges coverage={coverage} />
              </td>

              <td className={cn(CELL, "w-40")}>
                <CoverageMeter coverage={coverage} />
              </td>

              <td className={cn(CELL, "hidden xl:table-cell")}>
                <span className="flex items-center justify-end gap-1.5 whitespace-nowrap text-[12.5px] tabular-nums text-secondary">
                  <ClipboardCheck className="size-3.5 shrink-0 text-tertiary" aria-hidden />
                  {assessmentCount}
                </span>
              </td>

              <td className={cn(CELL, "w-20")}>
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
