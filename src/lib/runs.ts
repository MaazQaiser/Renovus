import { ACTIVE_RUN_STATUSES, type AgentRun } from "@/types/run";
import type { AgentId } from "@/types/agent";
import type { AnswerMap } from "@/types/question";
import { readStorage, removeStorage, storageKeys, writeStorage } from "./storage";

const RUNS_EVENT = "renovers:runs";

let snapshotCache: { raw: string | null; value: AgentRun[] } = {
  raw: null,
  value: [],
};

function emitRunsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RUNS_EVENT));
}

export function subscribeToRuns(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(RUNS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(RUNS_EVENT, onStoreChange);
  };
}

export function listRuns(): AgentRun[] {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(storageKeys.runs);

  if (raw === snapshotCache.raw) {
    return snapshotCache.value;
  }

  const ids = readStorage<string[]>(storageKeys.runs) ?? [];
  const runs = ids
    .map((id) => readStorage<AgentRun>(storageKeys.run(id)))
    .filter((run): run is AgentRun => Boolean(run));

  snapshotCache = { raw, value: runs };
  return runs;
}

export function getActiveRun(agentId: AgentId): AgentRun | undefined {
  return listRuns()
    .filter((run) => run.agentId === agentId && ACTIVE_RUN_STATUSES.includes(run.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

const WRITABLE_STATUSES: AgentRun["status"][] = ["draft", "in-progress", "processing"];

export function getCurrentRun(agentId: AgentId): AgentRun | undefined {
  return listRuns()
    .filter((run) => run.agentId === agentId && WRITABLE_STATUSES.includes(run.status))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function deleteRun(id: string): void {
  const ids = (readStorage<string[]>(storageKeys.runs) ?? []).filter((entry) => entry !== id);
  writeStorage(storageKeys.runs, ids);
  removeStorage(storageKeys.run(id));
  snapshotCache = { raw: null, value: [] };
  emitRunsChange();
}

export function upsertRun(run: AgentRun, previousId?: string): void {
  const ids = readStorage<string[]>(storageKeys.runs) ?? [];
  const nextIds = ids.filter((id) => id !== run.id && id !== previousId);
  if (previousId && previousId !== run.id) {
    removeStorage(storageKeys.run(previousId));
  }
  writeStorage(storageKeys.run(run.id), run);
  writeStorage(storageKeys.runs, [...nextIds, run.id]);
  snapshotCache = { raw: null, value: [] };
  emitRunsChange();
}

export function runIdFor(agentId: AgentId, companyId: string, departmentId?: string): string {
  return `${agentId}:${companyId}:${departmentId ?? "_"}`;
}

export function saveCompanySelection(agentId: AgentId, companyId: string): AgentRun {
  const existing = getActiveRun(agentId);
  const now = new Date().toISOString();
  const companyChanged = Boolean(existing?.companyId && existing.companyId !== companyId);
  const departmentId = companyChanged ? undefined : existing?.departmentId;
  const nextId = runIdFor(agentId, companyId, departmentId);

  const run: AgentRun = existing
    ? {
        ...existing,
        id: nextId,
        companyId,
        departmentId,
        currentStepId: "company",
        status: existing.status === "draft" ? "in-progress" : existing.status,
        updatedAt: now,
      }
    : {
        id: nextId,
        agentId,
        companyId,
        documentIds: [],
        answers: {},
        currentStepId: "company",
        currentSectionIndex: 0,
        status: "in-progress",
        startedAt: now,
        updatedAt: now,
      };

  upsertRun(run, existing && existing.id !== nextId ? existing.id : undefined);
  return run;
}

export function saveDepartmentSelection(agentId: AgentId, departmentId: string): AgentRun | undefined {
  const existing = getActiveRun(agentId);
  if (!existing?.companyId) return undefined;

  const now = new Date().toISOString();
  const departmentChanged = Boolean(existing.departmentId && existing.departmentId !== departmentId);
  const nextId = runIdFor(agentId, existing.companyId, departmentId);
  const run: AgentRun = {
    ...existing,
    id: nextId,
    departmentId,
    currentStepId: "department",
    currentQuestionId: departmentChanged ? undefined : existing.currentQuestionId,
    answers: departmentChanged ? {} : existing.answers,
    updatedAt: now,
    status: existing.status === "draft" ? "in-progress" : existing.status,
  };

  upsertRun(run, existing.id !== nextId ? existing.id : undefined);
  return run;
}

export function saveQuestionnaireProgress(
  agentId: AgentId,
  patch: {
    answers?: AnswerMap;
    currentQuestionId?: string;
    currentSectionIndex?: number;
  },
): AgentRun | undefined {
  const existing = getCurrentRun(agentId);
  if (!existing) return undefined;

  const run: AgentRun = {
    ...existing,
    answers: patch.answers ?? existing.answers,
    currentQuestionId: patch.currentQuestionId ?? existing.currentQuestionId,
    currentSectionIndex: patch.currentSectionIndex ?? existing.currentSectionIndex,
    currentStepId: "questionnaire",
    status: "in-progress",
    updatedAt: new Date().toISOString(),
  };

  upsertRun(run);
  return run;
}

export function submitAssessment(agentId: AgentId): AgentRun | undefined {
  const existing = getCurrentRun(agentId);
  if (!existing) return undefined;

  const now = new Date().toISOString();
  const run: AgentRun = {
    ...existing,
    currentStepId: "processing",
    status: "processing",
    updatedAt: now,
  };

  upsertRun(run);
  return run;
}
