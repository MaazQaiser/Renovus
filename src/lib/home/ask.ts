import {
  companyCoverage,
  companyRecords,
  crossDepartmentCount,
  type CompanyCoverage,
} from "@/lib/coverage";
import type { AppHref } from "@/lib/routes";
import { AGENT_ROUTE } from "./start-assessment";
import type { Company } from "@/types/company";
import type { AssessmentRecord } from "@/types/record";

/**
 * The ask bar's script.
 *
 * This is a fixed demo, not a language model: a closed set of intents, each
 * with an authored reply. The numbers in those replies are read from
 * lib/coverage so the answer can never contradict the company page it points
 * at — the wording is scripted, the figures are not invented.
 *
 * Pure and SSR-safe, like lib/home/resumable.ts — no `window`, storage, or
 * `Date`, so the same question always yields the same answer.
 */

export type AskAgent = "sales" | "offshoring";

/**
 * The questions the script answers, offered as chips. A fixed script has to be
 * discoverable — without these the demo is a guessing game.
 */
export const SUGGESTED_PROMPTS = [
  "What should I assess next?",
  "How is xFact doing?",
  "Which companies have nothing saved?",
] as const;

const AGENT_META: Record<AskAgent, { agentLabel: string; route: AppHref }> = {
  sales: { agentLabel: "Sales function assessment", route: AGENT_ROUTE.sales },
  offshoring: {
    agentLabel: "Offshoring potential assessment",
    route: AGENT_ROUTE.offshoring,
  },
};

export interface AskNext {
  agent: AskAgent;
  agentLabel: string;
  route: AppHref;
  /** Why this is the next move, in one sentence. */
  reason: string;
}

export interface AskProgress {
  percent: number;
  coveredCount: number;
  totalCount: number;
  assessmentCount: number;
  /** Assessments that span departments rather than sitting in one. */
  crossCount: number;
  lastAssessedAt?: string;
}

export interface AskReply {
  /** The scripted answer. */
  text: string;
  /** Set when the reply is about one company, which the CTA then acts on. */
  company?: Company;
  coverage?: CompanyCoverage;
  progress?: AskProgress;
  next?: AskNext;
  /** Companies offered as chips when the question named none, or none matched. */
  options?: Company[];
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Longest name first, so "Profit Optics" wins over a company merely called
 * "Optics" when both appear in the haystack.
 */
function findCompany(query: string, companies: Company[]): Company | undefined {
  const haystack = query.toLowerCase();

  const byName = [...companies]
    .sort((left, right) => right.name.length - left.name.length)
    .find(
      (company) =>
        haystack.includes(company.name.toLowerCase()) ||
        Boolean(company.shortName && haystack.includes(company.shortName.toLowerCase())),
    );
  if (byName) return byName;

  // Initials only on a word boundary — "PO" must not match "portfolio".
  return companies.find((company) => {
    const initials = company.initials?.toLowerCase();
    if (!initials) return false;
    return new RegExp(`\\b${initials}\\b`).test(haystack);
  });
}

function progressFor(
  company: Company,
  coverage: CompanyCoverage,
  records: AssessmentRecord[],
): AskProgress {
  const own = companyRecords(company, records);
  const lastAssessedAt = own
    .map((record) => record.completedAt)
    .sort((left, right) => right.localeCompare(left))[0];

  return {
    percent: coverage.percent,
    coveredCount: coverage.coveredCount,
    totalCount: coverage.totalCount,
    assessmentCount: own.length,
    crossCount: crossDepartmentCount(company, records),
    lastAssessedAt,
  };
}

/**
 * The one recommendation, in priority order: fill a department that has an
 * agent and no assessment, then run the cross-department assessment if it has
 * never run, then refresh the oldest baseline.
 */
function nextFor(coverage: CompanyCoverage, progress: AskProgress): AskNext {
  const gap = coverage.departments.find((item) => item.status === "not-assessed");
  if (gap) {
    return {
      agent: "sales",
      ...AGENT_META.sales,
      reason: `${gap.department.name} has an agent ready and nothing saved against it yet.`,
    };
  }

  if (progress.crossCount === 0) {
    return {
      agent: "offshoring",
      ...AGENT_META.offshoring,
      reason:
        "Every department with an agent is covered, but workforce sourcing has never run here.",
    };
  }

  return {
    agent: "sales",
    ...AGENT_META.sales,
    reason:
      "Everything with an agent behind it is covered — re-run the sales baseline to refresh it.",
  };
}

function companyReply(
  company: Company,
  records: AssessmentRecord[],
  lead: string,
): AskReply {
  const coverage = companyCoverage(company, records);
  const progress = progressFor(company, coverage, records);
  const next = nextFor(coverage, progress);

  const standing =
    progress.assessmentCount === 0
      ? "Nothing has been assessed yet."
      : `${progress.coveredCount} of ${progress.totalCount} departments covered, from ${plural(
          progress.assessmentCount,
          "saved assessment",
        )}${
          progress.crossCount > 0
            ? ` including ${plural(progress.crossCount, "cross-department one", "cross-department ones")}`
            : ""
        }.`;

  return {
    text: `${lead} ${standing} ${next.reason}`,
    company,
    coverage,
    progress,
    next,
  };
}

/** Companies with no saved assessment at all, A–Z. */
function unassessed(companies: Company[], records: AssessmentRecord[]): Company[] {
  return companies
    .filter((company) => companyRecords(company, records).length === 0)
    .sort((left, right) => left.name.localeCompare(right.name));
}

/** Lowest coverage first, then fewest assessments, then name — always decisive. */
function weakest(companies: Company[], records: AssessmentRecord[]): Company | undefined {
  return [...companies].sort((left, right) => {
    const leftCoverage = companyCoverage(left, records);
    const rightCoverage = companyCoverage(right, records);
    if (leftCoverage.percent !== rightCoverage.percent) {
      return leftCoverage.percent - rightCoverage.percent;
    }

    const leftCount = companyRecords(left, records).length;
    const rightCount = companyRecords(right, records).length;
    if (leftCount !== rightCount) return leftCount - rightCount;

    return left.name.localeCompare(right.name);
  })[0];
}

const NOTHING_MATCHED =
  "I only answer for a portfolio company. Pick one and I'll show where it stands and what to run next.";

/**
 * Matches a question against the script. Every branch either resolves to one
 * company — so the reply can carry a Start assessment CTA — or hands back
 * company chips to choose from.
 */
export function resolveAsk(
  query: string,
  companies: Company[],
  records: AssessmentRecord[],
): AskReply {
  const text = query.trim().toLowerCase();

  if (companies.length === 0) {
    return {
      text: "There are no companies on the roster yet. Add one and I can track its coverage.",
    };
  }

  const named = findCompany(text, companies);
  if (named) {
    return companyReply(named, records, `${named.name} is at ${companyCoverage(named, records).percent}%.`);
  }

  // Portfolio-wide: which companies are untouched.
  if (/nothing saved|no assessment|not assessed|untouched|never assessed/.test(text)) {
    const gaps = unassessed(companies, records);
    if (gaps.length === 0) {
      const target = weakest(companies, records)!;
      return companyReply(
        target,
        records,
        `Every company has at least one saved assessment. ${target.name} is the thinnest at ${companyCoverage(target, records).percent}%.`,
      );
    }

    return {
      text: `${plural(gaps.length, "company", "companies")} ${
        gaps.length === 1 ? "has" : "have"
      } nothing saved yet. Pick one to see what to run first.`,
      options: gaps,
    };
  }

  // Portfolio-wide: what to do next.
  if (/next|start|begin|recommend|should i|priorit/.test(text)) {
    const target = weakest(companies, records)!;
    return companyReply(
      target,
      records,
      `${target.name} is the weakest coverage in the portfolio at ${companyCoverage(target, records).percent}%.`,
    );
  }

  return { text: NOTHING_MATCHED, options: [...companies].sort((l, r) => l.name.localeCompare(r.name)) };
}
