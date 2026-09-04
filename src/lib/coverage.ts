import { departments } from "@/data/departments";
import type { Department } from "@/types/department";
import type { AssessmentRecord, AssessmentRecordAgent } from "@/types/record";
import type { Company } from "@/types/company";

/**
 * Which department each agent's assessment speaks for.
 *
 * Only the sales agent is department-scoped. The offshoring assessment looks
 * across functions rather than sitting inside one department, so it counts
 * toward a company's assessment total but not toward any single department.
 */
const AGENT_DEPARTMENT: Partial<Record<AssessmentRecordAgent, string>> = {
  sales: "sales",
};

/**
 * Which department each workflow assessment refines.
 *
 * Kept separate from AGENT_DEPARTMENT on purpose: a workflow assessment is the
 * step *after* a department's baseline, so it must not be what makes that
 * department count as covered.
 */
const WORKFLOW_DEPARTMENT: Partial<Record<AssessmentRecordAgent, string>> = {
  workflow: "sales",
};

/**
 * Which department each process baseline describes. Also kept separate: it is
 * the current-state write-up behind a department's baseline, not the baseline
 * itself and not the workflow step.
 */
const PROCESS_DEPARTMENT: Partial<Record<AssessmentRecordAgent, string>> = {
  process: "sales",
};

export type CoverageStatus =
  /** At least one saved assessment for this company and department. */
  | "covered"
  /** An agent exists for this department, but nothing has been assessed yet. */
  | "not-assessed"
  /** No assessment agent has been built for this department yet. */
  | "no-agent";

/**
 * The workflow assessment step for a department. Present only once that
 * department's baseline is covered — the workflow assessment reads the
 * current-state process the baseline captured, so it cannot run before it.
 */
export interface WorkflowStepCoverage {
  status: Exclude<CoverageStatus, "no-agent">;
  assessmentCount: number;
  lastAssessedAt?: string;
  latestRecordId?: string;
}

export interface DepartmentCoverage {
  department: Department;
  status: CoverageStatus;
  assessmentCount: number;
  lastAssessedAt?: string;
  /** Newest matching record, so a covered row can open its report. */
  latestRecordId?: string;
  /** Undefined until the baseline is covered, which unlocks this step. */
  workflow?: WorkflowStepCoverage;
  /** Newest process baseline for this department, if one exists. */
  processRecordId?: string;
}

/**
 * The offshoring assessment looks across functions instead of sitting in one
 * department, so it gets its own line on the company page rather than being
 * folded into the department list.
 */
export interface CrossDepartmentCoverage {
  status: Exclude<CoverageStatus, "no-agent">;
  assessmentCount: number;
  lastAssessedAt?: string;
  latestRecordId?: string;
}

export interface CompanyCoverage {
  departments: DepartmentCoverage[];
  /** Departments with at least one saved assessment. */
  coveredCount: number;
  /** Every department a company is measured against — currently five. */
  totalCount: number;
  /** Departments that have an agent at all, covered or not. */
  availableCount: number;
  /** coveredCount / totalCount, rounded, so 1 of 5 reads as 20%. */
  percent: number;
}

export const STATUS_LABEL: Record<CoverageStatus, string> = {
  covered: "Covered",
  "not-assessed": "Not assessed",
  "no-agent": "No agent yet",
};

function matchesCompany(record: AssessmentRecord, company: Company): boolean {
  // Records key off id when they have one and fall back to the name, mirroring
  // assessmentCountsByCompany in lib/records.ts.
  return record.companyId === company.id || record.companyName === company.name;
}

/**
 * Neither a department baseline nor a department's workflow step — so it is
 * genuinely cross-department. Checks both maps rather than negating one, or
 * every future agent would silently land in the cross-department bucket.
 */
function isCrossDepartment(record: AssessmentRecord): boolean {
  return (
    !AGENT_DEPARTMENT[record.agent] &&
    !WORKFLOW_DEPARTMENT[record.agent] &&
    !PROCESS_DEPARTMENT[record.agent]
  );
}

/** Callers can't rely on the incoming array's order, so sort rather than assume. */
function newestFirst(records: AssessmentRecord[]): AssessmentRecord[] {
  return [...records].sort((left, right) =>
    right.completedAt.localeCompare(left.completedAt),
  );
}

/**
 * Every saved assessment naming this company, in the order `listRecords` gave
 * them — newest first. The company detail page is the only place these are
 * listed, so it filters the whole archive rather than keeping its own index.
 */
export function companyRecords(
  company: Company,
  records: AssessmentRecord[],
): AssessmentRecord[] {
  return records.filter((record) => matchesCompany(record, company));
}

/**
 * A department's own records, split by which step they belong to. The
 * department page lists both, so it needs them apart rather than merged.
 */
export function departmentRecords(
  company: Company,
  records: AssessmentRecord[],
  departmentId: string,
): {
  baseline: AssessmentRecord[];
  workflow: AssessmentRecord[];
  process: AssessmentRecord[];
} {
  const own = companyRecords(company, records);
  return {
    baseline: newestFirst(
      own.filter((record) => AGENT_DEPARTMENT[record.agent] === departmentId),
    ),
    workflow: newestFirst(
      own.filter((record) => WORKFLOW_DEPARTMENT[record.agent] === departmentId),
    ),
    process: newestFirst(
      own.filter((record) => PROCESS_DEPARTMENT[record.agent] === departmentId),
    ),
  };
}

export function companyCoverage(
  company: Company,
  records: AssessmentRecord[],
): CompanyCoverage {
  const own = records.filter((record) => matchesCompany(record, company));

  const perDepartment: DepartmentCoverage[] = departments.map((department) => {
    const matching = own.filter(
      (record) => AGENT_DEPARTMENT[record.agent] === department.id,
    );

    const newest = newestFirst(matching)[0];

    const status: CoverageStatus = !department.available
      ? "no-agent"
      : matching.length > 0
        ? "covered"
        : "not-assessed";

    // The workflow step only exists once the baseline is in — see
    // WorkflowStepCoverage for why it cannot run earlier.
    const workflowRecords =
      status === "covered"
        ? newestFirst(
            own.filter(
              (record) => WORKFLOW_DEPARTMENT[record.agent] === department.id,
            ),
          )
        : [];
    const newestWorkflow = workflowRecords[0];
    const newestProcess = newestFirst(
      own.filter((record) => PROCESS_DEPARTMENT[record.agent] === department.id),
    )[0];

    return {
      department,
      status,
      assessmentCount: matching.length,
      lastAssessedAt: newest?.completedAt,
      latestRecordId: newest?.id,
      workflow:
        status === "covered"
          ? {
              status: workflowRecords.length > 0 ? "covered" : "not-assessed",
              assessmentCount: workflowRecords.length,
              lastAssessedAt: newestWorkflow?.completedAt,
              latestRecordId: newestWorkflow?.id,
            }
          : undefined,
      processRecordId: newestProcess?.id,
    };
  });

  const coveredCount = perDepartment.filter((item) => item.status === "covered").length;
  const totalCount = perDepartment.length;

  return {
    departments: perDepartment,
    coveredCount,
    totalCount,
    availableCount: perDepartment.filter((item) => item.status !== "no-agent").length,
    percent: totalCount === 0 ? 0 : Math.round((coveredCount / totalCount) * 100),
  };
}

/** Assessments that aren't scoped to a single department (currently offshoring). */
export function crossDepartmentCount(
  company: Company,
  records: AssessmentRecord[],
): number {
  return records.filter(
    (record) => matchesCompany(record, company) && isCrossDepartment(record),
  ).length;
}

/**
 * The cross-department line's own state. Never "no-agent": the offshoring
 * agent exists, so this is only ever covered or waiting to be run.
 */
export function crossDepartmentCoverage(
  company: Company,
  records: AssessmentRecord[],
): CrossDepartmentCoverage {
  const matching = newestFirst(
    records.filter((record) => matchesCompany(record, company) && isCrossDepartment(record)),
  );
  const newest = matching[0];

  return {
    status: matching.length > 0 ? "covered" : "not-assessed",
    assessmentCount: matching.length,
    lastAssessedAt: newest?.completedAt,
    latestRecordId: newest?.id,
  };
}

export function coverageSummary(coverage: CompanyCoverage): string {
  return `${coverage.coveredCount} of ${coverage.totalCount} departments covered`;
}
