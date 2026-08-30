"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { QuickPickGroup } from "@/components/assessment/chat/QuickPick";
import { StageComposer } from "@/components/interview/StageComposer";
import type { AnswerValue } from "@/types/question";
import type { ClarificationInputType, OffshoringQuestionOption } from "@/types/offshoring";

export interface ClarificationPromptProps {
  prompt: string;
  inputType: ClarificationInputType;
  options?: OffshoringQuestionOption[];
  required?: boolean;
  onSubmit: (payload: { value: AnswerValue; label?: string }) => void;
}

export function ClarificationPrompt({
  prompt,
  inputType,
  options = [],
  required = true,
  onSubmit,
}: ClarificationPromptProps) {
  const [selected, setSelected] = useState<string | string[] | undefined>(
    inputType === "multiple-choice" ? [] : undefined,
  );
  const [text, setText] = useState("");
  const [error, setError] = useState<string | undefined>();

  if (inputType === "text") {
    return (
      <div className="flex flex-col gap-2">
        <StageComposer
          value={text}
          onChange={(value) => {
            setText(value);
            setError(undefined);
          }}
          onSend={() => {
            const trimmed = text.trim();
            if (!trimmed && required) {
              setError("Enter a response to continue.");
              return;
            }
            onSubmit({ value: trimmed, label: trimmed });
          }}
          sendDisabled={required ? text.trim().length === 0 : false}
          supportsSpeech
          multiline
          placeholder="Type here..."
        />
        {error ? (
          <Text size="body-sm" tone="error" role="alert">
            {error}
          </Text>
        ) : null}
      </div>
    );
  }

  const hasSelection =
    inputType === "multiple-choice"
      ? Array.isArray(selected) && selected.length > 0
      : typeof selected === "string";

  const optionLabel = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value
        .map((id) => options.find((option) => option.id === id)?.label ?? id)
        .join(", ");
    }
    return options.find((option) => option.id === value)?.label ?? value;
  };

  return (
    <div className="flex flex-col gap-3">
      <QuickPickGroup
        label={prompt}
        options={options}
        value={selected}
        multiple={inputType === "multiple-choice"}
        onChange={(value) => {
          setError(undefined);
          if (inputType === "single-choice" && typeof value === "string") {
            onSubmit({ value, label: optionLabel(value) });
            return;
          }
          setSelected(value);
        }}
      />
      {inputType === "multiple-choice" ? (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={!hasSelection}
            onClick={() => {
              if (!Array.isArray(selected) || selected.length === 0) {
                setError("Select at least one option.");
                return;
              }
              onSubmit({ value: selected, label: optionLabel(selected) });
            }}
          >
            Continue
          </Button>
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
