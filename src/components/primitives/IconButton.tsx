"use client";

import type { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-control transition-[color,background-color,border-color,box-shadow] duration-[140ms] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-inverse hover:bg-primary-hover",
        gold: "bg-gold text-primary hover:bg-gold-hover active:bg-gold-active",
        secondary:
          "bg-glass text-foreground border border-glass-border shadow-[var(--shadow-glass)] backdrop-blur-xl hover:bg-glass-strong",
        ghost: "bg-transparent text-secondary hover:bg-glass hover:text-foreground hover:backdrop-blur-xl",
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
