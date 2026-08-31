import { DEMO_SALES_SESSIONS } from "@/data/demo/salesSessions";
import { OFFSHORING_PROFILES } from "@/data/offshoringProfiles";
import { getMockOffshoringReport } from "@/data/offshoringReport";
import { getCompanyById, companies } from "@/data/companies";
import { buildSalesReport, buildSalesRecord } from "@/lib/assessment/sales-report";
import { deleteRecord, listRecords, saveRecord } from "@/lib/records";
import type { Sector } from "@/types/company";
import type { AssessmentRecord } from "@/types/record";
import type { OffshoringSession } from "@/types/offshoring";

/**
 * Demo seeding: a portfolio of finished assessments for showing the product
 * without running every interview live.
 *
 * Sales records are built by running fixture sessions through the real
 * `buildSalesReport`, and offshoring records through the real
 * `buildOffshoringRecord`, so what a demo shows is what the product produces.
 *
 * Ids are deterministic and prefixed, so seeding twice replaces rather than
 * duplicates and `clearDemoRecords` can remove exactly what it added without
 * touching an assessment the user ran themselves.
 */

const DEMO_PREFIX = "rec-demo-";

/** Offshoring companies to seed, in the order they should appear. */
const OFFSHORING_COMPANY_IDS = [
  "collegies",
  "xfact",
  "dataserve",
  "behaviour-framework",
  "eosis",
] as const;

/** Days before now each offshoring assessment completed. */
const OFFSHORING_AGE_DAYS: Record<string, number> = {
  collegies: 4,
  xfact: 9,
  dataserve: 17,
  "behaviour-framework": 26,
  eosis: 34,
};

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** A minimal finished session. The offshoring report renders from the profile. */
function demoOffshoringSession(
  companyId: string,
  companyName: string,
  sector: Sector,
  completedAt: string,
): OffshoringSession {
  const profile = OFFSHORING_PROFILES[companyName];
  return {
    id: `offshoring-demo-${companyId}`,
    companyId,
    companyName,
    companySector: sector,
    phase: "complete",
    messages: [],
    files: [],
    skippedPayroll: false,
    dataTier: "A",
    detectedFunctions: [],
    answers: {
      "d1-q2-sector": {
        value: sector,
        label: `${sector} — mid-hold, in-scope roles only.`,
      },
      "d2-q1-offshore-cost": {
        value: String(profile?.offshoreRatePct ?? 40),
        label: `${profile?.offshoreRatePct ?? 40}% of onshore loaded cost`,
        confidence: "E",
      },
    },
    queue: [],
    status: "complete",
    startedAt: isoDaysAgo((OFFSHORING_AGE_DAYS[companyId] ?? 10) + 1),
    updatedAt: completedAt,
  };
}

function buildOffshoringDemoRecord(companyId: string): AssessmentRecord | undefined {
  const company = getCompanyById(companyId);
  if (!company) return undefined;

  const completedAt = isoDaysAgo(OFFSHORING_AGE_DAYS[companyId] ?? 10);
  const session = demoOffshoringSession(
    companyId,
    company.name,
    company.sector,
    completedAt,
  );
  const report = getMockOffshoringReport(company.name, company.sector);

  return {
    id: `${DEMO_PREFIX}offshoring-${companyId}`,
    agent: "offshoring",
    title: "Workforce Sourcing Assessment",
    companyId,
    companyName: company.name,
    completedAt,
    summary: `${report.answerHeadlineValue} ${report.answerHeadlineRest}`,
    metrics: report.kpis
      .slice(0, 3)
      .map((kpi) => ({ label: kpi.label, value: `${kpi.value}${kpi.suffix ?? ""}` })),
    payload: { kind: "offshoring", session, sector: company.sector },
  };
}

/** Every demo record, newest first. Pure — the caller persists. */
export function buildDemoRecords(): AssessmentRecord[] {
  const assessedCompanyCount = companies.length;

  const sales = DEMO_SALES_SESSIONS.map(({ session, completedAt }) => {
    const report = buildSalesReport(session, { assessedCompanyCount });
    const record = buildSalesRecord(session, report);
    return {
      ...record,
      id: `${DEMO_PREFIX}sales-${session.companyId}`,
      completedAt,
    };
  });

  const offshoring = OFFSHORING_COMPANY_IDS.map(buildOffshoringDemoRecord).filter(
    (record): record is AssessmentRecord => Boolean(record),
  );

  return [...sales, ...offshoring].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
}

export function isDemoRecord(record: { id: string }): boolean {
  return record.id.startsWith(DEMO_PREFIX);
}

export function hasDemoRecords(): boolean {
  return listRecords().some(isDemoRecord);
}

/** Writes the demo portfolio. Re-seeding replaces by id rather than duplicating. */
export function seedDemoRecords(): number {
  const records = buildDemoRecords();
  for (const record of records) saveRecord(record);
  return records.length;
}

/** Removes only what seeding added; assessments the user ran are untouched. */
export function clearDemoRecords(): number {
  const demo = listRecords().filter(isDemoRecord);
  for (const record of demo) deleteRecord(record.id);
  return demo.length;
}
