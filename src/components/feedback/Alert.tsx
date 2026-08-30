"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/primitives/IconButton";

const tones = {
  info: {
    wrap: "bg-info-subtle border-info-border text-foreground",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    wrap: "bg-success-subtle border-success-border text-foreground",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    wrap: "bg-warning-subtle border-warning-border text-foreground",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  error: {
    wrap: "bg-error-subtle border-error-border text-foreground",
    icon: "text-error",
    Icon: AlertCircle,
  },
} as const;

export interface AlertProps {
  tone?: keyof typeof tones;
  title?: string;
  children?: React.ReactNode;
  onDismiss?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function Alert({
  tone = "info",
  title,
  children,
  onDismiss,
  action,
  className,
}: AlertProps) {
  const config = tones[tone];
  const Icon = config.Icon;

  return (
    <div
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3",
        config.wrap,
        className,
      )}
    >
      <Icon size={20} strokeWidth={1.75} className={cn("mt-0.5 shrink-0", config.icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? (
          <p className="text-[13px] leading-5 font-semibold text-foreground">{title}</p>
        ) : null}
        {children ? (
          <div className={cn("text-[13px] leading-5 text-secondary", title && "mt-1")}>
            {children}
          </div>
        ) : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
      {onDismiss ? (
        <IconButton
          icon={X}
          label="Dismiss"
          size="sm"
          className="-mr-1 -mt-0.5"
          onClick={onDismiss}
        />
      ) : null}
    </div>
  );
}
