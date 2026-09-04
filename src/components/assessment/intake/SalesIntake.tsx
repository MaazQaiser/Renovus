"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/components/primitives/Text";
import { CompanySelectionPrompt } from "@/components/assessment/chat/CompanySelectionPrompt";
import { QuickPickGroup } from "@/components/assessment/chat/QuickPick";
import { InterviewStage } from "@/components/interview/InterviewStage";
import { StageComposer } from "@/components/interview/StageComposer";
import { parseIntakeCsv } from "@/lib/assessment/csv-intake";
import { buildIntakeQuestions, toClarificationAnswer } from "@/lib/assessment/intake-questions";
import { buildIntakeSession } from "@/lib/assessment/intake-session";
import { createId } from "@/lib/id";
import { buildBaselineRecord } from "@/lib/pre-assessment";
import { recordHref } from "@/components/records/recordMeta";
import { buildSalesRecord, buildSalesReport } from "@/lib/assessment/sales-report";
import {
  getOrInitSalesSession,
  getServerSalesSession,
  saveSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import { selectCompany } from "@/lib/assessment/sales-engine";
import { assessedCompanyCount, saveRecord } from "@/lib/records";
import { saveCompanySelection } from "@/lib/runs";
import { useSession } from "@/providers/SessionProvider";
import type { SalesAnswer } from "@/types/sales-assessment";
import type {
  IntakeExtract,
  IntakeParseFailure,
  IntakeStep,
} from "@/types/sales-intake";
import { IntakeProgress } from "./IntakeProgress";
import { IntakeUploadPanel } from "./IntakeUploadPanel";

/**
 * The sales baseline read from a CRM export.
 *
 * The same four moves every time: take the file, show what it says, ask only
 * what it cannot say, then build the report. It ends in exactly the same place
 * as the conversational assessment — one `SalesAssessmentSession` through
 * `buildSalesReport` — so the two paths cannot drift into two report formats.
 */

const READING_STEPS = [
  "Reading the file and matching its columns",
  "Splitting won, lost and open, and pricing each",
  "Measuring cycle length, source mix and owner concentration",
  "Marking what a system of record cannot answer",
];

const BUILDING_STEPS = [
  "Writing the answers against the question bank",
  "Counting the confidence tags",
  "Assembling the channel and people maps",
  "Matching the AI candidate menu to the evidence",
];

export function SalesIntake() {
  const router = useRouter();
  const { session: authSession } = useSession();

  const salesSession = useSyncExternalStore(
    subscribeToSalesSession,
    getOrInitSalesSession,
    getServerSalesSession,
  );

  const [step, setStep] = useState<IntakeStep>("upload");
  const [extract, setExtract] = useState<IntakeExtract | undefined>();
  const [failure, setFailure] = useState<IntakeParseFailure | undefined>();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [clarifications, setClarifications] = useState<Record<string, SalesAnswer>>({});
  const [draft, setDraft] = useState("");
  /** Kept stable across draft saves so the rail is not remounted each answer. */
  const [sessionId] = useState(() => createId("sales-intake"));

  const companyId = salesSession.companyId;
  const companyName = salesSession.companyName;

  const questions = useMemo(
    () => (extract ? buildIntakeQuestions(extract) : []),
    [extract],
  );
  const question = questions[questionIndex];

  const handleCompany = (id: string, name: string) => {
    saveSalesSession(selectCompany(getOrInitSalesSession(), id, name));
    saveCompanySelection("assessment", id);
  };

  /**
   * Persists what is captured so far. Written at each step rather than only at
   * the end, so the rail on the right counts the export's answers as soon as
   * the reading pass is done — the export closes out most of Phase 1, and the
   * rail is where that becomes visible.
   */
  const persist = useCallback(
    (
      current: IntakeExtract,
      answers: Record<string, SalesAnswer>,
      stage: "draft" | "final",
    ) =>
      buildIntakeSession({
        id: sessionId,
        companyId,
        companyName: companyName ?? "the company",
        extract: current,
        clarifications: answers,
        respondent: authSession
          ? { name: authSession.name, role: authSession.roleLabel }
          : undefined,
        stage,
      }),
    [sessionId, companyId, companyName, authSession],
  );

  const handleFile = (fileName: string, text: string) => {
    const result = parseIntakeCsv(fileName, text);
    if (!result.ok) {
      setFailure(result.failure);
      return;
    }
    setFailure(undefined);
    setExtract(result.extract);
    setStep("reading");
  };

  const handleAnswer = (value: string) => {
    if (!question) return;
    const next = {
      ...clarifications,
      [question.qid]: toClarificationAnswer(question, value),
    };
    setClarifications(next);
    setDraft("");
    if (extract) saveSalesSession(persist(extract, next, "draft"));

    if (questionIndex + 1 < questions.length) {
      setQuestionIndex(questionIndex + 1);
      return;
    }
    setStep("building");
  };

  /**
   * Writes the session, archives both reports, then opens the sales process
   * pre-assessment — the document this route exists to produce.
   *
   * The baseline report is archived alongside it rather than shown: it is what
   * the answers were captured against, and it stays reachable from the PortCo's
   * saved assessments.
   */
  const finish = useCallback(() => {
    if (!extract) return;

    const built = persist(extract, clarifications, "final");
    saveSalesSession(built);

    const baseline = buildSalesReport(built, {
      assessedCompanyCount: assessedCompanyCount(),
    });
    saveRecord(buildSalesRecord(built, baseline));

    const baselineReport = buildBaselineRecord({
      id: createId("rec"),
      companyId,
      companyName: companyName ?? "the company",
      completedAt: new Date().toISOString(),
    });
    saveRecord(baselineReport);

    router.replace(recordHref(baselineReport.id));
  }, [extract, clarifications, persist, companyId, companyName, router]);

  /**
   * The export's answers land when the reading pass finishes, not when the file
   * is picked — the rail filling in behind a running loader would say the work
   * was already done before the screen claimed to be doing it.
   */
  const toQuestions = useCallback(() => {
    if (extract) saveSalesSession(persist(extract, {}, "draft"));
    setStep("questions");
  }, [extract, persist]);

  if (!companyId || !companyName) {
    return (
      <InterviewStage
        stepKey="company"
        headline="Which portfolio company is this export from?"
      >
        <CompanySelectionPrompt onSelect={handleCompany} />
      </InterviewStage>
    );
  }

  if (step === "reading" && extract) {
    return (
      <IntakeProgress
        title="Reading the export"
        caption={`${extract.rowCount} rows from ${extract.fileName}. Everything below is counted from the file — nothing is filled in.`}
        steps={READING_STEPS}
        onDone={toQuestions}
      />
    );
  }

  if (step === "building") {
    return (
      <IntakeProgress
        title="Building the baseline"
        caption="The export answered what a system of record knows; you answered the rest. This assembles Parts A–F from both."
        steps={BUILDING_STEPS}
        durationMs={2400}
        onDone={finish}
      />
    );
  }

  if (step === "questions" && extract && question) {
    const first = questionIndex === 0;
    return (
      <InterviewStage
        stepKey={question.qid}
        context={
          first
            ? [`${questions.length} questions left — the ones no CRM field holds.`]
            : undefined
        }
        headline={question.headline}
      >
        {question.kind === "choice" ? (
          <QuickPickGroup
            key={question.qid}
            label={question.headline}
            options={question.options ?? []}
            onChange={(value) => {
              if (typeof value === "string") handleAnswer(value);
            }}
          />
        ) : (
          <StageComposer
            key={question.qid}
            value={draft}
            onChange={setDraft}
            onSend={() => {
              const trimmed = draft.trim();
              if (!trimmed) return;
              handleAnswer(trimmed);
            }}
            sendDisabled={draft.trim().length === 0}
            placeholder={question.placeholder}
            multiline
          />
        )}
      </InterviewStage>
    );
  }

  return (
    <InterviewStage
      stepKey="upload"
      headline="Start from an opportunity export."
      detail={
        <Text size="body-sm" tone="secondary">
          I will read it, show you exactly what it says, and then ask only the
          few things a system of record cannot know.
        </Text>
      }
    >
      <IntakeUploadPanel
        onFile={handleFile}
        failure={failure}
        onFailureDismiss={() => setFailure(undefined)}
        onQuestionnaire={() => router.push("/agents/assessment")}
      />
    </InterviewStage>
  );
}
