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
        // Glass, like every other pickable surface in the app (agent cards,
        // company picker): translucent fill over the page wash plus blur — a
        // flat white fill is what made these read as a different product.
        "group flex min-h-11 w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left",
        "backdrop-blur-2xl transition-[background-color,border-color,box-shadow] duration-[140ms] ease-[var(--ease-standard)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected
          ? "border-accent bg-accent-subtle text-foreground shadow-[var(--shadow-raised)]"
          : "border-glass-border bg-glass text-foreground shadow-[var(--shadow-glass)] hover:border-accent-border hover:bg-glass-strong hover:shadow-[var(--shadow-raised)]",
        disabled && "cursor-not-allowed opacity-50 hover:shadow-[var(--shadow-glass)]",
      )}
    >
      {letter ? (
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold transition-colors",
            selected
              ? "border-accent bg-accent text-inverse"
              : "border-glass-border bg-glass-quiet text-secondary group-hover:border-accent-border group-hover:text-accent",
          )}
          aria-hidden
        >
          {letter}
        </span>
      ) : null}
      <span className="text-[14px] font-medium leading-5">{label}</span>
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
