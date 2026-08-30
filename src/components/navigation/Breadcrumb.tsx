import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AppHref } from "@/lib/routes";

export interface BreadcrumbItem {
  label: string;
  href?: AppHref;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1 text-[13px] leading-5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight size={14} strokeWidth={1.75} className="text-tertiary" aria-hidden />
              ) : null}
              {item.href && !last ? (
                <Link href={item.href} className="text-secondary hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(last ? "font-semibold text-foreground" : "text-secondary")}
                  aria-current={last ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
