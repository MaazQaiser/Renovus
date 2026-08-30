import { cn } from "@/lib/cn";
import { Text } from "@/components/primitives/Text";

export interface QuickPickProps {
  label: string;
  letter?: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function QuickPick({
  label,
  letter,
  selected,
  disabled,
  onSelect,
}: QuickPickProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-10 w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "border-accent bg-accent-subtle text-foreground"
          : "border-border bg-surface text-foreground hover:border-border-strong",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {letter ? (
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border text-[11px] font-semibold",
            selected
              ? "border-accent bg-accent text-inverse"
              : "border-border bg-surface-tertiary text-secondary",
          )}
          aria-hidden
        >
          {letter}
        </span>
      ) : null}
      <span className="text-[14px] font-semibold leading-5">{label}</span>
    </button>
  );
}

export interface QuickPickGroupProps {
  label: string;
  options: { id: string; label: string }[];
  value?: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  className?: string;
  lettered?: boolean;
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

export function QuickPickGroup({
  label,
  options,
  value,
  multiple,
  onChange,
  className,
  lettered = true,
}: QuickPickGroupProps) {
  const selectedIds = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-label={label}
      className={cn("flex flex-col gap-2", className)}
    >
      {options.map((option, index) => {
        const selected = selectedIds.includes(option.id);
        const letter = lettered ? optionLetter(index) : undefined;
        return (
          <QuickPick
            key={option.id}
            label={option.label}
            letter={letter}
            selected={selected}
            onSelect={() => {
              if (multiple) {
                onChange(
                  selected
                    ? selectedIds.filter((id) => id !== option.id)
                    : [...selectedIds, option.id],
                );
                return;
              }
              onChange(option.id);
            }}
          />
        );
      })}
      {options.length === 0 ? (
        <Text size="body-sm" tone="tertiary">
          No options configured.
        </Text>
      ) : null}
    </div>
  );
}
