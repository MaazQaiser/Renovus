import { selectCompany as selectSalesCompany } from "@/lib/assessment/sales-engine";
import {
  saveSalesSession,
  startFreshSalesSession,
} from "@/lib/assessment/sales-session";
import { selectCompany as selectOffshoringCompany } from "@/lib/offshoring/engine";
import {
  saveOffshoringSession,
  startFreshOffshoringSession,
} from "@/lib/offshoring/session";
import { saveCompanySelection } from "@/lib/runs";
import type { AppHref } from "@/lib/routes";
import {
  buildOffshoringResumable,
  buildSalesResumable,
  type Resumable,
} from "./resumable";
import type { AskAgent } from "./ask";
import type { Company } from "@/types/company";
import type { OffshoringSession } from "@/types/offshoring";
import type { SalesAssessmentSession } from "@/types/sales-assessment";

/** Where each agent's conversation lives. One source of truth for both callers. */
export const AGENT_ROUTE: Record<AskAgent, AppHref> = {
  sales: "/agents/assessment",
  offshoring: "/agents/offshoring",
};

/**
 * Progress that starting a new assessment would discard.
 *
 * Both agents keep exactly one session under one key, so opening an assessment
 * for a company replaces whatever was in flight. Callers confirm on a truthy
 * result rather than silently dropping captured answers.
 */
export function conflictingSession(
  agent: AskAgent,
  sales: SalesAssessmentSession | null,
  offshoring: OffshoringSession | null,
): Resumable | undefined {
  const resumable =
    agent === "sales" ? buildSalesResumable(sales) : buildOffshoringResumable(offshoring);

  // Nothing captured yet means nothing worth a confirmation prompt.
  if (!resumable || resumable.captured === 0) return undefined;
  return resumable;
}

/**
 * Opens an agent with the company already chosen.
 *
 * Starts the agent's session from scratch and immediately answers its opening
 * "which company?" question, which advances the session past that prompt — so
 * the chat lands on the first real question instead of asking again. The run is
 * recorded too, so home's resume list and the agent agree on the company.
 *
 * Client-only: every store it touches reads localStorage. Navigate after this
 * resolves; it does not route by itself.
 */
export function startAssessmentFor(agent: AskAgent, company: Company): void {
  if (agent === "sales") {
    const fresh = startFreshSalesSession();
    saveSalesSession(selectSalesCompany(fresh, company.id, company.name));
    saveCompanySelection("assessment", company.id);
    return;
  }

  const fresh = startFreshOffshoringSession();
  saveOffshoringSession(selectOffshoringCompany(fresh, company.id, company.name));
  saveCompanySelection("offshoring", company.id);
}
