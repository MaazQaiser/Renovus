"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Archive, FilterX } from "lucide-react";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { Button } from "@/components/primitives/Button";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { ViewMode } from "@/components/primitives/ViewToggle";
import { EmptyState } from "@/components/feedback/EmptyState";
import {
  deleteRecord,
  getServerRecords,
  listRecords,
  subscribeToRecords,
} from "@/lib/records";
import {
  getServerUiPrefs,
  getUiPrefs,
  setUiPref,
  subscribeToUiPrefs,
} from "@/lib/ui-prefs";
import type { AssessmentRecord } from "@/types/record";
import { RecordCard } from "./RecordCard";
import { RecordRow } from "./RecordRow";
import {
  ALL_COMPANIES,
  RecordsToolbar,
  type AgentFilter,
} from "./RecordsToolbar";

export function RecordsScreen() {
  const records = useSyncExternalStore(
    subscribeToRecords,
    listRecords,
    getServerRecords,
  );

  const prefs = useSyncExternalStore(subscribeToUiPrefs, getUiPrefs, getServerUiPrefs);
  const view: ViewMode = prefs.recordsView ?? "grid";

  const [agent, setAgent] = useState<AgentFilter>("all");
  const [company, setCompany] = useState<string>(ALL_COMPANIES);
  const [pendingDelete, setPendingDelete] = useState<AssessmentRecord | undefined>();

  // Tab counts ignore the company filter, so the tabs stay a stable map of
  // what exists rather than shifting as you narrow by company.
  const counts = useMemo(
    () => ({
      all: records.length,
      sales: records.filter((record) => record.agent === "sales").length,
      offshoring: records.filter((record) => record.agent === "offshoring").length,
    }),
    [records],
  );

  const companies = useMemo(
    () => [...new Set(records.map((record) => record.companyName))].sort(),
    [records],
  );

  const visible = useMemo(
    () =>
      records.filter(
        (record) =>
          (agent === "all" || record.agent === agent) &&
          (company === ALL_COMPANIES || record.companyName === company),
      ),
    [records, agent, company],
  );

  const resultLabel =
    visible.length === 1 ? "1 assessment" : `${visible.length} assessments`;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <Heading level={1}>Records</Heading>
        <Text tone="secondary" className="mt-2 max-w-[65ch]">
          Completed assessments are saved here. Open one to read its report again.
        </Text>
      </header>

      {records.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No saved assessments yet"
          description="Run an assessment to the end and it will be saved here, so you can come back to the report later."
          action={<Button href="/agents">Browse agents</Button>}
        />
      ) : (
        <>
          <RecordsToolbar
            agent={agent}
            onAgentChange={setAgent}
            counts={counts}
            company={company}
            onCompanyChange={setCompany}
            companies={companies}
            view={view}
            onViewChange={(next) => setUiPref("recordsView", next)}
            resultLabel={resultLabel}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={FilterX}
              size="sm"
              title="Nothing matches these filters"
              description="No saved assessment matches the agent and company you've selected."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setAgent("all");
                    setCompany(ALL_COMPANIES);
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((record) => (
                <RecordCard key={record.id} record={record} onDelete={setPendingDelete} />
              ))}
            </ul>
          ) : (
            <ul className="overflow-hidden rounded-lg border border-border bg-surface">
              {visible.map((record) => (
                <RecordRow key={record.id} record={record} onDelete={setPendingDelete} />
              ))}
            </ul>
          )}
        </>
      )}

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
    </div>
  );
}
