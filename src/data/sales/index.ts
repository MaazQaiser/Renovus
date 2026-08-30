import type { SalesModule, SalesQuestion, SalesSection } from "@/types/sales-assessment";
import { getChannel } from "./channels";
import { PHASE1_QUESTIONS } from "./phase1";
import { MODULE_QUESTIONS } from "./modules";
import { COMMON_QUESTIONS } from "./common";

/**
 * The full sales question bank of `1_Sales_Agent_Questionnaire_v3.md`,
 * concatenated in spec order: Phase 1, the Phase 2 modules plus CAP,
 * then the common sessions and closers.
 */

export { CHANNELS, BLOCKER_OPTIONS, getChannel } from "./channels";
export { PHASE1_QUESTIONS } from "./phase1";
export { MODULE_QUESTIONS } from "./modules";
export { COMMON_QUESTIONS } from "./common";

export const salesQuestions: SalesQuestion[] = [
  ...PHASE1_QUESTIONS,
  ...MODULE_QUESTIONS,
  ...COMMON_QUESTIONS,
];

// ── Lookup ──────────────────────────────────────────────────────────────

/**
 * Resolves a queue id to its question. Loop instances carry a `:suffix`
 * (`CH2:field`, `CH3.f1:seg-2`); the template before the colon is found and
 * `{{Channel}}` / `{{channel}}` / `{{segment}}` are interpolated from it.
 * Follow-up ids (`CH3.f1`) resolve to a synthesised question for the rule.
 */
export function getSalesQuestion(id: string): SalesQuestion | undefined {
  const separator = id.indexOf(":");
  const baseId = separator === -1 ? id : id.slice(0, separator);
  const suffix = separator === -1 ? "" : id.slice(separator + 1);

  const template = findTemplate(baseId);
  if (!template) return undefined;
  if (!suffix) return template;

  const channel = getChannel(suffix);
  const label = channel ? channel.label : suffix;

  return {
    ...template,
    id,
    question: interpolate(template.question, label),
    followUps: template.followUps?.map((rule) => ({
      ...rule,
      id: `${rule.id}:${suffix}`,
      prompt: interpolate(rule.prompt, label),
    })),
  };
}

function findTemplate(baseId: string): SalesQuestion | undefined {
  const question = salesQuestions.find((entry) => entry.id === baseId);
  if (question) return question;

  const followUpMatch = /^(.+)\.(f\d+)$/.exec(baseId);
  if (!followUpMatch) return undefined;

  const parent = salesQuestions.find((entry) => entry.id === followUpMatch[1]);
  const rule = parent?.followUps?.find((entry) => entry.id === baseId);
  if (!parent || !rule) return undefined;

  return {
    ...parent,
    id: rule.id,
    question: rule.prompt,
    why: undefined,
    type: rule.options && rule.options.length > 0 ? "single-choice" : "text",
    options: rule.options,
    asksConfidence: false,
    star: undefined,
    followUps: undefined,
  };
}

function interpolate(text: string, label: string): string {
  return text
    .replace(/\{\{Channel\}\}/g, label)
    .replace(/\{\{channel\}\}/g, lowerFirst(label))
    .replace(/\{\{segment\}\}/g, label);
}

function lowerFirst(value: string): string {
  return value.length > 0 ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

export function getQuestionsBySection(section: SalesSection): SalesQuestion[] {
  return salesQuestions.filter((question) => question.section === section);
}

// ── Id groupings ────────────────────────────────────────────────────────

export const PHASE1_QUESTION_IDS: string[] = PHASE1_QUESTIONS.map((question) => question.id);

export const MODULE_QUESTION_IDS: Record<SalesModule, string[]> = {
  "M-RFP": MODULE_QUESTIONS.filter((q) => q.module === "M-RFP").map((q) => q.id),
  "M-OUT": MODULE_QUESTIONS.filter((q) => q.module === "M-OUT").map((q) => q.id),
  "M-REL": MODULE_QUESTIONS.filter((q) => q.module === "M-REL").map((q) => q.id),
  "M-FLD": MODULE_QUESTIONS.filter((q) => q.module === "M-FLD").map((q) => q.id),
};

export const CAP_IDS: string[] = salesQuestions
  .filter((question) => question.section === "cap")
  .map((question) => question.id);

export const SYSTEMS_IDS: string[] = salesQuestions
  .filter((question) => question.section === "systems")
  .map((question) => question.id);

export const MARKETING_IDS: string[] = salesQuestions
  .filter((question) => question.section === "marketing")
  .map((question) => question.id);

export const CEO_CLOSE_IDS: string[] = salesQuestions
  .filter((question) => question.section === "ceo-close")
  .map((question) => question.id);

/** The spec's 12 ★ questions — kept for used-but-not-dominant channels. */
export const STAR_IDS: string[] = salesQuestions
  .filter((question) => question.star === true)
  .map((question) => question.id);

/** The spec's 17 (A/E/G/N/X) questions. */
export const CONFIDENCE_QIDS: string[] = salesQuestions
  .filter((question) => question.asksConfidence)
  .map((question) => question.id);
