import type { Company } from "@/types/company";
import {
  customCompanyToCompany,
  listCustomCompanies,
} from "@/lib/assessment/custom-companies";

export const companies: Company[] = [
  {
    id: "profit-optics",
    name: "Profit Optics",
    shortName: "Profit Optics",
    initials: "PO",
    sector: "Technology Services",
    description: "Technology and analytics services for portfolio operations.",
    headquarters: "Wayne, PA",
    employeeCount: 180,
    revenueRange: "$25M – $50M",
    investmentYear: 2021,
  },
  {
    id: "collegies",
    name: "Collegies",
    shortName: "Collegies",
    initials: "CO",
    sector: "Education",
    description: "Education services supporting institutional and learner outcomes.",
    headquarters: "Wayne, PA",
    employeeCount: 240,
    revenueRange: "$25M – $50M",
    investmentYear: 2020,
  },
  {
    id: "xfact",
    name: "xFact",
    shortName: "xFact",
    initials: "XF",
    sector: "Technology Services",
    description: "Public sector technology platform and related services.",
    headquarters: "Wayne, PA",
    employeeCount: 320,
    revenueRange: "$50M – $100M",
    investmentYear: 2019,
  },
  {
    id: "dataserve",
    name: "DataServe",
    shortName: "DataServe",
    initials: "DS",
    sector: "Technology Services",
    description: "Data and managed services for mid-market enterprises.",
    headquarters: "Wayne, PA",
    employeeCount: 210,
    revenueRange: "$25M – $50M",
    investmentYear: 2022,
  },
  {
    id: "behaviour-framework",
    name: "Behaviour Framework",
    shortName: "Behaviour Framework",
    initials: "BF",
    sector: "Healthcare Services",
    description: "Behavioral healthcare services and related clinical operations.",
    headquarters: "Wayne, PA",
    employeeCount: 450,
    revenueRange: "$50M – $100M",
    investmentYear: 2018,
  },
  {
    id: "eosis",
    name: "EOSIS",
    shortName: "EOSIS",
    initials: "EO",
    sector: "Professional Services",
    description: "Professional services supporting Knowledge and Talent operators.",
    headquarters: "Wayne, PA",
    employeeCount: 160,
    revenueRange: "$25M – $50M",
    investmentYear: 2023,
  },
];

export function getCompanyById(id: string): Company | undefined {
  const seeded = companies.find((company) => company.id === id);
  if (seeded) return seeded;
  const custom = listCustomCompanies().find((company) => company.id === id);
  return custom ? customCompanyToCompany(custom) : undefined;
}

export function getCompanyInitials(company: Company): string {
  if (company.initials) return company.initials;
  const parts = company.name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function filterCompanies(list: Company[], query: string): Company[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return list;

  return list.filter((company) => {
    const haystack = [
      company.name,
      company.shortName,
      company.sector,
      company.description,
      company.headquarters,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
