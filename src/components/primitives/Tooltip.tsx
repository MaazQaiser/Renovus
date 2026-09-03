"use client";

import { cloneElement, isValidElement, useId, useState } from "react";
import { cn } from "@/lib/cn";

type Placement = "top" | "bottom";

export interface TooltipProps {
  /** Tooltip body. Keep it to a short phrase or two. */
  content: React.ReactNode;
  placement?: Placement;
  /** Stretch the trigger wrapper to fill its container. */
  block?: boolean;
  className?: string;
  children: React.ReactNode;
}

const placements: Record<Placement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-2",
  bottom: "top-full left-1/2 -translate-x-1/2 translate-y-2",
};

/**
 * Lightweight tooltip. Opens on hover and on keyboard focus, closes on Escape,
 * and points aria-describedby at the trigger element itself so screen readers
 * announce it on focus rather than it being hover-only decoration.
 */
export function Tooltip({
  content,
  placement = "top",
  block = false,
  className,
  children,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const describedBy = open ? id : undefined;

  // The focusable element is the caller's child, so the description has to land
  // on that element — a wrapper around it is not announced on focus.
  const trigger = isValidElement<{ "aria-describedby"?: string }>(children)
    ? cloneElement(children, { "aria-describedby": describedBy })
    : (
        <span aria-describedby={describedBy} className={block ? "block" : undefined}>
          {children}
        </span>
      );

  return (
    <span
      className={cn("relative", block ? "block" : "inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {trigger}

      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cn(
            "pointer-events-none absolute z-50 w-max max-w-[260px] rounded-lg px-2.5 py-1.5",
            "bg-surface-inverse text-[12px] leading-[1.45] font-normal text-inverse",
            "shadow-[var(--shadow-raised)]",
            placements[placement],
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
