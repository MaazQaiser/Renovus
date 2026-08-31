"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { ConfidenceSelector } from "@/components/assessment/chat/ConfidenceSelector";
import { QuickPickGroup } from "@/components/assessment/chat/QuickPick";
import type { PromptQuestion } from "@/components/assessment/chat/QuestionPrompt";
import type { AnswerValue } from "@/types/question";
import type { ConfidenceLevel } from "@/types/sales-assessment";
import { StageComposer } from "./StageComposer";

const DEFAULT_CONFIDENCE: ConfidenceLevel = "E";

/** Says plainly what to do with the control below — a step is never a dead end. */
function actionHint(question: PromptQuestion, showChoices: boolean): string {
  if (!showChoices) {
    return question.type === "textarea"
      ? "Answer in your own words below."
      : "Type your answer below.";
  }
  if (question.type === "multiple-choice") {
    return "Pick every option that applies, then continue.";
  }
  return question.asksConfidence
    ? "Pick the closest option, then tell me how sure you are."
    : "Pick the closest option to continue.";
}

export interface StageQuestionPromptProps {
  question: PromptQuestion;
  mockTranscript?: string;
  onSubmit: (payload: {
    value: AnswerValue;
    label?: string;
    confidence?: ConfidenceLevel;
    whoWouldKnow?: string;
  }) => void;
}

/**
 * The offshoring interview's answer control. Same behaviour as the shared
 * QuestionPrompt — including the lettered A/B/C quick picks — but laid out for
 * the one-question-at-a-time stage instead of a chat dock.
 */
export function StageQuestionPrompt({
  question,
  onSubmit,
  mockTranscript = "That is something we handle manually today.",
}: StageQuestionPromptProps) {
  const [selected, setSelected] = useState<string | string[] | undefined>(
    question.type === "multiple-choice" ? [] : undefined,
  );
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<ConfidenceLevel | undefined>(
    question.asksConfidence ? DEFAULT_CONFIDENCE : undefined,
  );
  const [whoWouldKnow, setWhoWouldKnow] = useState("");
  const [error, setError] = useState<string | undefined>();

  const requireConfidence = question.asksConfidence;
  const showChoices =
    !!question.options &&
    (question.type === "single-choice" || question.type === "multiple-choice");
  const hasFreeText = question.supportsText;

  const hasChoiceSelected =
    question.type === "multiple-choice"
      ? Array.isArray(selected) && selected.length > 0
      : typeof selected === "string";

  const showConfidence =
    requireConfidence && (hasChoiceSelected || text.trim().length > 0 || !showChoices);

  const needsContinue =
    (question.type === "multiple-choice" && hasChoiceSelected) ||
    (question.type === "single-choice" && requireConfidence && typeof selected === "string");

  const optionLabel = (value: string | string[]) => {
    if (!question.options) return undefined;
    if (Array.isArray(value)) {
      return value
        .map((id) => question.options?.find((option) => option.id === id)?.label ?? id)
        .join(", ");
    }
    return question.options.find((option) => option.id === value)?.label ?? value;
  };

  const sendChoice = (value: string | string[]) => {
    onSubmit({
      value,
      label: optionLabel(value),
      confidence: requireConfidence ? confidence ?? DEFAULT_CONFIDENCE : undefined,
      whoWouldKnow: whoWouldKnow || undefined,
    });
  };

  const sendText = () => {
    const trimmed = text.trim();
    if (!trimmed && question.required) {
      setError("Enter a response to continue.");
      return;
    }
    onSubmit({
      value: trimmed,
      label: trimmed,
      confidence: requireConfidence ? confidence ?? DEFAULT_CONFIDENCE : undefined,
      whoWouldKnow: whoWouldKnow || undefined,
    });
  };

  const handleContinue = () => {
    if (question.type === "multiple-choice" && Array.isArray(selected) && selected.length > 0) {
      sendChoice(selected);
      return;
    }
    if (question.type === "single-choice" && typeof selected === "string") {
      sendChoice(selected);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Text size="caption" tone="tertiary">
        {actionHint(question, showChoices)}
      </Text>

      {showChoices ? (
        <QuickPickGroup
          label={question.question}
          options={question.options!}
          value={selected}
          multiple={question.type === "multiple-choice"}
          onChange={(value) => {
            setError(undefined);
            setText("");
            if (question.type === "single-choice" && typeof value === "string") {
              if (requireConfidence) {
                setSelected(value);
                if (!confidence) setConfidence(DEFAULT_CONFIDENCE);
                return;
              }
              sendChoice(value);
              return;
            }
            setSelected(value);
          }}
        />
      ) : null}

      {showConfidence ? (
        <ConfidenceSelector
          value={confidence}
          onChange={(value) => {
            setConfidence(value);
            setError(undefined);
          }}
          whoWouldKnow={whoWouldKnow}
          onWhoWouldKnowChange={setWhoWouldKnow}
        />
      ) : null}

      {needsContinue ? (
        <div className="flex justify-end">
          <Button size="md" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      ) : null}

      {hasFreeText ? (
        <div className="flex flex-col gap-3">
          {showChoices ? (
            <Text size="caption" tone="tertiary">
              Or answer in your own words
            </Text>
          ) : null}
          <StageComposer
            value={text}
            onChange={(value) => {
              setText(value);
              setSelected(question.type === "multiple-choice" ? [] : undefined);
              setError(undefined);
              if (requireConfidence && value.trim() && !confidence) {
                setConfidence(DEFAULT_CONFIDENCE);
              }
            }}
            onSend={sendText}
            multiline={question.type === "textarea"}
            supportsSpeech={question.supportsSpeech}
            mockTranscript={mockTranscript}
            sendDisabled={question.required ? text.trim().length === 0 : false}
          />
        </div>
      ) : null}

      {error ? (
        <Text size="body-sm" tone="error" role="alert">
          {error}
        </Text>
      ) : null}
    </div>
  );
}
