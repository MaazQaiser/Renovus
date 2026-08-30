import { cn } from "@/lib/cn";

export interface ButtonGroupProps {
  children: React.ReactNode;
  align?: "start" | "end" | "between";
  stackOn?: "sm" | "md" | "none";
  reverseOnStack?: boolean;
  className?: string;
}

const alignClass = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
} as const;

export function ButtonGroup({
  children,
  align = "end",
  stackOn = "sm",
  reverseOnStack = true,
  className,
}: ButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-3",
        alignClass[align],
        stackOn === "sm" && "flex-col sm:flex-row",
        stackOn === "md" && "flex-col md:flex-row",
        stackOn === "none" && "flex-row",
        reverseOnStack && stackOn === "sm" && "flex-col-reverse sm:flex-row",
        reverseOnStack && stackOn === "md" && "flex-col-reverse md:flex-row",
        className,
      )}
    >
      {children}
    </div>
  );
}
