import { QuestionOption } from "./QuestionOption";
import type { QuestionOption as QuestionOptionData } from "@/types/question";

export interface MultipleChoiceProps {
  name: string;
  options: QuestionOptionData[];
  value?: string[];
  onChange: (value: string[]) => void;
  labelledBy: string;
  invalid?: boolean;
}

export function MultipleChoice({
  name,
  options,
  value = [],
  onChange,
  labelledBy,
  invalid,
}: MultipleChoiceProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      data-invalid={invalid || undefined}
      className="flex flex-col gap-3"
    >
      {options.map((option) => {
        const selected = value.includes(option.id);
        return (
          <QuestionOption
            key={option.id}
            id={`${name}-${option.id}`}
            label={option.label}
            description={option.description}
            selected={selected}
            multiple
            onSelect={() => {
              onChange(
                selected ? value.filter((entry) => entry !== option.id) : [...value, option.id],
              );
            }}
          />
        );
      })}
    </div>
  );
}
