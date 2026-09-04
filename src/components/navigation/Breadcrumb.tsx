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
      {/* Scrolls rather than wrapping or truncating: on a narrow window the
          trail is the only way back, so every crumb has to stay reachable. */}
      <ol className="flex items-center gap-1 overflow-x-auto whitespace-nowrap text-[13px] leading-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight size={14} strokeWidth={1.75} className="text-tertiary" aria-hidden />
              ) : null}
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="rounded-sm text-secondary transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
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
