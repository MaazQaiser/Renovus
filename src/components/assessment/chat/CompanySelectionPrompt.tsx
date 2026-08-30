"use client";

import { useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { companies as seedCompanies } from "@/data/companies";
import { StageComposer } from "@/components/interview/StageComposer";
import { Text } from "@/components/primitives/Text";
import {
  addCustomCompany,
  CUSTOM_COMPANIES_EVENT,
  listAssessmentCompanies,
} from "@/lib/assessment/custom-companies";

export interface CompanySelectionPromptProps {
  onSelect: (companyId: string, companyName: string) => void;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CUSTOM_COMPANIES_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CUSTOM_COMPANIES_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return listAssessmentCompanies(seedCompanies);
}

function getServerSnapshot() {
  return seedCompanies;
}

export function CompanySelectionPrompt({ onSelect }: CompanySelectionPromptProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const companies = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const submitNew = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const record = addCustomCompany(trimmed);
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
            className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:border-accent hover:bg-accent-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-surface-tertiary text-[13px] font-semibold text-secondary transition-colors group-hover:bg-accent group-hover:text-inverse">
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
            className="flex flex-col items-start gap-2 rounded-lg border border-dashed border-border p-4 text-left text-secondary transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex size-9 items-center justify-center rounded-md border border-border bg-surface-tertiary">
              <Plus size={16} strokeWidth={1.75} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold leading-5">Add new company</span>
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
