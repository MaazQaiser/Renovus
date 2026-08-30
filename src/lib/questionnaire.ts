import type {
  AnswerMap,
  AnswerValue,
  Question,
  QuestionSection,
  Questionnaire,
} from "@/types/question";

export interface FlatQuestion {
  question: Question;
  section: QuestionSection;
  sectionIndex: number;
  questionIndexInSection: number;
  flatIndex: number;
}

export function flattenQuestionnaire(questionnaire: Questionnaire): FlatQuestion[] {
  return questionnaire.sections.flatMap((section, sectionIndex) =>
    section.questions.map((question, questionIndexInSection) => ({
      question,
      section,
      sectionIndex,
      questionIndexInSection,
      flatIndex:
        questionnaire.sections
          .slice(0, sectionIndex)
          .reduce((count, entry) => count + entry.questions.length, 0) + questionIndexInSection,
    })),
  );
}

export function isQuestionAnswered(question: Question, value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;

  switch (question.type) {
    case "single-choice":
    case "text":
    case "textarea":
      return typeof value === "string" && value.trim().length > 0;
    case "multiple-choice": {
      if (!Array.isArray(value)) return false;
      const minimum = question.minSelections ?? 1;
      return value.length >= minimum;
    }
    case "scale":
      return typeof value === "number" && value >= question.min && value <= question.max;
    case "yes-no":
      return typeof value === "boolean";
  }
}

export function validationMessage(question: Question): string {
  switch (question.type) {
    case "text":
    case "textarea":
      return "Enter a response to continue.";
    case "multiple-choice":
      return "Select at least one option to continue.";
    default:
      return "Please select an answer to continue.";
  }
}

export function findQuestionIndex(items: FlatQuestion[], questionId?: string): number {
  if (!questionId) return 0;
  const index = items.findIndex((item) => item.question.id === questionId);
  return index >= 0 ? index : 0;
}

export function completedSectionIds(questionnaire: Questionnaire, answers: AnswerMap): string[] {
  return questionnaire.sections
    .filter((section) =>
      section.questions.every(
        (question) => !question.required || isQuestionAnswered(question, answers[question.id]),
      ),
    )
    .map((section) => section.id);
}
