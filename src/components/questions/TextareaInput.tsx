import { Textarea } from "@/components/forms/Textarea";

export interface TextareaInputProps {
  id: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  invalid?: boolean;
  onChange: (value: string) => void;
  labelledBy?: string;
  describedBy?: string;
}

export function TextareaInput({
  id,
  value = "",
  placeholder,
  rows = 5,
  invalid,
  onChange,
  labelledBy,
  describedBy,
}: TextareaInputProps) {
  return (
    <Textarea
      id={id}
      value={value}
      placeholder={placeholder}
      rows={rows}
      invalid={invalid}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
