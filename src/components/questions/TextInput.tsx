import { Input } from "@/components/forms/Input";

export interface TextInputProps {
  id: string;
  value?: string;
  placeholder?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
  labelledBy?: string;
  describedBy?: string;
}

export function TextInput({
  id,
  value = "",
  placeholder,
  invalid,
  onChange,
  labelledBy,
  describedBy,
}: TextInputProps) {
  return (
    <Input
      id={id}
      value={value}
      placeholder={placeholder}
      invalid={invalid}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
