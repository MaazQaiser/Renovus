import { cn } from "@/lib/cn";

const sizes = {
  display:
    "font-display text-[32px] leading-[38px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[44px]",
  h1: "font-display text-2xl leading-[30px] font-semibold tracking-[-0.015em] md:text-[30px] md:leading-9",
  h2: "font-display text-2xl leading-[30px] font-semibold tracking-[-0.01em]",
  h3: "font-display text-lg leading-6 font-semibold tracking-[-0.005em]",
} as const;

const tones = {
  primary: "text-foreground",
  inverse: "text-inverse",
  secondary: "text-secondary",
} as const;

export interface HeadingProps extends React.ComponentProps<"h1"> {
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
}

export function Heading({
  level = 1,
  size,
  tone = "primary",
  className,
  ...props
}: HeadingProps) {
  const Comp = (`h${level}` as const);
  const resolvedSize = size ?? (level === 1 ? "h1" : level === 2 ? "h2" : "h3");

  return (
    <Comp
      className={cn(sizes[resolvedSize], tones[tone], className)}
      {...props}
    />
  );
}
