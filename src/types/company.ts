export type Sector =
  | "Education"
  | "Healthcare Services"
  | "Technology Services"
  | "Professional Services";

/** How far this company has got through assessment, in progression order. */
export type CompanyStage =
  | "Not started"
  | "Assessing"
  | "Baseline"
  | "Roadmap defined"
  | "Implementation";

export interface Company {
  id: string;
  name: string;
  /** Surfaced as "Industry" in the UI; the four values are unchanged. */
  sector: Sector;
  stage?: CompanyStage;
  /** Uploaded logo as a data URL. The initials avatar stands in when absent. */
  logoUrl?: string;
  initials?: string;
  /**
   * Carried by the seeded companies and still rendered where present, but no
   * longer collected when adding or editing a company.
   */
  shortName?: string;
  description?: string;
  headquarters?: string;
  employeeCount?: number;
  revenueRange?: string;
  investmentYear?: number;
  lastAssessedAt?: string;
}

export interface SelectedCompany {
  id: string;
  name: string;
  sector: Sector;
  shortName?: string;
  description?: string;
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
