"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { companyHref } from "@/components/companies/companyMeta";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/primitives/Button";
import { Skeleton } from "@/components/primitives/Skeleton";
import { OffshoringReport } from "@/components/offshoring/OffshoringReport";
import { SalesReport } from "@/components/sales/SalesReport";
import { WorkflowReport } from "@/components/workflow/WorkflowReport";
import { SalesBaselineReport } from "@/components/pre-assessment/SalesBaselineReport";
import { SalesPreAssessment } from "@/components/pre-assessment/SalesPreAssessment";
import { listRecords, subscribeToRecords } from "@/lib/records";
import type { AssessmentRecord } from "@/types/record";

export interface RecordReportProps {
  recordId: string;
}

export function RecordReport({ recordId }: RecordReportProps) {
  // Records live in localStorage, so the server can't know whether one exists:
  // `undefined` means "not looked up yet", `null` means "definitely missing".
  const getSnapshot = useCallback(
    (): AssessmentRecord | null =>
      listRecords().find((entry) => entry.id === recordId) ?? null,
    [recordId],
  );
  const record = useSyncExternalStore<AssessmentRecord | null | undefined>(
    subscribeToRecords,
    getSnapshot,
    () => undefined,
  );

  if (record === undefined) {
    return (
      <PageContainer width="default">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-64 w-full" />
      </PageContainer>
    );
  }

  if (record === null) {
    return (
      <PageContainer width="default">
        <EmptyState
          icon={FileQuestion}
          title="Record not found"
          description="This saved assessment is no longer on this device. Records are stored locally, so they don't follow you between browsers."
          action={<Button href="/companies">Back to PortCos</Button>}
        />
      </PageContainer>
    );
  }

  // Records saved before `companyId` existed have no company page to return to.
  const backHref = record.companyId ? companyHref(record.companyId) : undefined;

  if (record.payload.kind === "offshoring") {
    return (
      <OffshoringReport
        archived={{
          companyName: record.companyName,
          sector: record.payload.sector,
        }}
        backHref={backHref}
      />
    );
  }

  if (record.payload.kind === "baseline") {
    return (
      <SalesBaselineReport
        report={record.payload.report}
        backHref={backHref}
        companyId={record.companyId}
      />
    );
  }

  if (record.payload.kind === "process") {
    return <SalesPreAssessment report={record.payload.report} backHref={backHref} />;
  }

  if (record.payload.kind === "workflow") {
    return <WorkflowReport report={record.payload.report} backHref={backHref} />;
  }

  return <SalesReport report={record.payload.report} backHref={backHref} />;
}
