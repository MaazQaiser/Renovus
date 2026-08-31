"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useFormField } from "./FormField";

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[13px]",
  lg: "h-12 px-5 text-[15px]",
} as const;

export interface InputProps extends Omit<React.ComponentProps<"input">, "size"> {
  size?: keyof typeof sizes;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  invalid?: boolean;
}

export function Input({
  size = "md",
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  invalid,
  className,
  id,
  ...props
}: InputProps) {
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <div className="relative">
      {LeadingIcon ? (
        <LeadingIcon
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tertiary"
        />
      ) : null}
      <input
        id={id ?? field?.id}
        aria-invalid={isInvalid || undefined}
        aria-describedby={field?.describedBy}
        className={cn(
          "w-full rounded-full border bg-glass backdrop-blur-xl text-foreground placeholder:text-tertiary",
          "transition-colors duration-[120ms] ease-[var(--ease-standard)]",
          "hover:border-border-strong focus-visible:border-accent",
          "disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-disabled",
          sizes[size],
          LeadingIcon && "pl-9",
          TrailingIcon && "pr-10",
          isInvalid ? "border-error" : "border-border",
          className,
        )}
        {...props}
      />
      {TrailingIcon ? (
        <TrailingIcon
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
        />
      ) : null}
    </div>
  );
}
