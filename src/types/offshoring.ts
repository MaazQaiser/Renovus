import type { AnswerValue } from "./question";
import type { UploadedFile } from "./file";
import type { ConfidenceLevel } from "./sales-assessment";
import type { Sector } from "./company";

export type OffshoringPhase =
  | "company"
  | "payroll"
  | "round1"
  | "round2"
  | "round3"
  | "value-creation"
  | "complete";

export type OffshoringDataTier = "A" | "B" | "C";

export type OffshoringQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "text"
  | "textarea";

export type OffshoringQuestionSection =
  | "round-1"
  | "round-2"
  | "round-3"
  | "value-creation"
  | "clarification";

export type ClarificationInputType = "text" | "multiple-choice" | "single-choice";

export interface DetectedFunction {
  id: string;
  label: string;
  /** Mock headcount for framing and preview. */
  fte: number;
}

export interface OffshoringQuestionOption {
  id: string;
  label: string;
}

export interface OffshoringClarificationRule {
  id: string;
  whenIncludes?: string[];
  whenOptionIds?: string[];
  prompt: string;
  inputType?: ClarificationInputType;
  /** When true, options are the session's detected functions. */
  optionsFromFunctions?: boolean;
  options?: OffshoringQuestionOption[];
  required?: boolean;
}

export interface OffshoringQuestion {
  id: string;
  section: OffshoringQuestionSection;
  question: string;
  description?: string;
  type: OffshoringQuestionType;
  options?: OffshoringQuestionOption[];
  required: boolean;
  supportsText: boolean;
  supportsSpeech: boolean;
  asksConfidence: boolean;
  order: number;
  optional?: boolean;
  clarifications?: OffshoringClarificationRule[];
}

export type OffshoringMessageKind =
  | "intro"
  | "company-prompt"
  | "company-answer"
  | "document-prompt"
  | "document-answer"
  | "question"
  | "answer"
  | "clarification"
  | "preview"
  | "complete"
  | "system";

export interface OffshoringChatMessage {
  id: string;
  role: "agent" | "user";
  kind: OffshoringMessageKind;
  content: string;
  timestamp: string;
  questionId?: string;
}

export interface OffshoringAnswer {
  value: AnswerValue;
  label: string;
  confidence?: ConfidenceLevel;
  whoWouldKnow?: string;
}

export interface OffshoringSession {
  id: string;
  companyId?: string;
  companyName?: string;
  companySector?: Sector;
  phase: OffshoringPhase;
  messages: OffshoringChatMessage[];
  files: UploadedFile[];
  skippedPayroll: boolean;
  dataTier?: OffshoringDataTier;
  detectedFunctions: DetectedFunction[];
  answers: Record<string, OffshoringAnswer>;
  queue: string[];
  currentQuestionId?: string;
  clarificationId?: string;
  status: "in-progress" | "complete" | "processing";
  startedAt: string;
  updatedAt: string;
}
