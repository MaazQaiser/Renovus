"use client";

import { cn } from "@/lib/cn";
import { useFormField } from "./FormField";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, id, ...props }: TextareaProps) {
  const field = useFormField();
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <textarea
      id={id ?? field?.id}
      aria-invalid={isInvalid || undefined}
      aria-describedby={field?.describedBy}
      className={cn(
        "w-full rounded-control border bg-glass backdrop-blur-xl px-4 py-3 text-[15px] leading-6 text-foreground placeholder:text-tertiary",
        "transition-colors duration-[120ms] ease-[var(--ease-standard)]",
        "hover:border-border-strong focus-visible:border-accent",
        "disabled:cursor-not-allowed disabled:bg-surface-tertiary disabled:text-disabled",
        isInvalid ? "border-error" : "border-border",
        className,
      )}
      {...props}
    />
  );
}
