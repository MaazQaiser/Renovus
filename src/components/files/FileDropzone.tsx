"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";
import { UPLOAD_ACCEPT, UPLOAD_LIMITS } from "@/types/file";

export interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  label?: string;
  activeLabel?: string;
  /**
   * The line under the label. Defaults to the full accepted-type list, which
   * would otherwise contradict a caller that narrows `accept`.
   */
  hint?: React.ReactNode;
  className?: string;
}

export function FileDropzone({
  onFilesAdded,
  accept = UPLOAD_ACCEPT,
  maxSize = UPLOAD_LIMITS.maxFileSizeBytes,
  maxFiles = UPLOAD_LIMITS.maxFiles,
  disabled = false,
  label = "Drop the payroll sheet here, or browse",
  activeLabel = "Drop to attach",
  hint,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);

  const add = (list: FileList | File[] | null) => {
    if (!list || disabled) return;
    const files = Array.from(list).slice(0, maxFiles);
    if (files.length === 0) return;
    onFilesAdded(files);
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={label}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onKeyDown={(event) => {
        if (disabled) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setActive(false);
        add(event.dataTransfer.files);
      }}
      className={cn(
        "flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-5 text-center transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-accent bg-accent-subtle"
          : "border-border bg-surface hover:border-border-strong",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <Upload size={18} strokeWidth={1.75} className="text-accent-muted" aria-hidden />
      <Text size="body-sm" weight="semibold">
        {active ? activeLabel : label}
      </Text>
      <Text size="caption" tone="tertiary">
        {hint ?? (
          <>
            PDF, Word, Excel, CSV, PowerPoint, or TXT · up to{" "}
            {Math.round(maxSize / (1024 * 1024))} MB
          </>
        )}
      </Text>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          add(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
