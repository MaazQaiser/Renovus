import { cn } from "@/lib/cn";

const widths = {
  default: "max-w-[1200px]",
  narrow: "max-w-[720px]",
  full: "max-w-none",
} as const;

export interface PageContainerProps {
  width?: keyof typeof widths;
  padded?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PageContainer({
  width = "default",
  padded = true,
  className,
  children,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        widths[width],
        padded && "px-8 py-6 md:py-8 xl:py-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
