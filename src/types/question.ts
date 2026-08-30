import type { AgentId } from "./agent";

export type QuestionType =
  | "single-choice"
  | "multiple-choice"
  | "text"
  | "textarea"
  | "scale"
  | "yes-no";

export type AnswerValue = string | string[] | number | boolean | null;
export type AnswerMap = Record<string, AnswerValue>;

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuestionCondition {
  questionId: string;
  equals?: AnswerValue;
  includes?: string;
}

interface QuestionBase {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  helpText?: string;
  required: boolean;
  showWhen?: QuestionCondition;
}

export interface SingleChoiceQuestion extends QuestionBase {
  type: "single-choice";
  options: QuestionOption[];
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "multiple-choice";
  options: QuestionOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface TextQuestion extends QuestionBase {
  type: "text";
  placeholder?: string;
  maxLength?: number;
}

export interface TextareaQuestion extends QuestionBase {
  type: "textarea";
  placeholder?: string;
  maxLength?: number;
  rows?: number;
}

export interface ScaleQuestion extends QuestionBase {
  type: "scale";
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  step?: number;
}

export interface YesNoQuestion extends QuestionBase {
  type: "yes-no";
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextQuestion
  | TextareaQuestion
  | ScaleQuestion
  | YesNoQuestion;

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Questionnaire {
  id: string;
  agentId: AgentId;
  departmentId?: string;
  title: string;
  description: string;
  sections: QuestionSection[];
}

export interface AssessmentResponse {
  companyId: string;
  departmentId: string;
  answers: AnswerMap;
  currentQuestionId: string;
  completedSectionIds: string[];
  status: "in-progress" | "submitted";
}
