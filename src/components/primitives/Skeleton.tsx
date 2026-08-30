import { cn } from "@/lib/cn";

export interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string;
  height?: string;
  lines?: number;
  className?: string;
}

export function Skeleton({
  variant = "rect",
  width,
  height,
  lines = 1,
  className,
}: SkeletonProps) {
  if (variant === "text" && lines > 1) {
    return (
      <span className={cn("flex flex-col gap-2", className)} aria-hidden>
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className="block h-3 animate-pulse rounded-sm bg-border"
            style={{ width: index === lines - 1 ? "68%" : width }}
          />
        ))}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "block animate-pulse bg-border",
        variant === "circle" ? "rounded-full" : "rounded-sm",
        variant === "text" && "h-3",
        className,
      )}
      style={{ width, height }}
    />
  );
}
