"use client";

import { useCallback, useSyncExternalStore } from "react";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/primitives/Button";
import { Skeleton } from "@/components/primitives/Skeleton";
import { OffshoringReport } from "@/components/offshoring/OffshoringReport";
import { SalesReport } from "@/components/sales/SalesReport";
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
          action={<Button href="/agents/records">Back to records</Button>}
        />
      </PageContainer>
    );
  }

  if (record.payload.kind === "offshoring") {
    return (
      <OffshoringReport
        archived={{
          companyName: record.companyName,
          sector: record.payload.sector,
        }}
      />
    );
  }

  return <SalesReport report={record.payload.report} />;
}
