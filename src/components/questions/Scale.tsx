import { cn } from "@/lib/cn";
import { Text } from "@/components/primitives/Text";

export interface ScaleProps {
  name: string;
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  value?: number;
  onChange: (value: number) => void;
  labelledBy: string;
  invalid?: boolean;
}

export function Scale({
  name,
  min,
  max,
  minLabel,
  maxLabel,
  value,
  onChange,
  labelledBy,
  invalid,
}: ScaleProps) {
  const values = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return (
    <div>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-invalid={invalid || undefined}
        className="flex flex-wrap gap-2"
      >
        {values.map((entry) => {
          const selected = value === entry;
          return (
            <button
              key={entry}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${entry}`}
              name={name}
              onClick={() => onChange(entry)}
              className={cn(
                "flex size-12 items-center justify-center rounded-md border text-[15px] font-semibold",
                selected
                  ? "border-accent bg-accent text-inverse"
                  : "border-glass-border bg-glass text-foreground backdrop-blur-xl hover:border-border-strong",
              )}
            >
              {entry}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex justify-between gap-4">
        <Text size="caption" tone="tertiary">
          {min} — {minLabel}
        </Text>
        <Text size="caption" tone="tertiary">
          {max} — {maxLabel}
        </Text>
      </div>
    </div>
  );
}
