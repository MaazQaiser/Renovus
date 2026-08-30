import { cn } from "@/lib/cn";

export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  tone?: "default" | "subtle" | "inverse";
  label?: string;
  className?: string;
}

const toneClass = {
  default: "border-border",
  subtle: "border-border-subtle",
  inverse: "border-border-inverse",
} as const;

export function Divider({
  orientation = "horizontal",
  tone = "default",
  label,
  className,
}: DividerProps) {
  if (label) {
    return (
      <div className={cn("flex items-center gap-4", className)} role="separator">
        <span className={cn("h-px flex-1 border-t", toneClass[tone])} />
        <span className="text-[12px] leading-4 tracking-[0.01em] text-tertiary">
          {label}
        </span>
        <span className={cn("h-px flex-1 border-t", toneClass[tone])} />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        orientation === "horizontal" ? "h-px w-full border-t" : "h-full w-px border-l",
        toneClass[tone],
        className,
      )}
    />
  );
}
