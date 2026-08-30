"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/IconButton";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

const widths = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
} as const;

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: "right" | "left";
  size?: keyof typeof widths;
  footer?: React.ReactNode;
  dismissible?: boolean;
  children?: React.ReactNode;
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = "right",
  size = "md",
  footer,
  dismissible = true,
  children,
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && dismissible) {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open, dismissible, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        aria-label="Close panel"
        onClick={() => {
          if (dismissible) onOpenChange(false);
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex h-full w-full flex-col bg-surface shadow-lg",
          "animate-in fade-in duration-150",
          side === "right" ? "ml-auto border-l border-border" : "mr-auto border-r border-border",
          widths[size],
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <Heading level={2} size="h3" id={titleId}>
              {title}
            </Heading>
            {description ? (
              <Text id={descriptionId} size="body-sm" tone="secondary" className="mt-1">
                {description}
              </Text>
            ) : null}
          </div>
          {dismissible ? (
            <IconButton icon={X} label="Close" size="sm" onClick={() => onOpenChange(false)} />
          ) : null}
        </div>

        {children ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        ) : null}

        {footer ? (
          <div className="flex shrink-0 justify-end gap-3 border-t border-border px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
