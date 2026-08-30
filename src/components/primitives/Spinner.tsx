import { cn } from "@/lib/cn";

const sizes = {
  sm: "size-3.5 border-[1.5px]",
  md: "size-4 border-2",
  lg: "size-5 border-2",
} as const;

const tones = {
  inherit: "border-current border-t-transparent",
  inverse: "border-inverse/30 border-t-inverse",
  accent: "border-accent/30 border-t-accent",
} as const;

export interface SpinnerProps {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  label?: string;
  className?: string;
}

export function Spinner({
  size = "md",
  tone = "inherit",
  label = "Loading",
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={cn(
        "inline-block animate-spin rounded-full",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
