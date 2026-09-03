"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
import {
  getServerCompanies,
  listCompanies,
  subscribeToCompanies,
} from "@/lib/companies";
import { getServerRecords, listRecords, subscribeToRecords } from "@/lib/records";
import { resolveAsk, SUGGESTED_PROMPTS, type AskReply } from "@/lib/home/ask";
import {
  conflictingSession,
  startAssessmentFor,
} from "@/lib/home/start-assessment";
import { createId } from "@/lib/id";
import type { Company } from "@/types/company";
import { AskBar } from "./AskBar";
import { AskThread, type AskTurn } from "./AskThread";
import { SectionLabel } from "./SectionLabel";

/** Both session stores return null server-side. */
const noSession = () => null;

export function AskPanel() {
  const router = useRouter();

  const companies = useSyncExternalStore(
    subscribeToCompanies,
    listCompanies,
    getServerCompanies,
  );
  const records = useSyncExternalStore(subscribeToRecords, listRecords, getServerRecords);
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

  const [turns, setTurns] = useState<AskTurn[]>([]);
  const [pendingStart, setPendingStart] = useState<AskReply | undefined>();
  const tailRef = useRef<HTMLDivElement>(null);

  // The ask bar is sticky, so a new answer lands behind it until the thread's
  // tail is brought into view.
  useEffect(() => {
    if (turns.length === 0) return;
    tailRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length]);

  function ask(question: string) {
    setTurns((current) => [
      ...current,
      { id: createId("ask"), question, reply: resolveAsk(question, companies, records) },
    ]);
  }

  /** A company chip asks the obvious follow-up rather than answering silently. */
  function pickCompany(company: Company) {
    ask(`How is ${company.name} doing?`);
  }

  function go(reply: AskReply) {
    if (!reply.company || !reply.next) return;
    startAssessmentFor(reply.next.agent, reply.company);
    router.push(reply.next.route);
  }

  function start(reply: AskReply) {
    if (!reply.company || !reply.next) return;

    // Starting replaces the agent's single session, so captured answers that
    // would be lost get a confirmation first.
    if (conflictingSession(reply.next.agent, salesSession, offshoringSession)) {
      setPendingStart(reply);
      return;
    }
    go(reply);
  }

  const conflict = pendingStart?.next
    ? conflictingSession(pendingStart.next.agent, salesSession, offshoringSession)
    : undefined;

  return (
    <section className="flex flex-col">
      {turns.length > 0 ? (
        <>
          <SectionLabel className="mb-3">Ask</SectionLabel>
          <AskThread turns={turns} onPickCompany={pickCompany} onStart={start} />
        </>
      ) : null}

      <div ref={tailRef} aria-hidden />

      <div className="sticky bottom-0 z-10 flex flex-col items-center gap-2 pb-4 pt-8">
        {turns.length === 0 ? (
          <ul className="flex w-full max-w-[560px] flex-wrap justify-center gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <li key={prompt}>
                <button
                  type="button"
                  onClick={() => ask(prompt)}
                  className="rounded-full border border-glass-border bg-glass px-3 py-1 text-[13px] leading-5 text-secondary backdrop-blur-xl transition-colors duration-[140ms] hover:bg-glass-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {prompt}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <AskBar onSubmit={ask} />
      </div>

      <ConfirmationDialog
        open={Boolean(pendingStart)}
        onOpenChange={(open) => {
          if (!open) setPendingStart(undefined);
        }}
        title="Discard the assessment in progress?"
        description={
          conflict && pendingStart?.company
            ? `Starting the ${pendingStart.next?.agentLabel.toLowerCase()} for ${
                pendingStart.company.name
              } replaces the one${
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
          if (pendingStart) go(pendingStart);
          setPendingStart(undefined);
        }}
      />
    </section>
  );
}
