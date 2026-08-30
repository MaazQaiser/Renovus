"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/IconButton";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: keyof typeof sizes;
  footer?: React.ReactNode;
  dismissible?: boolean;
  children?: React.ReactNode;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = "md",
  footer,
  dismissible = true,
  children,
}: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-overlay"
        aria-label="Close dialog"
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
          "relative z-10 flex w-full flex-col rounded-t-xl bg-surface shadow-lg sm:rounded-xl",
          "max-h-[90vh] overflow-y-auto p-6",
          sizes[size],
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <Heading level={2} size="h3" id={titleId}>
              {title}
            </Heading>
            {description ? (
              <Text id={descriptionId} size="body-sm" tone="secondary" className="mt-2">
                {description}
              </Text>
            ) : null}
          </div>
          {dismissible ? (
            <IconButton icon={X} label="Close" size="sm" onClick={() => onOpenChange(false)} />
          ) : null}
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
}
