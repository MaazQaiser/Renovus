"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Building2, FileText } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { BackButton } from "@/components/navigation/BackButton";
import { RecordRow } from "@/components/records/RecordRow";
import { Button } from "@/components/primitives/Button";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { getDepartmentById } from "@/data/departments";
import { companyCoverage, departmentRecords } from "@/lib/coverage";
import {
  getServerCompanies,
  listCompanies,
  subscribeToCompanies,
} from "@/lib/companies";
import {
  deleteRecord,
  getServerRecords,
  listRecords,
  subscribeToRecords,
} from "@/lib/records";
import type { AssessmentRecord } from "@/types/record";
import { companyHref } from "./companyMeta";
import { useAssessmentStart } from "./useAssessmentStart";
import {
  AgenticWorkflowCard,
  BottomLineCard,
  CurrentWorkflowCard,
} from "./DepartmentSnapshots";

export interface DepartmentDetailProps {
  companyId: string;
  departmentId: string;
}

export function DepartmentDetail({ companyId, departmentId }: DepartmentDetailProps) {
  const companies = useSyncExternalStore(
    subscribeToCompanies,
    listCompanies,
    getServerCompanies,
  );
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);

  const [pendingDelete, setPendingDelete] = useState<AssessmentRecord | undefined>();

  const company = companies.find((item) => item.id === companyId);
  const department = getDepartmentById(departmentId);
  const { start, overlays } = useAssessmentStart(company);

  const item = useMemo(() => {
    if (!company) return undefined;
    return companyCoverage(company, records).departments.find(
      (entry) => entry.department.id === departmentId,
    );
  }, [company, records, departmentId]);

  const own = useMemo(
    () =>
      company
        ? departmentRecords(company, records, departmentId)
        : { baseline: [], workflow: [], process: [] },
    [company, records, departmentId],
  );

  if (!company || !department || !item) {
    return (
      <div className="flex flex-col gap-6">
        <div className="self-start"><BackButton href="/companies" label="All PortCos" /></div>
        <EmptyState
          icon={Building2}
          title="Department not found"
          description="This PortCo or department may no longer exist. Pick another from the list."
          action={
            <Button variant="primary" href="/companies">
              Back to PortCos
            </Button>
          }
        />
      </div>
    );
  }



  // Stored payloads already carry the full report, so a snapshot needs no new
  // plumbing — just the newest of each kind, narrowed by payload shape.
  const baselineRecord = own.baseline[0];
  const salesReport =
    baselineRecord?.payload.kind === "sales" ? baselineRecord.payload.report : undefined;
  const workflowRecord = own.workflow[0];
  const workflowReport =
    workflowRecord?.payload.kind === "workflow"
      ? workflowRecord.payload.report
      : undefined;
  const allRecords = [...own.baseline, ...own.workflow, ...own.process].sort(
    (left, right) => right.completedAt.localeCompare(left.completedAt),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="self-start"><BackButton href={companyHref(company.id)} label={company.name} /></div>

      <header>
        <Heading level={1} size="h1">
          {department.name}
        </Heading>
        <Text tone="secondary" className="mt-1.5 max-w-[60ch]">
          {department.description}
        </Text>
      </header>

      <BottomLineCard
        report={salesReport}
        recordId={baselineRecord?.id}
        completedAt={baselineRecord?.completedAt}
        departmentName={department.name}
        onStart={department.available ? () => start("sales") : undefined}
      />

      {/* Current beside agentic so the two read line for line. The grid's
          default stretch keeps them the same height whichever is taller. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <CurrentWorkflowCard
          report={workflowReport}
          recordId={workflowRecord?.id}
          completedAt={workflowRecord?.completedAt}
          unlocked={item.status === "covered"}
        />

        <AgenticWorkflowCard
          report={workflowReport}
          recordId={workflowRecord?.id}
          unlocked={item.status === "covered"}
        />
      </div>

      <section>
        <Heading level={2} size="h3" className="mb-3">
          Saved assessments
        </Heading>

        {allRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            size="sm"
            title="Nothing saved yet"
            description={`Finish a ${department.name.toLowerCase()} assessment for ${company.name} and its report will be kept here.`}
          />
        ) : (
          <ul className="overflow-hidden rounded-xl border border-glass-border bg-glass shadow-[var(--shadow-glass)] backdrop-blur-2xl">
            {allRecords.map((record) => (
              <RecordRow key={record.id} record={record} onDelete={setPendingDelete} />
            ))}
          </ul>
        )}
      </section>


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
