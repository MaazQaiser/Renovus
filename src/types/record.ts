import type { SalesReportData } from "@/lib/assessment/sales-report";
import type { OffshoringSession } from "./offshoring";
import type { WorkflowReportData } from "./workflow";
import type { SalesBaselineData } from "./sales-baseline";
import type { SalesPreAssessmentData } from "./sales-pre-assessment";
import type { Sector } from "./company";

export type AssessmentRecordAgent =
  | "sales"
  | "offshoring"
  | "workflow"
  | "process"
  | "baseline";

export interface RecordMetric {
  label: string;
  value: string;
}

/**
 * What the records screen needs to render a row or card without opening the
 * record. Everything needed to re-render the report lives in `payload`.
 */
export interface AssessmentRecordSummary {
  id: string;
  agent: AssessmentRecordAgent;
  title: string;
  companyId?: string;
  companyName: string;
  completedAt: string;
  summary: string;
  metrics: RecordMetric[];
}

export type AssessmentRecordPayload =
  | {
      kind: "offshoring";
      /** Messages are stripped before archiving — the report never reads them. */
      session: OffshoringSession;
      sector: Sector;
    }
  | {
      kind: "sales";
      /** The derived report, not the transcript — see buildSalesRecord. */
      report: SalesReportData;
    }
  | {
      kind: "process";
      /** Data needed, as-is, to-be and impact, motion by motion. */
      report: SalesPreAssessmentData;
    }
  | {
      kind: "baseline";
      /**
       * The short version of the same report: one conversation and a partial
       * export, so every figure is an approximation and says so.
       */
      report: SalesBaselineData;
    }
  | {
      kind: "workflow";
      /** The current-state vs agentic comparison, already derived. */
      report: WorkflowReportData;
    };

export interface AssessmentRecord extends AssessmentRecordSummary {
  payload: AssessmentRecordPayload;
}
