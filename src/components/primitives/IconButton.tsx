"use client";

import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors duration-[120ms] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-inverse hover:bg-primary-hover",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-surface-tertiary hover:border-border-strong",
        ghost: "bg-transparent text-secondary hover:bg-surface-secondary hover:text-foreground",
        danger: "bg-error text-inverse hover:bg-error/90",
      },
      size: {
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  label: string;
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  variant,
  size,
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  const iconSize = size === "lg" ? 20 : size === "sm" ? 16 : 18;

  return (
    <button
      type={type}
      className={cn(iconButtonVariants({ variant, size }), className)}
      aria-label={label}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={label}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" label="" />
      ) : (
        <Icon size={iconSize} strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
