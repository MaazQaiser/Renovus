import { QuestionOption } from "./QuestionOption";

export interface YesNoProps {
  name: string;
  value?: boolean;
  onChange: (value: boolean) => void;
  labelledBy: string;
  invalid?: boolean;
}

export function YesNo({ name, value, onChange, labelledBy, invalid }: YesNoProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <QuestionOption
        id={`${name}-yes`}
        label="Yes"
        selected={value === true}
        onSelect={() => onChange(true)}
      />
      <QuestionOption
        id={`${name}-no`}
        label="No"
        selected={value === false}
        onSelect={() => onChange(false)}
      />
    </div>
  );
}
