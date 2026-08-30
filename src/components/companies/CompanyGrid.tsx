import { Building2 } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Skeleton } from "@/components/primitives/Skeleton";
import { Alert } from "@/components/feedback/Alert";
import { EmptyState } from "@/components/feedback/EmptyState";
import { CompanyCard } from "./CompanyCard";
import type { Company } from "@/types/company";

export interface CompanyGridProps {
  companies: Company[];
  selectedId?: string;
  onSelect?: (company: Company) => void;
  loading?: boolean;
  error?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

function CompanyCardSkeleton() {
  return (
    <Card padding="compact" className="flex items-start gap-3">
      <Skeleton variant="rect" className="size-10 rounded-md" />
      <div className="min-w-0 flex-1">
        <Skeleton variant="rect" className="h-5 w-40" />
        <Skeleton variant="text" className="mt-2 w-24" />
        <Skeleton variant="text" lines={2} className="mt-3" />
      </div>
    </Card>
  );
}

export function CompanyGrid({
  companies,
  selectedId,
  onSelect,
  loading = false,
  error,
  emptyTitle = "No companies found",
  emptyDescription = "Try a different company name or search term.",
}: CompanyGridProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-busy="true"
        aria-label="Loading companies"
      >
        <CompanyCardSkeleton />
        <CompanyCardSkeleton />
        <CompanyCardSkeleton />
        <CompanyCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="error" title="Unable to load companies">
        {error}
      </Alert>
    );
  }

  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title={emptyTitle}
        description={emptyDescription}
        size="sm"
      />
    );
  }

  const selectedIndex = companies.findIndex((company) => company.id === selectedId);
  const activeIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <div
      role="radiogroup"
      aria-label="Portfolio companies"
      className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      onKeyDown={(event) => {
        if (!onSelect) return;
        const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = (activeIndex + delta + companies.length) % companies.length;
        onSelect(companies[nextIndex]);
        const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
        radios[nextIndex]?.focus();
      }}
    >
      {companies.map((company, index) => (
        <CompanyCard
          key={company.id}
          company={company}
          selected={company.id === selectedId}
          onSelect={onSelect}
          tabIndex={index === activeIndex ? 0 : -1}
        />
      ))}
    </div>
  );
}
