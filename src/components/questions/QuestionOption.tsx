import { Check } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Text } from "@/components/primitives/Text";

export interface QuestionOptionProps {
  id: string;
  label: string;
  description?: string;
  selected: boolean;
  multiple?: boolean;
  onSelect: () => void;
}

export function QuestionOption({
  id,
  label,
  description,
  selected,
  multiple = false,
  onSelect,
}: QuestionOptionProps) {
  return (
    <Card
      interactive
      selected={selected}
      padding="compact"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
      aria-labelledby={`${id}-label`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <span
          className={
            selected
              ? `mt-0.5 flex size-5 shrink-0 items-center justify-center bg-accent text-inverse ${multiple ? "rounded-sm" : "rounded-full"}`
              : `mt-0.5 size-5 shrink-0 border border-border ${multiple ? "rounded-sm" : "rounded-full"}`
          }
          aria-hidden
        >
          {selected ? <Check size={12} strokeWidth={2.25} /> : null}
        </span>
        <div className="min-w-0">
          <Text id={`${id}-label`} weight="semibold">
            {label}
          </Text>
          {description ? (
            <Text size="body-sm" tone="secondary" className="mt-1">
              {description}
            </Text>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
