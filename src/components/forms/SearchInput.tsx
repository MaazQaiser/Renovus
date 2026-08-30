"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { cn } from "@/lib/cn";
import { Input, type InputProps } from "./Input";
import { FormField } from "./FormField";

export interface SearchInputProps extends Omit<InputProps, "type" | "leadingIcon" | "trailingIcon"> {
  label?: string;
  debounceMs?: number;
  onDebouncedChange?: (value: string) => void;
}

export function SearchInput({
  label = "Search",
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 200,
  placeholder = "Search",
  className,
  ...props
}: SearchInputProps) {
  const [inner, setInner] = useState(typeof value === "string" ? value : "");
  const current = typeof value === "string" ? value : inner;

  useEffect(() => {
    if (!onDebouncedChange) return;
    const timer = window.setTimeout(() => onDebouncedChange(current), debounceMs);
    return () => window.clearTimeout(timer);
  }, [current, debounceMs, onDebouncedChange]);

  return (
    <FormField label={label} className={className}>
      <div className="relative">
        <Input
          type="search"
          value={current}
          placeholder={placeholder}
          leadingIcon={Search}
          autoComplete="off"
          className={cn(current && "pr-10", "[&::-webkit-search-cancel-button]:appearance-none")}
          onChange={(event) => {
            setInner(event.target.value);
            onChange?.(event);
          }}
          {...props}
        />
        {current ? (
          <IconButton
            icon={X}
            label="Clear search"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => {
              const event = {
                target: { value: "" },
              } as React.ChangeEvent<HTMLInputElement>;
              setInner("");
              onChange?.(event);
              onDebouncedChange?.("");
            }}
          />
        ) : null}
      </div>
    </FormField>
  );
}
