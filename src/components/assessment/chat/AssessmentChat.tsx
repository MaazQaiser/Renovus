"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CompanySelectionPrompt } from "./CompanySelectionPrompt";
import { ChannelMatrixPrompt } from "./ChannelMatrixPrompt";
import { GatePanel } from "./GatePanel";
import { RespondentPrompt } from "./RespondentPrompt";
import { TypingIndicator } from "./TypingIndicator";
import { ReviewAnswersPanel } from "./ReviewAnswersPanel";
import { InterviewStage } from "@/components/interview/InterviewStage";
import { InterviewTopbarActions } from "@/components/interview/InterviewTopbarActions";
import { ShareDialog } from "@/components/interview/ShareDialog";
import { StageComposer } from "@/components/interview/StageComposer";
import { StageQuestionPrompt } from "@/components/interview/StageQuestionPrompt";
import { Button } from "@/components/primitives/Button";
import { ConfirmationDialog } from "@/components/overlay/ConfirmationDialog";
import { getCompanyById } from "@/lib/companies";
import { getSalesQuestion } from "@/data/sales";
import {
  acceptGate,
  effectiveClassification,
  jumpToQuestion,
  markProcessing,
  mockSpeechTranscript,
  overrideClassification,
  resolveQuestion,
  selectCompany,
  submitAnswer,
  submitGateCorrection,
  submitRespondent,
  submitWho,
} from "@/lib/assessment/sales-engine";
import {
  clearSalesSession,
  getOrInitSalesSession,
  getServerSalesSession,
  saveSalesSession,
  startFreshSalesSession,
  subscribeToSalesSession,
} from "@/lib/assessment/sales-session";
import { buildSalesRecord, buildSalesReport } from "@/lib/assessment/sales-report";
import { assessedCompanyCount, saveRecord } from "@/lib/records";
import { useSetTopbarMeta } from "@/providers/TopbarMetaProvider";
import type { AnswerValue } from "@/types/question";
import type { ConfidenceLevel } from "@/types/sales-assessment";

export function AssessmentChat() {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToSalesSession,
    getOrInitSalesSession,
    getServerSalesSession,
  );
  const [typing, setTyping] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [restartOpen, setRestartOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [whoText, setWhoText] = useState("");

  const company = session.companyId ? getCompanyById(session.companyId) : undefined;
  const companyLabel = session.companyName ?? company?.name;
  const canReview = Object.keys(session.answers).length > 0;

  const topbarMeta = useMemo(
    () => ({
      title: "Sales function Assessment",
      badges: companyLabel ? [companyLabel, "Sales"] : undefined,
      actions: (
        <InterviewTopbarActions
          canReview={canReview}
          onReview={() => setReviewOpen(true)}
          onRestart={() => setRestartOpen(true)}
          onShare={() => setShareOpen(true)}
        />
      ),
    }),
    [companyLabel, canReview],
  );

  useSetTopbarMeta(topbarMeta);

  // One step at a time: the newest agent message is the headline, and anything
  // the agent said since the last reply becomes framing above it.
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
    saveSalesSession(next);
  };

  const withTyping = (build: () => typeof session) => {
    setTyping(true);
    window.setTimeout(() => {
      persist(build());
      setTyping(false);
    }, 280);
  };

  const currentQuestion = session.currentQuestionId
    ? resolveQuestion(session, session.currentQuestionId)
    : undefined;

  const handleAnswer = (payload: {
    value: AnswerValue;
    label?: string;
    confidence?: ConfidenceLevel;
  }) => {
    withTyping(() =>
      submitAnswer(session, payload.value, {
        freeLabel: payload.label,
        confidence: payload.confidence,
      }),
    );
  };

  const handleAnalyze = () => {
    const next = markProcessing(session);
    persist(next);
    // Archive the finished assessment so it can be reopened from /agents/records.
    const report = buildSalesReport(next, {
      assessedCompanyCount: assessedCompanyCount(),
    });
    saveRecord(buildSalesRecord(next, report));
    router.push("/agents/assessment/processing");
  };

  const classification = effectiveClassification(session) ?? "mixed";
  // The →WHO probe blocks everything else until it's answered.
  const awaitingWho = Boolean(session.pendingWhoFor);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <InterviewStage
        stepKey={typing ? `${step.key}-typing` : step.key}
        context={step.context}
        headline={step.headline}
      >
        {typing ? (
          <TypingIndicator />
        ) : awaitingWho ? (
          <StageComposer
            value={whoText}
            onChange={setWhoText}
            onSend={() => {
              const name = whoText.trim();
              if (!name) return;
              setWhoText("");
              withTyping(() => submitWho(session, name));
            }}
            sendDisabled={whoText.trim().length === 0}
            supportsSpeech={false}
            placeholder="Name or role…"
          />
        ) : (
          <>
            {session.phase === "company" ? (
              <CompanySelectionPrompt
                onSelect={(companyId, companyName) =>
                  withTyping(() => selectCompany(session, companyId, companyName))
                }
              />
            ) : null}

            {session.phase === "respondent" ? (
              <RespondentPrompt
                onSubmit={(name, role) =>
                  withTyping(() => submitRespondent(session, name, role))
                }
              />
            ) : null}

            {session.phase === "gate" ? (
              <GatePanel
                session={session}
                classification={classification}
                onCorrect={(text) => persist(submitGateCorrection(session, text))}
                onOverride={(next) => persist(overrideClassification(session, next))}
                onAccept={() => withTyping(() => acceptGate(session))}
              />
            ) : null}

            {currentQuestion && currentQuestion.type === "channel-matrix" ? (
              <ChannelMatrixPrompt
                key={currentQuestion.id}
                onSubmit={(payload) =>
                  withTyping(() =>
                    submitAnswer(session, payload.value, { freeLabel: payload.label }),
                  )
                }
              />
            ) : null}

            {currentQuestion && currentQuestion.type !== "channel-matrix" ? (
              <StageQuestionPrompt
                key={currentQuestion.id}
                question={{ ...currentQuestion, type: currentQuestion.type }}
                mockTranscript={mockSpeechTranscript(currentQuestion)}
                onSubmit={handleAnswer}
              />
            ) : null}

            {session.phase === "complete" ? (
              <Button size="lg" fullWidth onClick={handleAnalyze}>
                Build the baseline report
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
          const question = getSalesQuestion(id);
          return question
            ? { question: question.question, section: question.section }
            : undefined;
        }}
        onJump={(questionId) => {
          withTyping(() => jumpToQuestion(session, questionId));
        }}
      />

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        subject="sales"
        path="/agents/assessment"
        label={
          companyLabel
            ? `sales assessment for ${companyLabel}`
            : "sales function assessment"
        }
      />

      <ConfirmationDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        title="Start over?"
        description="This discards the in-progress sales assessment on this device."
        confirmLabel="Start over"
        cancelLabel="Keep progress"
        tone="danger"
        onConfirm={() => {
          clearSalesSession();
          startFreshSalesSession();
          setRestartOpen(false);
        }}
      />
    </div>
  );
}
