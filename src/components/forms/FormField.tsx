"use client";

import { createContext, useContext, useId } from "react";
import { cn } from "@/lib/cn";

interface FormFieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  description?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  optionalLabel?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  hint,
  required,
  optionalLabel,
  children,
  className,
}: FormFieldProps) {
  const generatedId = useId();
  const id = htmlFor ?? generatedId;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const describedBy = [descriptionId, errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[13px] leading-4 font-semibold tracking-[0.005em] text-foreground">
        {label}
        {required ? (
          <span className="text-error" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
        {optionalLabel && !required ? (
          <span className="ml-1 font-normal text-tertiary">Optional</span>
        ) : null}
      </label>
      {description ? (
        <p id={descriptionId} className="text-[13px] leading-5 text-secondary">
          {description}
        </p>
      ) : null}
      <FormFieldContext.Provider value={{ id, describedBy, invalid: Boolean(error) }}>
        {children}
      </FormFieldContext.Provider>
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] leading-5 text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-[13px] leading-5 text-tertiary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
