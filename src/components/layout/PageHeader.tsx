import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { BackButton } from "@/components/navigation/BackButton";
import { Breadcrumb, type BreadcrumbItem } from "@/components/navigation/Breadcrumb";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  backHref?: AppHref;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  backHref,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", className)}>
      {breadcrumb ? <Breadcrumb items={breadcrumb} className="hidden md:block" /> : null}
      {backHref ? <BackButton href={backHref} /> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <Text size="overline" tone="secondary" className="mb-2">
              {eyebrow}
            </Text>
          ) : null}
          <Heading level={1} size="h1">
            {title}
          </Heading>
          {description ? (
            <Text tone="secondary" className="mt-2 max-w-[65ch]">
              {description}
            </Text>
          ) : null}
          {meta ? <div className="mt-3">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </div>
    </header>
  );
}
