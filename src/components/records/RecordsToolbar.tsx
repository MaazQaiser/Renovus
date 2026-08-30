"use client";

import { ChevronDown } from "lucide-react";
import { Text } from "@/components/primitives/Text";
import { ViewToggle, type ViewMode } from "@/components/primitives/ViewToggle";
import { cn } from "@/lib/cn";
import type { AssessmentRecordAgent } from "@/types/record";

export type AgentFilter = "all" | AssessmentRecordAgent;

export const ALL_COMPANIES = "__all__";

export interface RecordsToolbarProps {
  agent: AgentFilter;
  onAgentChange: (agent: AgentFilter) => void;
  /** Tab counts, computed before the company filter is applied. */
  counts: Record<AgentFilter, number>;
  company: string;
  onCompanyChange: (company: string) => void;
  companies: string[];
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  resultLabel: string;
}

const AGENT_TABS: { id: AgentFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sales", label: "Sales" },
  { id: "offshoring", label: "Offshoring" },
];

export function RecordsToolbar({
  agent,
  onAgentChange,
  counts,
  company,
  onCompanyChange,
  companies,
  view,
  onViewChange,
  resultLabel,
}: RecordsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="Filter by agent"
        className="flex gap-5 border-b border-border"
      >
        {AGENT_TABS.map((tab) => {
          const active = agent === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onAgentChange(tab.id)}
              className={cn(
                "flex h-10 items-center gap-2 border-b-2 text-[13px] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                active
                  ? "border-accent font-semibold text-foreground"
                  : "border-transparent font-medium text-secondary hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                  active ? "bg-accent-subtle text-accent" : "bg-surface-tertiary text-tertiary",
                )}
              >
                {counts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label htmlFor="records-company" className="sr-only">
            Filter by company
          </label>
          <div className="relative">
            <select
              id="records-company"
              value={company}
              onChange={(event) => onCompanyChange(event.target.value)}
              className="h-9 appearance-none rounded-md border border-border bg-surface py-0 pl-3 pr-9 text-[13px] font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value={ALL_COMPANIES}>All companies</option>
              {companies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={2}
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-tertiary"
            />
          </div>

          <Text size="body-sm" tone="tertiary">
            {resultLabel}
          </Text>
        </div>

        <ViewToggle value={view} onChange={onViewChange} />
      </div>
    </div>
  );
}
