import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

export interface ContentSectionProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  headingLevel?: 2 | 3;
  divided?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({
  title,
  description,
  actions,
  headingLevel = 2,
  divided,
  children,
  className,
}: ContentSectionProps) {
  return (
    <section
      className={cn(
        "mt-10",
        divided && "border-t border-border pt-10",
        className,
      )}
    >
      {title || actions ? (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title ? (
              <Heading level={headingLevel} size={headingLevel === 2 ? "h2" : "h3"}>
                {title}
              </Heading>
            ) : null}
            {description ? (
              <Text tone="secondary" className="mt-2 max-w-[65ch]">
                {description}
              </Text>
            ) : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}
