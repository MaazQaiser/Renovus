"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFormField } from "./FormField";

const sizes = {
  sm: "h-8 pl-3 pr-8 text-[13px]",
  md: "h-10 pl-4 pr-9 text-[13px]",
  lg: "h-12 pl-5 pr-10 text-[15px]",
} as const;

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.ComponentProps<"select">, "size"> {
  size?: keyof typeof sizes;
  options: SelectOption[];
  invalid?: boolean;
}

/**
 * Native select with the chevron drawn on top — the same treatment
 * RecordsToolbar hand-rolled, extracted so both call sites agree.
 */
export function Select({
  size = "md",
  options,
  invalid,
  className,
  id,
  ...props
}: SelectProps) {
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <div className="relative">
      <select
        id={id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          "w-full appearance-none rounded-full border bg-glass py-0 font-medium text-foreground backdrop-blur-xl",
          "shadow-[var(--shadow-glass)] transition-colors duration-[120ms] ease-[var(--ease-standard)]",
          "hover:border-border-strong focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent",
          "disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-disabled",
          sizes[size],
          isInvalid ? "border-error" : "border-border",
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={2}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
      />
    </div>
  );
}
