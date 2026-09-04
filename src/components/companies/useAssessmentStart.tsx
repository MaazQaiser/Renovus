"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import {
  getSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import {
  getOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import type { AskAgent } from "@/lib/home/ask";
import {
  AGENT_ROUTE,
  SALES_METHOD_ROUTE,
  conflictingSession,
  startAssessmentFor,
  type SalesMethod,
} from "@/lib/home/start-assessment";
import type { Company } from "@/types/company";

/**
 * Starting an assessment for a PortCo, wherever that is offered.
 *
 * One thing always has to happen first, and it was previously written out at
 * each entry point: either agent confirms before replacing an assessment
 * already in flight, since each keeps a single session and starting one drops
 * the other.
 *
 * Sales opens on its export screen, which is where the choice between an
 * export and the interview is made — so this does not ask first.
 *
 * Returns the trigger plus the overlays to render; the caller decides where the
 * trigger lives.
 */

/** Both session stores return null server-side. */
const noSession = () => null;

export interface AssessmentStart {
  /**
   * Starts the agent, confirming first if that would discard progress.
   *
   * `method` picks which way into a sales baseline — the export screen or the
   * interview. It is ignored for every other agent.
   */
  start: (agent: AskAgent, method?: SalesMethod) => void;
  /** Render once inside the calling screen. */
  overlays: React.ReactNode;
}

export function useAssessmentStart(company: Company | undefined): AssessmentStart {
  const router = useRouter();

  const salesSession = useSyncExternalStore(
    subscribeToSalesSession,
    getSalesSession,
    noSession,
  );
  const offshoringSession = useSyncExternalStore(
    subscribeToOffshoringSession,
    getOffshoringSession,
    noSession,
  );

  const [pending, setPending] = useState<AskAgent | undefined>();
  /** Carried across the discard prompt so the confirmed start keeps it. */
  const [method, setMethod] = useState<SalesMethod>("export");

  function go(agent: AskAgent, chosen: SalesMethod) {
    if (!company) return;
    startAssessmentFor(agent, company);
    router.push(agent === "sales" ? SALES_METHOD_ROUTE[chosen] : AGENT_ROUTE[agent]);
  }

  function start(agent: AskAgent, chosen: SalesMethod = "export") {
    setMethod(chosen);
    if (conflictingSession(agent, salesSession, offshoringSession)) {
      setPending(agent);
      return;
    }
    go(agent, chosen);
  }

  const conflict = pending
    ? conflictingSession(pending, salesSession, offshoringSession)
    : undefined;

  const overlays = company ? (
    <>
      <ConfirmationDialog
        open={Boolean(pending)}
        onOpenChange={(open) => {
          if (!open) setPending(undefined);
        }}
        title="Discard the assessment in progress?"
        description={
          conflict
            ? `Starting this assessment for ${company.name} replaces the one${
                conflict.companyName ? ` for ${conflict.companyName}` : ""
              } on this device, including ${conflict.captured} captured answer${
                conflict.captured === 1 ? "" : "s"
              }. This cannot be undone.`
            : ""
        }
        confirmLabel="Discard and start"
        cancelLabel="Keep progress"
        tone="danger"
        onConfirm={() => {
          if (pending) go(pending, method);
          setPending(undefined);
        }}
      />
    </>
  ) : null;

  return { start, overlays };
}
