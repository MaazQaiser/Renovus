"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { QuickPickGroup } from "./QuickPick";
import { ConfidenceSelector } from "./ConfidenceSelector";
import { ChatComposer } from "./ChatComposer";
import type { AnswerValue } from "@/types/question";
import type { ConfidenceLevel } from "@/types/sales-assessment";

const DEFAULT_CONFIDENCE: ConfidenceLevel = "E";

export interface PromptQuestion {
  id: string;
  question: string;
  type: "single-choice" | "multiple-choice" | "text" | "textarea";
  options?: { id: string; label: string }[];
  required: boolean;
  supportsText: boolean;
  supportsSpeech: boolean;
  asksConfidence: boolean;
}

export interface QuestionPromptProps {
  question: PromptQuestion;
  mockTranscript?: string;
  onSubmit: (payload: {
    value: AnswerValue;
    label?: string;
    confidence?: ConfidenceLevel;
    whoWouldKnow?: string;
  }) => void;
}

export function QuestionPrompt({
  question,
  onSubmit,
  mockTranscript = "That is something we handle manually today.",
}: QuestionPromptProps) {
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
    const level = requireConfidence ? confidence ?? DEFAULT_CONFIDENCE : undefined;
    onSubmit({
      value,
      label: optionLabel(value),
      confidence: level,
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
    <div className="flex flex-col gap-3">
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

      {hasFreeText || needsContinue ? (
        <div className="flex flex-col gap-2">
          {hasFreeText && showChoices || needsContinue ? (
            <div className="flex items-center justify-between gap-3">
              {hasFreeText && showChoices ? (
                <Text size="caption" tone="secondary">
                  Or type something else
                </Text>
              ) : (
                <span />
              )}
              {needsContinue ? (
                <Button size="sm" className="shrink-0" onClick={handleContinue}>
                  Continue
                </Button>
              ) : null}
            </div>
          ) : null}
          {hasFreeText ? (
            <ChatComposer
              className="min-w-0 w-full"
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
              placeholder={showChoices ? "Type your own answer..." : "Type your answer..."}
            />
          ) : null}
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
