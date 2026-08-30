"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CompanySelectionPrompt } from "@/components/assessment/chat/CompanySelectionPrompt";
import { TypingIndicator } from "@/components/assessment/chat/TypingIndicator";
import { ReviewAnswersPanel } from "@/components/assessment/chat/ReviewAnswersPanel";
import { Button } from "@/components/primitives/Button";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { getCompanyById } from "@/data/companies";
import {
  getOffshoringQuestion,
  offshoringQuestions,
} from "@/data/offshoringQuestions";
import {
  buildOffshoringRecord,
  getActiveClarification,
  jumpToQuestion,
  markProcessing,
  mockOffshoringTranscript,
  persistPayrollFiles,
  resolveQuestionForSession,
  selectCompany,
  skipPayroll,
  submitAnswer,
  submitClarification,
  submitPayroll,
} from "@/lib/offshoring/engine";
import {
  clearOffshoringSession,
  getOrInitOffshoringSession,
  getServerOffshoringSession,
  saveOffshoringSession,
  startFreshOffshoringSession,
  subscribeToOffshoringSession,
} from "@/lib/offshoring/session";
import { saveRecord } from "@/lib/records";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import type { UploadedFile } from "@/types/file";
import type { AnswerValue } from "@/types/question";
import type { ConfidenceLevel } from "@/types/sales-assessment";
import type { OffshoringPhase } from "@/types/offshoring";
import { ClarificationPrompt } from "./ClarificationPrompt";
import { InterviewStage } from "@/components/interview/InterviewStage";
import { InterviewTopbarActions } from "@/components/interview/InterviewTopbarActions";
import { PayrollUploadPrompt } from "./PayrollUploadPrompt";
import { StageQuestionPrompt } from "@/components/interview/StageQuestionPrompt";

const QUESTION_PHASES: OffshoringPhase[] = [
  "round1",
  "round2",
  "round3",
  "value-creation",
];

function findClarificationMeta(
  clarificationId: string,
): { question: string; section: string } | undefined {
  for (const question of offshoringQuestions) {
    const rule = question.clarifications?.find((item) => item.id === clarificationId);
    if (rule) return { question: rule.prompt, section: "clarification" };
  }
  return undefined;
}

function findParentQuestionId(clarificationId: string): string | undefined {
  for (const question of offshoringQuestions) {
    if (question.clarifications?.some((item) => item.id === clarificationId)) {
      return question.id;
    }
  }
  return undefined;
}

export function OffshoringChat() {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToOffshoringSession,
    getOrInitOffshoringSession,
    getServerOffshoringSession,
  );
  const [typing, setTyping] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);

  const company = session.companyId ? getCompanyById(session.companyId) : undefined;
  const companyLabel = session.companyName ?? company?.name;
  const canReview = Object.keys(session.answers).length > 0;

  const topbarMeta = useMemo(
    () => ({
      title: "Offshoring potential assessment",
      badges: companyLabel ? [companyLabel] : undefined,
      actions: (
        <InterviewTopbarActions
          canReview={canReview}
          onReview={() => setReviewOpen(true)}
          onRestart={() => setRestartOpen(true)}
        />
      ),
    }),
    [companyLabel, canReview],
  );

  useSetTopbarMeta(topbarMeta);

  // The interview shows one step at a time: the newest agent message is the
  // headline, and any agent messages since the last reply (round intros, the
  // heatmap preview) become the framing above it.
  const step = useMemo(() => {
    const lastUserIndex = session.messages.findLastIndex(
      (message) => message.role === "user",
    );
    const pending = session.messages.slice(lastUserIndex + 1);
    const headline = pending.at(-1);
    return {
      key: headline?.id ?? "empty",
      headline: headline?.content ?? "",
      context: pending.slice(0, -1).map((message) => message.content),
    };
  }, [session.messages]);

  const persist = (next: typeof session) => {
    saveOffshoringSession(next);
  };

  const withTyping = (build: () => typeof session) => {
    setTyping(true);
    window.setTimeout(() => {
      persist(build());
      setTyping(false);
    }, 280);
  };

  const currentQuestion = session.currentQuestionId
    ? resolveQuestionForSession(session, session.currentQuestionId)
    : undefined;

  const activeClarification = getActiveClarification(session);
  const clarificationOptions = activeClarification?.optionsFromFunctions
    ? session.detectedFunctions.map((fn) => ({ id: fn.id, label: fn.label }))
    : activeClarification?.options;

  const handleCompany = (companyId: string, companyName: string) => {
    withTyping(() => selectCompany(session, companyId, companyName));
  };

  const handleFilesChange = (files: UploadedFile[]) => {
    persist(persistPayrollFiles(session, files));
  };

  const handlePayrollContinue = () => {
    withTyping(() => submitPayroll(session, session.files));
  };

  const handlePayrollSkip = () => {
    withTyping(() => skipPayroll(session));
  };

  const handleAnswer = (payload: {
    value: AnswerValue;
    label?: string;
    confidence?: ConfidenceLevel;
    whoWouldKnow?: string;
  }) => {
    withTyping(() =>
      submitAnswer(session, payload.value, {
        freeLabel: payload.label,
        confidence: payload.confidence,
        whoWouldKnow: payload.whoWouldKnow,
      }),
    );
  };

  const handleClarification = (payload: { value: AnswerValue; label?: string }) => {
    withTyping(() => submitClarification(session, payload.value, payload.label));
  };

  const handleAnalyze = () => {
    const next = markProcessing(session);
    persist(next);
    // Archive the finished assessment so it can be reopened from /agents/records.
    saveRecord(
      buildOffshoringRecord(
        next,
        companyLabel ?? "Portfolio company",
        company?.sector ?? "Education",
      ),
    );
    router.push("/agents/offshoring/processing");
  };

  const inQuestionPhase = QUESTION_PHASES.includes(session.phase);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <InterviewStage
        stepKey={typing ? `${step.key}-typing` : step.key}
        context={step.context}
        headline={step.headline}
      >
        {typing ? (
          <TypingIndicator />
        ) : (
          <>
            {session.phase === "company" ? (
              <CompanySelectionPrompt onSelect={handleCompany} />
            ) : null}

            {session.phase === "payroll" ? (
              <PayrollUploadPrompt
                files={session.files}
                onChange={handleFilesChange}
                onContinue={handlePayrollContinue}
                onSkip={handlePayrollSkip}
              />
            ) : null}

            {inQuestionPhase && activeClarification ? (
              <ClarificationPrompt
                key={activeClarification.id}
                prompt={activeClarification.prompt}
                inputType={activeClarification.inputType ?? "text"}
                options={clarificationOptions}
                required={activeClarification.required !== false}
                onSubmit={handleClarification}
              />
            ) : null}

            {inQuestionPhase && !session.clarificationId && currentQuestion ? (
              <StageQuestionPrompt
                key={currentQuestion.id}
                question={currentQuestion}
                mockTranscript={mockOffshoringTranscript(currentQuestion)}
                onSubmit={handleAnswer}
              />
            ) : null}

            {session.phase === "complete" ? (
              <Button size="lg" fullWidth onClick={handleAnalyze}>
                Analyze offshoring potential
              </Button>
            ) : null}
          </>
        )}
      </InterviewStage>

      <ReviewAnswersPanel
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        answers={session.answers}
        getQuestion={(id) => {
          const question = getOffshoringQuestion(id);
          if (question) {
            return { question: question.question, section: question.section };
          }
          return findClarificationMeta(id);
        }}
        onJump={(questionId) => {
          const primary = getOffshoringQuestion(questionId)
            ? questionId
            : findParentQuestionId(questionId);
          if (!primary) return;
          withTyping(() => jumpToQuestion(session, primary));
        }}
      />

      <ConfirmationDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        title="Start over?"
        description="This discards the in-progress offshoring assessment on this device."
        confirmLabel="Start over"
        cancelLabel="Keep progress"
        tone="danger"
        onConfirm={() => {
          clearOffshoringSession();
          startFreshOffshoringSession();
          setRestartOpen(false);
        }}
      />
    </div>
  );
}
