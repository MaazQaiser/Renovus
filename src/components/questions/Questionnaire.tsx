import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { QuestionRenderer } from "./QuestionRenderer";
import { QuestionError } from "./QuestionError";
import { QuestionProgress } from "./QuestionProgress";
import { QuestionNavigation } from "./QuestionNavigation";
import { QuestionnaireSection } from "./QuestionnaireSection";
import type { FlatQuestion } from "@/lib/questionnaire";
import type { AnswerValue } from "@/types/question";

export interface QuestionnaireProps {
  item: FlatQuestion;
  total: number;
  sectionCount: number;
  value?: AnswerValue;
  error?: string;
  continueLabel: string;
  onChange: (value: AnswerValue) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function Questionnaire({
  item,
  total,
  sectionCount,
  value,
  error,
  continueLabel,
  onChange,
  onBack,
  onContinue,
}: QuestionnaireProps) {
  const titleId = `${item.question.id}-title`;
  const descriptionId = item.question.description ? `${item.question.id}-description` : undefined;
  const errorId = error ? `${item.question.id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="pb-24 md:pb-0">
      <QuestionProgress
        current={item.flatIndex + 1}
        total={total}
        sectionLabel={`Section ${item.sectionIndex + 1} of ${sectionCount}`}
      />
      <QuestionnaireSection section={item.section}>
        <div>
          {item.question.required ? (
            <Text size="caption" tone="tertiary">
              Required
              <span className="sr-only"> question</span>
            </Text>
          ) : (
            <Text size="caption" tone="tertiary">
              Optional
            </Text>
          )}
          <Heading id={titleId} level={3} size="h3" className="mt-2">
            {item.question.title}
          </Heading>
          {item.question.description ? (
            <Text id={descriptionId} tone="secondary" className="mt-2 max-w-[65ch]">
              {item.question.description}
            </Text>
          ) : null}
          <div className="mt-6">
            <QuestionRenderer
              question={item.question}
              value={value}
              onChange={onChange}
              labelledBy={titleId}
              describedBy={describedBy}
              invalid={Boolean(error)}
            />
          </div>
          {error ? <QuestionError id={errorId} message={error} /> : null}
        </div>
      </QuestionnaireSection>
      <QuestionNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
      />
    </div>
  );
}
