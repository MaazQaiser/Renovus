export type Sector =
  | "Education"
  | "Healthcare Services"
  | "Technology Services"
  | "Professional Services";

export interface Company {
  id: string;
  name: string;
  shortName: string;
  sector: Sector;
  description: string;
  headquarters: string;
  employeeCount: number;
  revenueRange: string;
  investmentYear: number;
  initials?: string;
  logoUrl?: string;
  lastAssessedAt?: string;
}

export interface SelectedCompany {
  id: string;
  name: string;
  shortName: string;
  sector: Sector;
  description: string;
}

export function toSelectedCompany(company: Company): SelectedCompany {
  return {
    id: company.id,
    name: company.name,
    shortName: company.shortName,
    sector: company.sector,
    description: company.description,
  };
}
