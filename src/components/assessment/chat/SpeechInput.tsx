"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

export type SpeechState = "idle" | "recording" | "transcribing";

export interface SpeechInputProps {
  disabled?: boolean;
  onTranscript: (text: string) => void;
  mockTranscript: string;
  className?: string;
}

export function SpeechInput({
  disabled,
  onTranscript,
  mockTranscript,
  className,
}: SpeechInputProps) {
  const [state, setState] = useState<SpeechState>("idle");

  const start = () => {
    if (disabled || state !== "idle") return;
    setState("recording");
    window.setTimeout(() => {
      setState("transcribing");
      window.setTimeout(() => {
        onTranscript(mockTranscript);
        setState("idle");
      }, 700);
    }, 1200);
  };

  const stop = () => {
    if (state !== "recording") return;
    setState("transcribing");
    window.setTimeout(() => {
      onTranscript(mockTranscript);
      setState("idle");
    }, 500);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {state === "recording" ? (
        <>
          <Text size="caption" tone="error" className="animate-pulse">
            Listening…
          </Text>
          <IconButton
            icon={Square}
            label="Stop recording"
            variant="ghost"
            size="md"
            onClick={stop}
          />
        </>
      ) : state === "transcribing" ? (
        <Text size="caption" tone="secondary">
          Transcribing…
        </Text>
      ) : (
        <IconButton
          icon={Mic}
          label="Speak answer"
          variant="ghost"
          size="md"
          disabled={disabled}
          onClick={start}
        />
      )}
    </div>
  );
}
