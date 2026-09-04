import { DEMO_SALES_SESSIONS } from "@/data/demo/salesSessions";
import { OFFSHORING_PROFILES } from "@/data/offshoringProfiles";
import { getMockOffshoringReport } from "@/data/offshoringReport";
import { getMockWorkflowReport } from "@/data/workflowReport";
import { companies } from "@/data/companies";
import { getCompanyById } from "@/lib/companies";
import { buildSalesReport, buildSalesRecord } from "@/lib/assessment/sales-report";
import { deleteRecord, listRecords, saveRecord } from "@/lib/records";
import { readStorage, storageKeys, writeStorage } from "@/lib/storage";
import { buildProcessRecord } from "@/lib/pre-assessment";
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

/**
 * Offshoring companies to seed, in the order they should appear.
 *
 * xFact is left out on purpose — it is the portfolio's untouched PortCo, and a
 * cross-department assessment would make it read as partly assessed.
 */
const OFFSHORING_COMPANY_IDS = [
  "collegies",
  "behaviour-framework",
  "eosis",
] as const;

/** Days before now each offshoring assessment completed. */
const OFFSHORING_AGE_DAYS: Record<string, number> = {
  collegies: 4,
  "behaviour-framework": 26,
  eosis: 34,
};

/**
 * Days after its sales baseline that each workflow assessment completed, when
 * there is room for it. The workflow assessment reads the process the baseline
 * captured, so it is always dated after it — see buildWorkflowDemoRecord.
 */
const WORKFLOW_LAG_DAYS = 3;

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

/**
 * The workflow assessment that follows a department's baseline.
 *
 * Seeded for every company that has a sales baseline rather than a hand-picked
 * subset, so the demo never shows a covered department whose next step is
 * missing. `baselineCompletedAt` keeps it dated after the baseline it reads.
 */
function buildWorkflowDemoRecord(
  companyId: string,
  baselineCompletedAt: string,
): AssessmentRecord | undefined {
  const company = getCompanyById(companyId);
  if (!company) return undefined;

  // After the baseline, but never in the future: a recent baseline leaves less
  // than the full lag before now, so fall back to the midpoint between them.
  const baseline = new Date(baselineCompletedAt).getTime();
  const now = Date.now();
  const lagged = baseline + WORKFLOW_LAG_DAYS * 24 * 60 * 60 * 1000;
  const completedAt = new Date(
    lagged < now ? lagged : baseline + (now - baseline) / 2,
  ).toISOString();
  const report = getMockWorkflowReport(company.name, "Sales");

  return {
    id: `${DEMO_PREFIX}workflow-${companyId}`,
    agent: "workflow",
    title: "Workflow Assessment",
    companyId,
    companyName: company.name,
    completedAt,
    summary: `${report.headlineValue} ${report.headlineRest}.`,
    metrics: [
      { label: "Selling time a week", value: `+${report.delta.sellingHoursGained} hrs` },
      { label: "Accounts a week", value: `+${report.delta.accountsGained}` },
      { label: "Of the workflow", value: `${report.delta.percent}%` },
    ],
    payload: { kind: "workflow", report },
  };
}

/**
 * The sales process AI pre-assessment behind a department's baseline: what the
 * report is built on, how selling runs today, the same work with software doing
 * the repetitive parts, and what that is worth. Dated with the baseline, since
 * it is the same round of discovery.
 */
function buildProcessDemoRecord(
  companyId: string,
  baselineCompletedAt: string,
): AssessmentRecord | undefined {
  const company = getCompanyById(companyId);
  if (!company) return undefined;

  return buildProcessRecord({
    id: `${DEMO_PREFIX}process-${companyId}`,
    companyId,
    companyName: company.name,
    completedAt: baselineCompletedAt,
  });
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

  // One per sales baseline, so every covered Sales department has its
  // workflow assessment behind it.
  const workflow = DEMO_SALES_SESSIONS.map(({ session, completedAt }) =>
    // A session with no company can't be attributed to a department.
    session.companyId
      ? buildWorkflowDemoRecord(session.companyId, completedAt)
      : undefined,
  ).filter((record): record is AssessmentRecord => Boolean(record));

  // One per sales baseline: the process baseline is that same discovery,
  // written up motion by motion.
  const process = DEMO_SALES_SESSIONS.map(({ session, completedAt }) =>
    session.companyId
      ? buildProcessDemoRecord(session.companyId, completedAt)
      : undefined,
  ).filter((record): record is AssessmentRecord => Boolean(record));

  return [...sales, ...offshoring, ...workflow, ...process].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
}

export function isDemoRecord(record: { id: string }): boolean {
  return record.id.startsWith(DEMO_PREFIX);
}

export function hasDemoRecords(): boolean {
  return listRecords().some(isDemoRecord);
}

/**
 * Writes the demo portfolio. Re-seeding replaces by id rather than
 * duplicating, and drops demo records the portfolio no longer includes —
 * without that, a company removed from the fixtures would keep the records an
 * earlier revision wrote for it and still read as assessed. Assessments the
 * user ran are never touched: they carry no demo prefix.
 */
export function seedDemoRecords(): number {
  const records = buildDemoRecords();
  const wanted = new Set(records.map((record) => record.id));

  for (const stale of listRecords()) {
    if (isDemoRecord(stale) && !wanted.has(stale.id)) deleteRecord(stale.id);
  }

  for (const record of records) saveRecord(record);
  return records.length;
}

/**
 * Bumped when a demo record's payload shape changes. A stored record keeps the
 * shape it was written with, so without this a browser seeded before the change
 * would render a report against fields that no longer exist.
 *
 * 1 — first auto-seed. 2 — workflow report reshaped for the one-page layout.
 * 3 — a workflow assessment for every sales baseline, not a subset.
 * 4 — workflow dates clamped so a recent baseline cannot date one in the future.
 * 5 — workflow report split into baseline and agentic parts.
 * 6 — annual delta derived from the rounded figures the report displays.
 * 7 — workflow report reframed as capacity at a fixed team and budget.
 * 8 — workflow stages carry a head count.
 * 9 — head count became a role phrase, and `today` a composable verb phrase.
 * 10 — `withAgent` became a composable verb phrase too.
 * 11 — each stage's agent is named.
 * 12 — a sales process baseline per department.
 * 13 — that baseline became the full pre-assessment: data, as-is, to-be, impact.
 * 14 — xFact left unassessed, so one PortCo starts from nothing.
 * 15 — re-seeding drops demo records the portfolio no longer includes.
 * 16 — pre-assessment data requirements carry a collected percentage.
 */
const DEMO_REVISION = 16;

/**
 * Fills a first-run browser with the demo portfolio, so the product shows
 * finished assessments and their reports instead of empty states. Re-seeds when
 * DEMO_REVISION moves ahead of what this browser holds.
 *
 * Guarded by a revision rather than by `hasDemoRecords`, so clearing the demo
 * data — or deleting a record by hand — stays cleared instead of coming back on
 * the next page load. Returns how many records it wrote.
 */
export function seedDemoRecordsOnce(): number {
  if (typeof window === "undefined") return 0;

  // `true` is the revision-1 marker, written before this was a number.
  const stored = readStorage<number | boolean>(storageKeys.demoSeeded);
  const seen = typeof stored === "number" ? stored : stored ? 1 : 0;
  if (seen >= DEMO_REVISION) return 0;

  writeStorage(storageKeys.demoSeeded, DEMO_REVISION);
  return seedDemoRecords();
}

/** Removes only what seeding added; assessments the user ran are untouched. */
export function clearDemoRecords(): number {
  const demo = listRecords().filter(isDemoRecord);
  for (const record of demo) deleteRecord(record.id);
  return demo.length;
}
