import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * The Renovus Capital lockup, rendered from the supplied brand PNG rather than
 * a hand-drawn SVG so the mark matches the corporate artwork exactly.
 *
 * Two cuts of the artwork are shipped: the full lockup and the `R`-over-gold
 * mark on its own, each with an inverse cut whose navy letterforms are lifted
 * to white. The gold block never changes — only the letterforms invert — so the
 * mark still reads on the dark sidebar and auth panel.
 */

const assets = {
  lockup: { src: "/brand/renovus-lockup.png", ratio: 340 / 76 },
  mark: { src: "/brand/renovus-mark.png", ratio: 87 / 76 },
} as const;

/** Rendered height, in px, of each cut at each size. */
const heights = {
  lockup: { sm: 24, md: 32, lg: 42 },
  mark: { sm: 22, md: 28, lg: 36 },
} as const;

export interface LogoProps {
  /** `mark` is the R over the gold block; `wordmark` and `lockup` are the full artwork. */
  variant?: "mark" | "wordmark" | "lockup";
  tone?: "default" | "inverse";
  size?: keyof (typeof heights)["lockup"];
  className?: string;
  /** Set on the above-the-fold lockup so the mark is not lazy-loaded. */
  priority?: boolean;
}

export function Logo({
  variant = "lockup",
  tone = "default",
  size = "md",
  className,
  priority,
}: LogoProps) {
  const cut = variant === "mark" ? "mark" : "lockup";
  const { src, ratio } = assets[cut];
  const height = heights[cut][size];
  const width = Math.round(height * ratio);

  return (
    <Image
      src={tone === "inverse" ? src.replace(".png", "-inverse.png") : src}
      alt="Renovus Capital"
      width={width}
      height={height}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
      /*
       * Both axes are pinned. Leaving either as `auto` lets a column flex
       * parent's default `align-items: stretch` blow the mark out to the
       * container width and distort it.
       */
      style={{ width, height }}
    />
  );
}
