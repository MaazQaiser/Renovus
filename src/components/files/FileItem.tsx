import { FileSpreadsheet, FileText, X } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { formatFileSize } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { UploadedFile } from "@/types/file";
import { UploadProgress } from "./UploadProgress";

export interface FileItemProps {
  file: UploadedFile;
  onRemove: (id: string) => void;
  className?: string;
}

function statusLabel(file: UploadedFile): string {
  switch (file.status) {
    case "uploading":
    case "pending":
      return "Uploading";
    case "complete":
      return "Attached";
    case "restored":
      return "Previously attached";
    case "error":
      return file.error ?? "Could not attach";
  }
}

export function FileItem({ file, onRemove, className }: FileItemProps) {
  const spreadsheet = ["xls", "xlsx", "csv"].includes(file.extension);
  const Icon = spreadsheet ? FileSpreadsheet : FileText;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-control border border-glass-border bg-glass px-3 py-2.5 backdrop-blur-xl",
        file.status === "error" && "border-error-border bg-error-subtle",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm bg-surface-tertiary text-secondary">
          <Icon size={16} strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <Text size="body-sm" weight="semibold" className="truncate">
            {file.name}
          </Text>
          <Text size="caption" tone={file.status === "error" ? "error" : "tertiary"}>
            {formatFileSize(file.size)} · {statusLabel(file)}
          </Text>
        </div>
        <IconButton
          icon={X}
          label={`Remove ${file.name}`}
          size="sm"
          variant="ghost"
          onClick={() => onRemove(file.id)}
        />
      </div>
      <UploadProgress progress={file.progress} status={file.status} />
    </div>
  );
}
