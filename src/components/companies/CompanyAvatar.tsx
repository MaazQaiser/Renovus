import { cn } from "@/lib/cn";
import { getCompanyInitials } from "@/data/companies";
import type { Company } from "@/types/company";

const tints = [
  "bg-accent-subtle text-accent",
  "bg-info-subtle text-info",
  "bg-success-subtle text-success",
  "bg-warning-subtle text-warning",
] as const;

function tintForId(id: string): string {
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return tints[hash % tints.length];
}

const sizes = {
  sm: "size-8 text-[11px]",
  md: "size-10 text-[13px]",
  lg: "size-12 text-[15px]",
} as const;

export interface CompanyAvatarProps {
  company: Company;
  size?: keyof typeof sizes;
  className?: string;
}

export function CompanyAvatar({ company, size = "md", className }: CompanyAvatarProps) {
  if (company.logoUrl) {
    return (
      // Plain img, not next/image: the source is a data URL already sized to
      // 128px, and the optimizer would flatten transparency onto white.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={company.logoUrl}
        alt=""
        aria-hidden
        className={cn(
          "shrink-0 rounded-md border border-glass-border bg-glass object-contain",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-display font-semibold",
        sizes[size],
        tintForId(company.id),
        className,
      )}
    >
      {getCompanyInitials(company)}
    </span>
  );
}
