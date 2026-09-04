"use client";

import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap rounded-control transition-[color,background-color,border-color,box-shadow] duration-[140ms] ease-[var(--ease-standard)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-inverse shadow-[var(--shadow-glass)] hover:bg-primary-hover hover:shadow-[var(--shadow-raised)] active:bg-primary-active active:shadow-[var(--shadow-glass)]",
        // Brand gold. The label is ink, not white: gold is far too light to
        // carry white text at any readable contrast.
        gold: "bg-gold text-primary shadow-[var(--shadow-glass)] hover:bg-gold-hover hover:shadow-[var(--shadow-raised)] active:bg-gold-active active:shadow-[var(--shadow-glass)]",
        // Frosted: translucent white over the page gradient, so the wash shows
        // through. backdrop-blur is what makes it read as glass rather than tint.
        secondary:
          "bg-glass-strong text-foreground border border-glass-border shadow-[var(--shadow-glass)] hover:bg-surface hover:border-border-strong hover:shadow-[var(--shadow-raised)]",
        glass:
          "bg-glass-quiet text-foreground border border-glass-border shadow-[var(--shadow-glass)] backdrop-blur-xl hover:bg-glass hover:shadow-[var(--shadow-raised)]",
        ghost:
          "bg-transparent text-secondary hover:bg-glass hover:text-foreground hover:backdrop-blur-xl",
        danger: "bg-error text-inverse shadow-[var(--shadow-glass)] hover:bg-error/90",
        link: "bg-transparent text-accent font-semibold hover:text-accent-hover hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] leading-5",
        md: "h-9 px-4 text-[13px] leading-5",
        lg: "h-11 px-5 text-[14px] leading-6",
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
  /**
   * A non-route destination — a file under /public, or another origin. Opens in
   * a new tab, and is not typed as a Route because it never resolves to one.
   */
  externalHref?: string;
  /**
   * Saves `externalHref` instead of opening it. Pass the filename to suggest,
   * or `true` to let the response's content-disposition name it.
   */
  download?: string | boolean;
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
  externalHref,
  download,
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

  if (externalHref && !disabled && !loading) {
    // A download stays in this tab: opening one in a new tab leaves a blank
    // window behind once the browser hands the file off.
    return (
      <a
        href={externalHref}
        {...(download === undefined
          ? { target: "_blank", rel: "noopener noreferrer" }
          : { download: download === true ? "" : download })}
        className={classes}
      >
        {content}
      </a>
    );
  }

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
