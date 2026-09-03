"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { StageComposer } from "@/components/interview/StageComposer";
import { Text } from "@/components/primitives/Text";
import {
  createCompanyFromName,
  getServerCompanies,
  listCompanies,
  subscribeToCompanies,
} from "@/lib/companies";

export interface CompanySelectionPromptProps {
  onSelect: (companyId: string, companyName: string) => void;
}

export function CompanySelectionPrompt({ onSelect }: CompanySelectionPromptProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const companies = useSyncExternalStore(
    subscribeToCompanies,
    listCompanies,
    getServerCompanies,
  );

  const submitNew = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const record = createCompanyFromName(trimmed);
    setName("");
    setAdding(false);
    onSelect(record.id, record.name);
  };

  return (
    <div className="flex flex-col gap-4">
      <Text size="body-sm" tone="secondary">
        Select a portfolio company to begin.
      </Text>

      {/* A grid of cards rather than the lettered list used for question
          options — this is a picker, not an A/B/C answer. */}
      <div className="grid max-h-[46vh] gap-3 overflow-y-auto sm:grid-cols-2">
        {companies.map((company) => (
          <button
            key={company.id}
            type="button"
            onClick={() => onSelect(company.id, company.name)}
            className="group flex flex-col items-start gap-2 rounded-xl border border-glass-border bg-glass p-4 text-left shadow-[var(--shadow-glass)] backdrop-blur-3xl transition-[box-shadow,background-color,border-color] hover:border-accent hover:bg-glass-strong hover:shadow-[var(--shadow-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-glass-border bg-glass-quiet text-[13px] font-semibold text-secondary transition-colors group-hover:bg-accent group-hover:text-inverse">
              {company.initials}
            </span>
            <span className="text-[15px] font-semibold leading-5 text-foreground">
              {company.name}
            </span>
            <span className="text-[12px] leading-4 text-tertiary">{company.sector}</span>
          </button>
        ))}

        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-300 bg-glass-quiet p-4 text-left text-secondary backdrop-blur-3xl transition-[box-shadow,background-color,border-color] hover:border-slate-400 hover:bg-glass hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex size-9 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-glass-quiet">
              <Plus size={16} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold leading-5">Add new PortCo</span>
            <span className="text-[12px] leading-4 text-tertiary">Not in the portfolio list</span>
          </button>
        ) : null}
      </div>

      {adding ? (
        <div className="flex flex-col gap-2">
          <Text size="caption" tone="secondary">
            New company name
          </Text>
          <StageComposer
            value={name}
            onChange={setName}
            onSend={submitNew}
            supportsSpeech={false}
            sendDisabled={name.trim().length === 0}
            placeholder="e.g. Atlas Manufacturing"
          />
        </div>
      ) : null}
    </div>
  );
}
