import type { DetectedFunction } from "@/types/offshoring";
import type { Sector } from "@/types/company";

const SECTOR_FUNCTIONS: Record<Sector, Omit<DetectedFunction, "fte">[]> = {
  Education: [
    { id: "enrollment", label: "Enrollment & Admissions" },
    { id: "instruction", label: "Instruction & Curriculum" },
    { id: "support", label: "Support Center" },
    { id: "it-apps", label: "IT Applications & SIS" },
    { id: "it-infra", label: "IT Infrastructure & Cloud" },
    { id: "finance-ops", label: "Finance Ops" },
  ],
  "Healthcare Services": [
    { id: "revenue-cycle", label: "Revenue Cycle" },
    { id: "clinical", label: "Clinical" },
    { id: "credentialing", label: "Credentialing" },
    { id: "support", label: "Support / Patient Services" },
    { id: "it", label: "IT & Applications" },
    { id: "finance-ops", label: "Finance Ops" },
  ],
  "Technology Services": [
    { id: "engineering", label: "Engineering" },
    { id: "qa", label: "QA / Test" },
    { id: "support", label: "Support / Helpdesk" },
    { id: "devops", label: "DevOps / Cloud / Infra" },
    { id: "data", label: "Data / Analytics" },
    { id: "finance-ops", label: "Finance Ops" },
  ],
  "Professional Services": [
    { id: "delivery", label: "Delivery / Operations" },
    { id: "support", label: "Client Support" },
    { id: "engineering", label: "Engineering" },
    { id: "finance-ops", label: "Finance Ops" },
    { id: "hr-ops", label: "HR Ops" },
    { id: "sales", label: "Sales / Account Management" },
  ],
};

/** Deterministic mock FTEs so framing and preview stay stable across resume. */
function mockFte(id: string, index: number): number {
  const base = [42, 28, 19, 31, 24, 15][index % 6] ?? 20;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i) * (i + 1)) % 17;
  return base + hash;
}

export function seedFunctionsForSector(sector: Sector): DetectedFunction[] {
  const list = SECTOR_FUNCTIONS[sector] ?? SECTOR_FUNCTIONS["Professional Services"];
  return list.map((entry, index) => ({
    ...entry,
    fte: mockFte(entry.id, index),
  }));
}

export function defaultSector(): Sector {
  return "Professional Services";
}
