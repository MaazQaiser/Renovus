import type { Company, CompanyStage, Sector } from "@/types/company";
import { companies as seedCompanies } from "@/data/companies";
import {
  customCompanyToCompany,
  listCustomCompanies,
} from "@/lib/assessment/custom-companies";
import { readStorage, storageKeys, writeStorage } from "./storage";

const COMPANIES_EVENT = "renovers:companies";

// One flat array under a single key, unlike lib/records.ts's id-index + entry
// split: the roster is small and always read whole, so the index earns nothing.
let snapshotCache: { raw: string | null; value: Company[] } = {
  raw: null,
  value: seedCompanies,
};

/** Fields a company can be created or edited with. `id` is derived, never entered. */
export type CompanyInput = Omit<Company, "id">;

export const STAGES: CompanyStage[] = [
  "Not started",
  "Assessing",
  "Baseline",
  "Roadmap defined",
  "Implementation",
];

export const SECTORS: Sector[] = [
  "Education",
  "Healthcare Services",
  "Technology Services",
  "Professional Services",
];

function emitCompaniesChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMPANIES_EVENT));
}

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "company";
}

function uniqueId(name: string, taken: Company[]): string {
  const base = slugify(name);
  let id = base;
  let suffix = 2;
  while (taken.some((company) => company.id === id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/**
 * Bumped whenever data/companies.ts gains a field that already-stored rosters
 * predate. Revision 1 added the portfolio logos.
 */
const SEED_REVISION = 4;

/**
 * Seed companies dropped from data/companies.ts. Removing the entry alone would
 * leave it in every roster already in storage, and there is no way to tell a
 * retired seed from a company the user added — so name them explicitly. Only
 * these exact ids are pruned.
 */
const RETIRED_SEED_IDS = new Set(["dataserve"]);

/**
 * First read with nothing stored seeds from data/companies.ts and folds in any
 * companies added through the old name-only picker, so upgrading loses nothing.
 */
function seedInitialCompanies(): Company[] {
  const seedIds = new Set(seedCompanies.map((company) => company.id));
  const migrated = listCustomCompanies()
    .filter((record) => !seedIds.has(record.id))
    .map(customCompanyToCompany);

  const merged = [...seedCompanies, ...migrated];
  writeStorage(storageKeys.companies, merged);
  writeStorage(storageKeys.companiesSeedRevision, SEED_REVISION);
  return merged;
}

/**
 * A roster stored before the current revision is missing that revision's seed
 * fields, and nothing else would ever backfill them — listCompanies only seeds
 * when storage is empty. Backfill once and record the revision, rather than
 * merging on every read: a logo the user removed by hand must stay removed.
 */
function upgradeStoredSeeds(stored: Company[]): Company[] {
  const revision = readStorage<number>(storageKeys.companiesSeedRevision) ?? 0;
  if (revision >= SEED_REVISION) return stored;

  const seedsById = new Map(seedCompanies.map((company) => [company.id, company]));
  const kept = stored.filter((company) => !RETIRED_SEED_IDS.has(company.id));
  const validStages = new Set<string>(STAGES);

  const upgraded = kept.map((company) => {
    const seed = seedsById.get(company.id);
    /*
     * Revision 3 replaced the ownership-lifecycle stages with assessment
     * progress. A retired value ("Value creation") is no longer in the union,
     * so it would render as "No stage" forever — `?? seed.stage` cannot fix it
     * because the field is set, just set to something that no longer exists.
     */
    const stage =
      company.stage && validStages.has(company.stage)
        ? company.stage
        : (seed?.stage ?? "Not started");

    if (!seed) return { ...company, stage };
    return {
      ...company,
      logoUrl: company.logoUrl ?? seed.logoUrl,
      stage,
    };
  });

  writeStorage(storageKeys.companies, upgraded);
  writeStorage(storageKeys.companiesSeedRevision, SEED_REVISION);
  return upgraded;
}

export function subscribeToCompanies(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COMPANIES_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COMPANIES_EVENT, onStoreChange);
  };
}

/** Cached against the raw string so useSyncExternalStore sees a stable value. */
export function listCompanies(): Company[] {
  if (typeof window === "undefined") return seedCompanies;

  const raw = window.localStorage.getItem(storageKeys.companies);
  if (raw === snapshotCache.raw && snapshotCache.raw !== null) {
    return snapshotCache.value;
  }

  const stored = readStorage<Company[]>(storageKeys.companies);
  const value = stored ? upgradeStoredSeeds(stored) : seedInitialCompanies();

  // Re-read: seeding wrote a new raw string, and caching the pre-write null
  // would make the next call miss and reseed.
  snapshotCache = {
    raw: window.localStorage.getItem(storageKeys.companies),
    value,
  };
  return value;
}

export function getServerCompanies(): Company[] {
  return seedCompanies;
}

export function getCompanyById(id: string): Company | undefined {
  return listCompanies().find((company) => company.id === id);
}

function commit(next: Company[]): void {
  writeStorage(storageKeys.companies, next);
  snapshotCache = { raw: null, value: seedCompanies };
  emitCompaniesChange();
}

export function createCompany(input: CompanyInput): Company {
  const existing = listCompanies();
  const company: Company = {
    ...input,
    id: uniqueId(input.name, existing),
    initials: input.initials?.trim() || initialsFromName(input.name),
  };
  commit([...existing, company]);
  return company;
}

export function updateCompany(id: string, patch: Partial<CompanyInput>): void {
  const next = listCompanies().map((company) =>
    company.id === id ? { ...company, ...patch } : company,
  );
  commit(next);
}

export function deleteCompany(id: string): void {
  commit(listCompanies().filter((company) => company.id !== id));
}

/**
 * The name-only path the assessment picker uses. Dedupes on name so picking
 * "add" twice with the same name resolves to the one company.
 */
export function createCompanyFromName(name: string): Company {
  const trimmed = name.trim();
  const match = listCompanies().find(
    (company) => company.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return match;

  return createCompany({
    name: trimmed,
    sector: "Professional Services",
    initials: initialsFromName(trimmed),
  });
}
