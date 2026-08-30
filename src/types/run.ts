import type { AgentId } from "./agent";
import type { AnswerMap } from "./question";

export type AgentRunStatus =
  | "draft"
  | "in-progress"
  | "processing"
  | "complete"
  | "abandoned";

export interface AgentRun {
  id: string;
  agentId: AgentId;
  companyId?: string;
  departmentId?: string;
  documentIds: string[];
  answers: AnswerMap;
  currentStepId: string;
  currentSectionIndex: number;
  currentQuestionId?: string;
  status: AgentRunStatus;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  resultId?: string;
}

export const ACTIVE_RUN_STATUSES: AgentRunStatus[] = ["draft", "in-progress"];
