import Link from "next/link";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

const paddings = {
  none: "",
  compact: "p-5",
  default: "p-6",
} as const;

const tones = {
  default: "bg-surface border-border",
  subtle: "bg-surface-tertiary border-border-subtle",
  inverse: "bg-surface-inverse border-border-inverse text-inverse",
} as const;

export interface CardProps extends Omit<React.ComponentProps<"div">, "onClick"> {
  padding?: keyof typeof paddings;
  interactive?: boolean;
  selected?: boolean;
  tone?: keyof typeof tones;
  href?: AppHref;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Card({
  padding = "default",
  interactive = false,
  selected = false,
  tone = "default",
  href,
  className,
  children,
  onClick,
  role,
  tabIndex,
  ...props
}: CardProps) {
  const classes = cn(
    "rounded-lg border",
    paddings[padding],
    tones[tone],
    selected &&
      "border-accent bg-accent-subtle shadow-[inset_0_0_0_1px_var(--color-accent)]",
    interactive &&
      "transition-shadow duration-[120ms] ease-[var(--ease-standard)] hover:shadow-md",
    interactive && !selected && "hover:border-border-strong",
    interactive && selected && "hover:border-accent",
    interactive && "cursor-pointer",
    className,
  );
  const labelled = {
    role,
    tabIndex,
    "aria-checked": props["aria-checked"],
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
  };

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  if (interactive) {
    return (
      <button
        type="button"
        className={cn(classes, "w-full text-left")}
        onClick={onClick}
        {...labelled}
      >
        {children}
      </button>
    );
  }

  return (
    <div className={classes} role={role} tabIndex={tabIndex} {...props}>
      {children}
    </div>
  );
}
