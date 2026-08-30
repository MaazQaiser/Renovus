import { Check } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { VisuallyHidden } from "@/components/primitives/VisuallyHidden";
import { CompanyAvatar } from "./CompanyAvatar";
import type { Company } from "@/types/company";

export interface CompanyCardProps {
  company: Company;
  selected?: boolean;
  onSelect?: (company: Company) => void;
  tabIndex?: number;
}

export function CompanyCard({ company, selected = false, onSelect, tabIndex }: CompanyCardProps) {
  return (
    <Card
      interactive
      selected={selected}
      padding="compact"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      aria-label={`${company.name}, ${company.sector}`}
      onClick={() => onSelect?.(company)}
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar company={company} />
        <div className="min-w-0 flex-1">
          <Heading level={3} size="h3">
            {company.name}
          </Heading>
          <Text size="caption" tone="tertiary" className="mt-1">
            {company.sector}
          </Text>
          <Text size="body-sm" tone="secondary" className="mt-2" clamp={2}>
            {company.description}
          </Text>
        </div>
        <span
          className={
            selected
              ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-inverse"
              : "size-6 shrink-0 rounded-full border border-border"
          }
          aria-hidden
        >
          {selected ? <Check size={14} strokeWidth={2.25} /> : null}
        </span>
      </div>
      {selected ? <VisuallyHidden>Selected</VisuallyHidden> : null}
    </Card>
  );
}
