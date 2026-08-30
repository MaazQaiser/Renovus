import { cn } from "@/lib/cn";

const sizes = {
  sm: { mark: 20, word: "text-[13px]", line: "text-[9px]", bar: "h-5 w-1" },
  md: { mark: 28, word: "text-base", line: "text-[10px]", bar: "h-7 w-1" },
  lg: { mark: 36, word: "text-xl", line: "text-[11px]", bar: "h-9 w-1" },
} as const;

export interface LogoProps {
  variant?: "mark" | "wordmark" | "lockup";
  tone?: "default" | "inverse";
  size?: keyof typeof sizes;
  className?: string;
}

export function Logo({
  variant = "lockup",
  tone = "default",
  size = "md",
  className,
}: LogoProps) {
  const scale = sizes[size];
  const ink = tone === "inverse" ? "text-inverse" : "text-foreground";

  const mark = (
    <span className="relative inline-flex items-center" aria-hidden>
      <span className={cn("mr-2 bg-highlight", scale.bar)} />
      <svg
        width={scale.mark}
        height={scale.mark}
        viewBox="0 0 32 32"
        fill="currentColor"
        className={ink}
      >
        <path d="M7 4h10.4c4.4 0 7.6 2.7 7.6 6.8 0 3.2-1.8 5.5-4.6 6.4L27 28h-6.2l-6.2-9.6H12.2V28H7V4zm5.2 5.2v5.6h4.4c2.1 0 3.4-1.2 3.4-2.8s-1.3-2.8-3.4-2.8H12.2z" />
      </svg>
    </span>
  );

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex items-center", className)} aria-label="Renovus">
        {mark}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", ink, className)}>
      {mark}
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold uppercase tracking-[0.08em]",
            scale.word,
          )}
        >
          Renovus
        </span>
        {variant === "lockup" ? (
          <span
            className={cn(
              "mt-1 font-sans font-semibold uppercase tracking-[0.16em] text-accent-muted",
              tone === "inverse" && "text-accent-border",
              scale.line,
            )}
          >
            AI Agents
          </span>
        ) : null}
      </span>
    </span>
  );
}
