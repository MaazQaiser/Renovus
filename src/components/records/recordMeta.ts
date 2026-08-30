import type { AppHref } from "@/lib/routes";
import type { AssessmentRecordAgent } from "@/types/record";

export const AGENT_LABEL: Record<AssessmentRecordAgent, string> = {
  sales: "Sales",
  offshoring: "Offshoring",
};

export function recordHref(id: string): AppHref {
  return `/agents/records/${id}` as AppHref;
}
