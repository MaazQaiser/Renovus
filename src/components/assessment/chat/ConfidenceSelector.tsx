import { CONFIDENCE_OPTIONS, type ConfidenceLevel } from "@/types/sales-assessment";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

export interface ConfidenceSelectorProps {
  value?: ConfidenceLevel;
  onChange: (value: ConfidenceLevel) => void;
  whoWouldKnow?: string;
  onWhoWouldKnowChange?: (value: string) => void;
}

export function ConfidenceSelector({
  value,
  onChange,
  whoWouldKnow,
  onWhoWouldKnowChange,
}: ConfidenceSelectorProps) {
  const needsOwner = value === "G" || value === "N" || value === "X";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Text size="caption" tone="secondary" className="shrink-0">
          Confidence
        </Text>
        <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Confidence">
          {CONFIDENCE_OPTIONS.map((option) => {
            const selected = value === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                title={`${option.label} — ${option.hint}`}
                onClick={() => onChange(option.id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-control border px-2.5 text-[12px] font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                  selected
                    ? "border-accent bg-accent text-inverse"
                    : "border-border bg-glass text-secondary backdrop-blur-xl hover:border-border-strong hover:text-foreground",
                )}
              >
                <span aria-hidden>{option.id}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {needsOwner && onWhoWouldKnowChange ? (
        <input
          id="who-would-know"
          value={whoWouldKnow ?? ""}
          onChange={(event) => onWhoWouldKnowChange(event.target.value)}
          placeholder="Who would know?"
          className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[13px] focus-visible:border-accent focus-visible:outline-none"
        />
      ) : null}
    </div>
  );
}
