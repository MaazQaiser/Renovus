"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Building2, FilterX, Plus } from "lucide-react";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { Button } from "@/components/primitives/Button";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { ViewMode } from "@/components/primitives/ViewToggle";
import { filterCompanies } from "@/data/companies";
import {
  createCompany,
  deleteCompany,
  getServerCompanies,
  listCompanies,
  subscribeToCompanies,
  updateCompany,
  type CompanyInput,
} from "@/lib/companies";
import { companyCoverage } from "@/lib/coverage";
import {
  assessmentCountFor,
  assessmentCountsByCompany,
  getServerRecords,
  listRecords,
  subscribeToRecords,
} from "@/lib/records";
import {
  getServerUiPrefs,
  getUiPrefs,
  setUiPref,
  subscribeToUiPrefs,
} from "@/lib/ui-prefs";
import type { Company } from "@/types/company";
import { CompaniesToolbar, ALL_SECTORS } from "./CompaniesToolbar";
import { CompanyFormDrawer } from "./CompanyFormDrawer";
import { CompaniesTable } from "./CompaniesTable";
import { CompanyManageCard } from "./CompanyManageCard";

export function CompaniesScreen() {
  const companies = useSyncExternalStore(
    subscribeToCompanies,
    listCompanies,
    getServerCompanies,
  );
  const prefs = useSyncExternalStore(subscribeToUiPrefs, getUiPrefs, getServerUiPrefs);
  const view: ViewMode = prefs.companiesView ?? "list";

  // Counted once per archive change rather than per card.
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);
  const assessmentCounts = useMemo(() => assessmentCountsByCompany(records), [records]);

  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<string>(ALL_SECTORS);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Company | undefined>();
  const [pendingDelete, setPendingDelete] = useState<Company | undefined>();

  const visible = useMemo(() => {
    const bySector =
      sector === ALL_SECTORS
        ? companies
        : companies.filter((company) => company.sector === sector);

    const searched = filterCompanies(bySector, query);

    // Always A–Z. Copy first: the store's array is a cached snapshot.
    return [...searched].sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, sector, query]);

  // Derived once per row rather than inside each card, so both views render
  // from the same numbers.
  const rows = useMemo(
    () =>
      visible.map((company) => ({
        company,
        assessmentCount: assessmentCountFor(assessmentCounts, company),
        coverage: companyCoverage(company, records),
      })),
    [visible, assessmentCounts, records],
  );

  const filtersActive = query.trim() !== "" || sector !== ALL_SECTORS;

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(company: Company) {
    setEditing(company);
    setFormOpen(true);
  }

  function clearFilters() {
    setQuery("");
    setSector(ALL_SECTORS);
  }

  function handleSubmit(input: CompanyInput) {
    if (editing) {
      updateCompany(editing.id, input);
    } else {
      createCompany(input);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 pt-8">
        <div>
          <Heading level={1} size="h1">
            PortCos
          </Heading>
          <Text tone="secondary" className="mt-1.5">
            The PortCos every agent can assess. Changes apply everywhere.
          </Text>
        </div>
        <Button variant="primary" leadingIcon={Plus} onClick={openCreate}>
          New PortCo
        </Button>
      </header>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No PortCos yet"
          description="Add a PortCo to make it selectable in the assessment and offshoring agents."
          action={
            <Button variant="primary" leadingIcon={Plus} onClick={openCreate}>
              New company
            </Button>
          }
        />
      ) : (
        <>
          <CompaniesToolbar
            query={query}
            onQueryChange={setQuery}
            sector={sector}
            onSectorChange={setSector}
            view={view}
            onViewChange={(next) => setUiPref("companiesView", next)}
          />

          {visible.length === 0 ? (
            <EmptyState
              icon={FilterX}
              size="sm"
              title="Nothing matches these filters"
              description="No PortCo matches this search and industry combination."
              action={
                <Button variant="secondary" onClick={clearFilters} disabled={!filtersActive}>
                  Clear filters
                </Button>
              }
            />
          ) : view === "grid" ? (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map(({ company, assessmentCount, coverage }) => (
                <li key={company.id} className="h-full">
                  <CompanyManageCard
                    company={company}
                    assessmentCount={assessmentCount}
                    coverage={coverage}
                    onEdit={openEdit}
                    onDelete={setPendingDelete}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <CompaniesTable rows={rows} onEdit={openEdit} onDelete={setPendingDelete} />
          )}
        </>
      )}

      <CompanyFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editing}
        onSubmit={handleSubmit}
      />

      <ConfirmationDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(next) => {
          if (!next) setPendingDelete(undefined);
        }}
        title="Delete this PortCo?"
        description={
          pendingDelete
            ? `${pendingDelete.name} will be removed from this device and will no longer be selectable in any agent. Saved assessments keep their own copy of the name. This cannot be undone.`
            : undefined
        }
        tone="danger"
        confirmLabel="Delete PortCo"
        cancelLabel="Keep PortCo"
        onConfirm={() => {
          if (pendingDelete) deleteCompany(pendingDelete.id);
          setPendingDelete(undefined);
        }}
      />
    </div>
  );
}
