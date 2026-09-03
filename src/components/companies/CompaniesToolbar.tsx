"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/forms/Input";
import { Select } from "@/components/forms/Select";
import { IconButton } from "@/components/primitives/IconButton";
import { ViewToggle, type ViewMode } from "@/components/primitives/ViewToggle";
import { cn } from "@/lib/cn";
import { SECTORS } from "@/lib/companies";

export const ALL_SECTORS = "__all__";

export interface CompaniesToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  sector: string;
  onSectorChange: (value: string) => void;
  view: ViewMode;
  onViewChange: (value: ViewMode) => void;
}

/**
 * One row: search, sector filter, count, view toggle. The search field is built
 * inline rather than with SearchInput, whose visible FormField label would force
 * a second row.
 */
export function CompaniesToolbar({
  query,
  onQueryChange,
  sector,
  onSectorChange,
  view,
  onViewChange,
}: CompaniesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[200px] flex-1">
        <label htmlFor="companies-search" className="sr-only">
          Search companies
        </label>
        <Input
          id="companies-search"
          type="search"
          value={query}
          placeholder="Search by name or industry"
          leadingIcon={Search}
          autoComplete="off"
          className={cn(
            query && "pr-10",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query ? (
          <IconButton
            icon={X}
            label="Clear search"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => onQueryChange("")}
          />
        ) : null}
      </div>

      <label htmlFor="companies-sector" className="sr-only">
        Filter by industry
      </label>
      <Select
        id="companies-sector"
        className="w-auto shrink-0"
        value={sector}
        onChange={(event) => onSectorChange(event.target.value)}
        options={[
          { value: ALL_SECTORS, label: "All industries" },
          ...SECTORS.map((item) => ({ value: item, label: item })),
        ]}
      />

      <ViewToggle value={view} onChange={onViewChange} className="shrink-0" />
    </div>
  );
}
