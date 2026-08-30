import { cn } from "@/lib/cn";
import type { UploadStatus } from "@/types/file";

export interface UploadProgressProps {
  progress: number;
  status: UploadStatus;
  className?: string;
}

export function UploadProgress({ progress, status, className }: UploadProgressProps) {
  if (status !== "uploading" && status !== "pending") return null;

  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-full bg-surface-tertiary", className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-accent transition-[width] duration-150"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
