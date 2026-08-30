import { cn } from "@/lib/cn";

const sizes = {
  body: "text-[15px] leading-6",
  "body-sm": "text-[13px] leading-5",
  label: "text-[13px] leading-4 font-semibold tracking-[0.005em]",
  caption: "text-xs leading-4 tracking-[0.01em]",
  overline:
    "text-[11px] leading-4 font-semibold uppercase tracking-[0.08em]",
} as const;

const tones = {
  primary: "text-foreground",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  inverse: "text-inverse",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
} as const;

const weights = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
} as const;

export interface TextProps extends React.ComponentProps<"p"> {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  weight?: keyof typeof weights;
  as?: "p" | "span" | "div";
  clamp?: number;
}

export function Text({
  size = "body",
  tone = "primary",
  weight,
  as: Comp = "p",
  clamp,
  className,
  ...props
}: TextProps) {
  return (
    <Comp
      className={cn(
        sizes[size],
        tones[tone],
        weight ? weights[weight] : size === "label" || size === "overline" ? undefined : "font-normal",
        clamp ? `line-clamp-${clamp}` : undefined,
        className,
      )}
      {...props}
    />
  );
}
