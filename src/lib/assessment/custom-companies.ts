import type { Company, Sector } from "@/types/company";
import { readStorage, writeStorage } from "@/lib/storage";

const CUSTOM_KEY = "renovers:custom-companies";
export const CUSTOM_COMPANIES_EVENT = "renovers:custom-companies";

export interface CustomCompanyRecord {
  id: string;
  name: string;
  createdAt: string;
}

let cachedList: Company[] | null = null;
let cachedKey = "";

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "company";
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function listCustomCompanies(): CustomCompanyRecord[] {
  return readStorage<CustomCompanyRecord[]>(CUSTOM_KEY) ?? [];
}

export function addCustomCompany(name: string): CustomCompanyRecord {
  const trimmed = name.trim();
  const existing = listCustomCompanies();
  const match = existing.find(
    (company) => company.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (match) return match;

  const baseId = `custom-${slugify(trimmed)}`;
  let id = baseId;
  let suffix = 2;
  while (existing.some((company) => company.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const record: CustomCompanyRecord = {
    id,
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  writeStorage(CUSTOM_KEY, [...existing, record]);
  cachedList = null;
  cachedKey = "";
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CUSTOM_COMPANIES_EVENT));
  }
  return record;
}

export function customCompanyToCompany(record: CustomCompanyRecord): Company {
  return {
    id: record.id,
    name: record.name,
    shortName: record.name.split(/\s+/)[0] ?? record.name,
    initials: initialsFromName(record.name),
    sector: "Professional Services" as Sector,
    description: "Custom portfolio company added for this assessment.",
    headquarters: "—",
    employeeCount: 0,
    revenueRange: "—",
    investmentYear: new Date().getFullYear(),
  };
}

export function listAssessmentCompanies(seed: Company[]): Company[] {
  const custom = listCustomCompanies();
  const key = custom.map((item) => item.id).join("|");
  if (cachedList && cachedKey === key) return cachedList;

  const seedIds = new Set(seed.map((company) => company.id));
  const merged = [
    ...seed,
    ...custom
      .map(customCompanyToCompany)
      .filter((company) => !seedIds.has(company.id)),
  ];
  cachedList = merged;
  cachedKey = key;
  return merged;
}
