import { cn } from "@/lib/cn";

export interface CaptureProgressBarProps {
  percent: number;
  className?: string;
}

export function CaptureProgressBar({ percent, className }: CaptureProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="Assessment capture progress"
      >
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-300 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <span className="shrink-0 text-xs leading-4 font-semibold tabular-nums text-secondary">
        {clamped}%
      </span>
    </div>
  );
}
