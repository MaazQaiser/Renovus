import { QuestionOption } from "./QuestionOption";
import type { QuestionOption as QuestionOptionData } from "@/types/question";

export interface SingleChoiceProps {
  name: string;
  options: QuestionOptionData[];
  value?: string;
  onChange: (value: string) => void;
  labelledBy: string;
  invalid?: boolean;
}

export function SingleChoice({
  name,
  options,
  value,
  onChange,
  labelledBy,
  invalid,
}: SingleChoiceProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      className="flex flex-col gap-3"
    >
      {options.map((option) => (
        <QuestionOption
          key={option.id}
          id={`${name}-${option.id}`}
          label={option.label}
          description={option.description}
          selected={value === option.id}
          onSelect={() => onChange(option.id)}
        />
      ))}
    </div>
  );
}
