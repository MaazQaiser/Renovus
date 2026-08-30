"use client";

import { useMemo, useState } from "react";
import { filterCompanies } from "@/data/companies";
import { SearchInput } from "@/components/forms/SearchInput";
import { CompanyGrid } from "./CompanyGrid";
import type { Company } from "@/types/company";

export interface CompanySelectorProps {
  companies: Company[];
  value?: string;
  onChange: (company: Company) => void;
  loading?: boolean;
  error?: string;
}

export function CompanySelector({
  companies,
  value,
  onChange,
  loading = false,
  error,
}: CompanySelectorProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => filterCompanies(companies, query), [companies, query]);

  return (
    <div className="flex flex-col gap-6">
      <SearchInput
        label="Search companies"
        placeholder="Search companies"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <CompanyGrid
        companies={visible}
        selectedId={value}
        onSelect={onChange}
        loading={loading}
        error={error}
        emptyTitle={query.trim() ? "No companies found" : "No companies available"}
        emptyDescription={
          query.trim()
            ? "Try a different company name or search term."
            : "No portfolio companies are configured for this workspace."
        }
      />
    </div>
  );
}
