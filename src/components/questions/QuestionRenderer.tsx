import { SingleChoice } from "./SingleChoice";
import { MultipleChoice } from "./MultipleChoice";
import { TextInput } from "./TextInput";
import { TextareaInput } from "./TextareaInput";
import { Scale } from "./Scale";
import { YesNo } from "./YesNo";
import type { AnswerValue, Question } from "@/types/question";

export interface QuestionRendererProps {
  question: Question;
  value?: AnswerValue;
  onChange: (value: AnswerValue) => void;
  labelledBy: string;
  describedBy?: string;
  invalid?: boolean;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  labelledBy,
  describedBy,
  invalid,
}: QuestionRendererProps) {
  switch (question.type) {
    case "single-choice":
      return (
        <SingleChoice
          name={question.id}
          options={question.options}
          value={typeof value === "string" ? value : undefined}
          onChange={onChange}
          labelledBy={labelledBy}
          invalid={invalid}
        />
      );
    case "multiple-choice":
      return (
        <MultipleChoice
          name={question.id}
          options={question.options}
          value={Array.isArray(value) ? value : undefined}
          onChange={onChange}
          labelledBy={labelledBy}
          invalid={invalid}
        />
      );
    case "text":
      return (
        <TextInput
          id={question.id}
          value={typeof value === "string" ? value : ""}
          placeholder={question.placeholder}
          invalid={invalid}
          labelledBy={labelledBy}
          describedBy={describedBy}
          onChange={onChange}
        />
      );
    case "textarea":
      return (
        <TextareaInput
          id={question.id}
          value={typeof value === "string" ? value : ""}
          placeholder={question.placeholder}
          rows={question.rows}
          invalid={invalid}
          labelledBy={labelledBy}
          describedBy={describedBy}
          onChange={onChange}
        />
      );
    case "scale":
      return (
        <Scale
          name={question.id}
          min={question.min}
          max={question.max}
          minLabel={question.minLabel}
          maxLabel={question.maxLabel}
          value={typeof value === "number" ? value : undefined}
          onChange={onChange}
          labelledBy={labelledBy}
          invalid={invalid}
        />
      );
    case "yes-no":
      return (
        <YesNo
          name={question.id}
          value={typeof value === "boolean" ? value : undefined}
          onChange={onChange}
          labelledBy={labelledBy}
          invalid={invalid}
        />
      );
  }
}

export { QuestionRenderer as QuestionCard };
