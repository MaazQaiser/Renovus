"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Archive,
  ArrowRight,
  Building2,
  CircleDashed,
  CircleCheck,
  CircleSlash,
  FileText,
  Pencil,
} from "lucide-react";
import { getAgentById } from "@/data/agents";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { RecordRow } from "@/components/records/RecordRow";
import { recordHref } from "@/components/records/recordMeta";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { Tooltip } from "@/components/primitives/Tooltip";
import { BackButton } from "@/components/navigation/BackButton";
import {
  getServerCompanies,
  listCompanies,
  subscribeToCompanies,
  updateCompany,
  type CompanyInput,
} from "@/lib/companies";
import {
  companyCoverage,
  companyRecords,
  crossDepartmentCount,
  crossDepartmentCoverage,
  STATUS_LABEL,
  type CoverageStatus,
  type CrossDepartmentCoverage,
} from "@/lib/coverage";
import type { AskAgent } from "@/lib/home/ask";
import {
  deleteRecord,
  getServerRecords,
  listRecords,
  subscribeToRecords,
} from "@/lib/records";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import type { AssessmentRecord } from "@/types/record";
import { CompanyAvatar } from "./CompanyAvatar";
import { CompanyFormDrawer } from "./CompanyFormDrawer";
import { CoverageMeter } from "./CoverageIndicators";
import { DepartmentCard } from "./DepartmentCard";
import { StageBadge } from "./StageBadge";
import { useAssessmentStart } from "./useAssessmentStart";

const STATUS_ICON: Record<CoverageStatus, typeof CircleCheck> = {
  covered: CircleCheck,
  "not-assessed": CircleDashed,
  "no-agent": CircleSlash,
};

const STATUS_TONE: Record<CoverageStatus, string> = {
  covered: "text-success",
  "not-assessed": "text-warning",
  "no-agent": "text-disabled",
};

/** The offshoring line is never "no-agent", and it counts toward no department. */
const CROSS_EXPLAINER: Record<"covered" | "not-assessed", string> = {
  covered: "A saved workforce sourcing assessment exists for this PortCo.",
  "not-assessed": "The offshoring agent is ready, but it has never run for this PortCo.",
};

/**
 * One assessable line — a department, or the cross-department offshoring
 * assessment. Both carry the same right-hand actions: open the report once
 * something is saved, or start the agent that covers it.
 */
function CoverageLine({
  name,
  description,
  status,
  assessmentCount,
  lastAssessedAt,
  latestRecordId,
  reportUrl,
  explainer,
  agent,
  nested = false,
  onAssess,
}: {
  name: string;
  description: string;
  status: CoverageStatus;
  assessmentCount: number;
  lastAssessedAt?: string;
  latestRecordId?: string;
  /** A prepared report served from /public. Takes precedence over the record. */
  reportUrl?: string;
  explainer: string;
  /** Omitted where no agent covers this line, which hides the Assess action. */
  agent?: AskAgent;
  /** A follow-on step: indented under its department and visually quieter. */
  nested?: boolean;
  onAssess: (agent: AskAgent) => void;
}) {
  const Icon = STATUS_ICON[status];

  return (
    <li
      className={cn(
        "flex flex-wrap items-start gap-x-4 gap-y-3 border-b border-border-subtle px-4 py-4 last:border-b-0",
        nested && "bg-glass-quiet py-3 pl-12",
      )}
    >
      <Tooltip content={explainer}>
        <span tabIndex={0} className="cursor-default focus-visible:outline-none">
          <Icon className={cn("size-5 shrink-0", STATUS_TONE[status])} aria-hidden />
          <span className="sr-only">{STATUS_LABEL[status]}</span>
        </span>
      </Tooltip>

      <div className="min-w-0 flex-1 basis-48">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "font-semibold text-foreground",
              nested ? "text-[13.5px]" : "text-[15px]",
            )}
          >
            {name}
          </span>
          {status === "covered" ? (
            <Badge tone="success" variant="subtle">
              {STATUS_LABEL[status]}
            </Badge>
          ) : status === "not-assessed" ? (
            <Badge tone="warning" variant="subtle">
              {STATUS_LABEL[status]}
            </Badge>
          ) : (
            <Badge tone="neutral" variant="outline">
              {STATUS_LABEL[status]}
            </Badge>
          )}
        </div>

        <Text size="body-sm" tone="secondary" className="mt-1">
          {description}
        </Text>

        <Text size="caption" tone="tertiary" className="mt-1.5">
          {status === "covered"
            ? `${assessmentCount} assessment${assessmentCount === 1 ? "" : "s"}${
                lastAssessedAt ? ` · last ${formatDate(lastAssessedAt)}` : ""
              }`
            : explainer}
        </Text>
      </div>

      {/* Narrow screens drop the actions onto their own line, indented past the
          status icon, rather than crushing the description to a few words. */}
      <div className="flex w-full shrink-0 items-center gap-2 pl-9 sm:w-auto sm:pl-0">
        {reportUrl ? (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={FileText}
            externalHref={reportUrl}
          >
            View report
          </Button>
        ) : latestRecordId ? (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={FileText}
            href={recordHref(latestRecordId)}
          >
            View report
          </Button>
        ) : null}

        {agent ? (
          <Button
            variant={status === "covered" ? "ghost" : "secondary"}
            size="sm"
            trailingIcon={ArrowRight}
            onClick={() => onAssess(agent)}
          >
            {status === "covered" ? "Re-assess" : "Assess"}
          </Button>
        ) : null}
      </div>
    </li>
  );
}

/**
 * The prepared workforce sourcing report. Served through a route that swaps the
 * PortCo's name into the sample document; it brings its own <head>, fonts and
 * tab script, so it opens in a new tab rather than inside the app shell.
 */
function workforceSourcingReportUrl(portcoName: string): string {
  return `/reports/offshoring?portco=${encodeURIComponent(portcoName)}`;
}

export interface CompanyDetailProps {
  companyId: string;
}

export function CompanyDetail({ companyId }: CompanyDetailProps) {
  const companies = useSyncExternalStore(
    subscribeToCompanies,
    listCompanies,
    getServerCompanies,
  );
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);

  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AssessmentRecord | undefined>();

  const company = companies.find((item) => item.id === companyId);
  const { start, overlays } = useAssessmentStart(company);

  const own = useMemo(
    () => (company ? companyRecords(company, records) : []),
    [company, records],
  );

  const coverage = useMemo(
    () => (company ? companyCoverage(company, records) : undefined),
    [company, records],
  );
  const crossCount = useMemo(
    () => (company ? crossDepartmentCount(company, records) : 0),
    [company, records],
  );
  const cross = useMemo(
    () =>
      company
        ? crossDepartmentCoverage(company, records)
        : ({ status: "not-assessed", assessmentCount: 0 } as CrossDepartmentCoverage),
    [company, records],
  );

  if (!company || !coverage) {
    return (
      <div className="flex flex-col gap-6">
        <div className="self-start"><BackButton href="/companies" label="All PortCos" /></div>
        <EmptyState
          icon={Building2}
          title="PortCo not found"
          description="This PortCo may have been deleted. Pick another from the list."
          action={
            <Button variant="primary" href="/companies">
              Back to PortCos
            </Button>
          }
        />
      </div>
    );
  }

  function handleSubmit(input: CompanyInput) {
    updateCompany(company!.id, input);
  }


  return (
    <div className="flex flex-col gap-6">
      <div className="self-start"><BackButton href="/companies" label="All PortCos" /></div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <CompanyAvatar company={company} size="lg" />
          <div className="min-w-0">
            <Heading level={1} size="h1">
              {company.name}
            </Heading>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Tooltip content={`Industry — ${company.sector}`}>
                <span tabIndex={0} className="cursor-default focus-visible:outline-none">
                  <Badge tone="accent">{company.sector}</Badge>
                </span>
              </Tooltip>
              <StageBadge stage={company.stage} />
            </div>
          </div>
        </div>

        <Button variant="secondary" leadingIcon={Pencil} onClick={() => setFormOpen(true)}>
          Edit company
        </Button>
      </header>

      {/* One row: figure, bar, then the breakdown. The meter drops its own
          percentage so the number isn't printed twice. */}
      <section className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-glass-border bg-glass px-4 py-3 shadow-[var(--shadow-glass)] backdrop-blur-2xl">
        <p className="flex shrink-0 items-baseline gap-1.5">
          <span className="font-display text-[22px] leading-none font-semibold text-foreground tabular-nums">
            {coverage.percent}%
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-tertiary">
            covered
          </span>
        </p>

        <CoverageMeter
          coverage={coverage}
          showValue={false}
          className="min-w-[120px] flex-1"
        />

        <Text size="caption" tone="tertiary" className="shrink-0">
          {coverage.coveredCount} of {coverage.totalCount} departments
          {crossCount > 0
            ? ` · ${crossCount} cross-department assessment${crossCount === 1 ? "" : "s"}`
            : ""}
        </Text>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <Heading level={2} size="h3">
            Department coverage
          </Heading>
          <Text size="caption" tone="tertiary">
            Open a department for its reports and next step
          </Text>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {coverage.departments.map((item) => (
            <DepartmentCard
              key={item.department.id}
              companyId={company.id}
              item={item}
              onStart={
                item.status === "not-assessed" ? () => start("sales") : undefined
              }
            />
          ))}
        </ul>
      </section>

      {/* The offshoring assessment spans functions, so it sits outside the
          department grid rather than pretending to be one of them. */}
      <section>
        <Heading level={2} size="h3" className="mb-3">
          Cross-department
        </Heading>

        <ul className="overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
          <CoverageLine
            name={getAgentById("offshoring")?.name ?? "Offshoring potential assessment"}
            description="Spans every function rather than sitting inside one department."
            status={cross.status}
            assessmentCount={cross.assessmentCount}
            lastAssessedAt={cross.lastAssessedAt}
            latestRecordId={cross.latestRecordId}
            reportUrl={
              cross.status === "covered"
                ? workforceSourcingReportUrl(company.name)
                : undefined
            }
            explainer={CROSS_EXPLAINER[cross.status]}
            agent="offshoring"
            onAssess={start}
          />
        </ul>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <Heading level={2} size="h3">
            Saved assessments
          </Heading>
          {own.length > 0 ? (
            <Text size="caption" tone="tertiary">
              {own.length === 1 ? "1 assessment" : `${own.length} assessments`} · newest
              first
            </Text>
          ) : null}
        </div>

        {own.length === 0 ? (
          <EmptyState
            icon={Archive}
            size="sm"
            title="No saved assessments yet"
            description={`Run an assessment for ${company.name} to the end and its report will be kept here.`}
            action={<Button href="/agents">Browse agents</Button>}
          />
        ) : (
          <ul className="overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
            {own.map((record) => (
              <RecordRow key={record.id} record={record} onDelete={setPendingDelete} />
            ))}
          </ul>
        )}
      </section>

      <CompanyFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        company={company}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(undefined);
        }}
        title="Delete this record?"
        description={
          pendingDelete
            ? `The saved ${pendingDelete.title} for ${pendingDelete.companyName} will be removed from this device. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete record"
        cancelLabel="Keep record"
        tone="danger"
        onConfirm={() => {
          if (pendingDelete) deleteRecord(pendingDelete.id);
          setPendingDelete(undefined);
        }}
      />

      {overlays}
    </div>
  );
}
