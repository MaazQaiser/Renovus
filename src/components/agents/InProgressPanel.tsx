"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { deleteRun, listRuns, subscribeToRuns } from "@/lib/runs";
import { ACTIVE_RUN_STATUSES, type AgentRun } from "@/types/run";
import { formatDateTime } from "@/lib/format";
import { getCompanyById } from "@/data/companies";
import { getDepartmentById } from "@/data/departments";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { InProgressRunCard } from "./InProgressRunCard";
import type { Agent } from "@/types/agent";
import type { AppHref } from "@/lib/routes";

export interface InProgressPanelProps {
  agent: Agent;
  continueHref: AppHref;
}

const EMPTY_RUNS: AgentRun[] = [];

export function InProgressPanel({ agent, continueHref }: InProgressPanelProps) {
  const runs = useSyncExternalStore(subscribeToRuns, listRuns, () => EMPTY_RUNS);
  const run = useMemo(
    () =>
      runs
        .filter(
          (entry) =>
            entry.agentId === agent.id && ACTIVE_RUN_STATUSES.includes(entry.status),
        )
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0],
    [runs, agent.id],
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!run || !agent.overview) return null;

  const company = run.companyId ? getCompanyById(run.companyId) : undefined;
  const department = run.departmentId ? getDepartmentById(run.departmentId) : undefined;
  const step = agent.steps.find((entry) => entry.id === run.currentStepId);

  return (
    <div className="mt-10">
      <InProgressRunCard
        title={agent.overview.inProgressTitle}
        companyName={company?.name}
        departmentName={department?.name}
        progressLabel={step?.label ?? "In progress"}
        updatedLabel={formatDateTime(run.updatedAt)}
        continueHref={continueHref}
        continueLabel={agent.overview.continueLabel}
        onStartOver={() => setConfirmOpen(true)}
      />
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Start over?"
        description="This discards the in-progress assessment on this device. You can start again from company selection."
        confirmLabel="Start over"
        cancelLabel="Keep progress"
        onConfirm={() => {
          deleteRun(run.id);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
