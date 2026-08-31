"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/cn";

export type ViewMode = "list" | "grid";

export interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
  className?: string;
}

const OPTIONS: { mode: ViewMode; label: string; icon: typeof List }[] = [
  { mode: "list", label: "List view", icon: List },
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
];

export function ViewToggle({ value, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="View mode"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-glass-border bg-glass p-1 shadow-[var(--shadow-glass)] backdrop-blur-xl",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const selected = value === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.label}
            title={option.label}
            onClick={() => onChange(option.mode)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              selected
                ? "bg-surface text-foreground shadow-[var(--shadow-glass)]"
                : "text-tertiary hover:text-foreground",
            )}
          >
            <option.icon size={16} strokeWidth={1.75} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
