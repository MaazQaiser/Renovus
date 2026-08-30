"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-md transition-colors duration-[120ms] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-inverse hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-surface-tertiary hover:border-border-strong",
        ghost: "bg-transparent text-secondary hover:bg-surface-secondary hover:text-foreground",
        danger: "bg-error text-inverse hover:bg-error/90",
        link: "bg-transparent text-accent font-semibold hover:text-accent-hover hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-[13px] leading-5",
        md: "h-10 px-4 text-[13px] leading-5",
        lg: "h-12 px-5 text-[15px] leading-6",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  href?: AppHref;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  href,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const iconSize = size === "lg" ? 18 : 16;
  const classes = cn(buttonVariants({ variant, size, fullWidth }), className);
  const content = (
    <>
      {loading ? (
        <Spinner size={size === "sm" ? "sm" : "md"} label="" />
      ) : LeadingIcon ? (
        <LeadingIcon size={iconSize} strokeWidth={1.75} aria-hidden />
      ) : null}
      <span>{children}</span>
      {TrailingIcon && !loading ? (
        <TrailingIcon size={iconSize} strokeWidth={1.75} aria-hidden />
      ) : null}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
}
