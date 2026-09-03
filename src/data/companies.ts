import type { Company } from "@/types/company";

export const companies: Company[] = [
  {
    id: "profit-optics",
    name: "Profit Optics",
    shortName: "Profit Optics",
    initials: "PO",
    sector: "Technology Services",
    stage: "Baseline",
    description: "Technology and analytics services for portfolio operations.",
    headquarters: "Wayne, PA",
    employeeCount: 180,
    revenueRange: "$25M – $50M",
    investmentYear: 2021,
    logoUrl: "/companies/profit-optics-mark.png",
  },
  {
    id: "collegies",
    name: "Collegies",
    shortName: "Collegies",
    initials: "CO",
    sector: "Education",
    stage: "Baseline",
    description: "Education services supporting institutional and learner outcomes.",
    headquarters: "Wayne, PA",
    employeeCount: 240,
    revenueRange: "$25M – $50M",
    investmentYear: 2020,
    logoUrl: "/companies/collegis-mark.svg",
  },
  {
    id: "xfact",
    name: "xFact",
    shortName: "xFact",
    initials: "XF",
    sector: "Technology Services",
    stage: "Roadmap defined",
    description: "Public sector technology platform and related services.",
    headquarters: "Wayne, PA",
    employeeCount: 320,
    revenueRange: "$50M – $100M",
    investmentYear: 2019,
    logoUrl: "/companies/xfact-mark.svg",
  },
  {
    id: "dataserve",
    name: "DataServe",
    shortName: "DataServe",
    initials: "DS",
    sector: "Technology Services",
    stage: "Not started",
    description: "Data and managed services for mid-market enterprises.",
    headquarters: "Wayne, PA",
    employeeCount: 210,
    revenueRange: "$25M – $50M",
    investmentYear: 2022,
    logoUrl: "/companies/dataserv-mark.png",
  },
  {
    id: "behaviour-framework",
    name: "Behaviour Framework",
    shortName: "Behaviour Framework",
    initials: "BF",
    sector: "Healthcare Services",
    stage: "Assessing",
    description: "Behavioral healthcare services and related clinical operations.",
    headquarters: "Wayne, PA",
    employeeCount: 450,
    revenueRange: "$50M – $100M",
    investmentYear: 2018,
    logoUrl: "/companies/behavioral-framework-mark.svg",
  },
  {
    id: "eosis",
    name: "EOSIS",
    shortName: "EOSIS",
    initials: "EO",
    sector: "Professional Services",
    stage: "Not started",
    description: "Professional services supporting Knowledge and Talent operators.",
    headquarters: "Wayne, PA",
    employeeCount: 160,
    revenueRange: "$25M – $50M",
    investmentYear: 2023,
    logoUrl: "/companies/eosis-mark.png",
  },
  {
    id: "gtm",
    name: "GTM",
    shortName: "GTM",
    initials: "GT",
    sector: "Professional Services",
    stage: "Implementation",
    description: "Go-to-market strategy and revenue operations services.",
    headquarters: "Wayne, PA",
    employeeCount: 140,
    revenueRange: "$25M – $50M",
    investmentYear: 2024,
  },
];

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
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
