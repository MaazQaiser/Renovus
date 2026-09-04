"use client";

import { useState } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cn } from "@/lib/cn";

export interface AskBarProps {
  /** Handed the trimmed question; the input clears itself. */
  onSubmit: (question: string) => void;
  placeholder?: string;
}

/**
 * The ask bar. Dictation is real — the same speech hook the interview composer
 * uses — and submit runs the scripted answer in lib/home/ask.
 */
export function AskBar({
  onSubmit,
  placeholder = "Ask about your assessments…",
}: AskBarProps) {
  const [value, setValue] = useState("");

  const speech = useSpeechToText({
    onTranscript: (transcript) =>
      setValue((current) => (current ? `${current} ${transcript}` : transcript)),
  });

  const listening = speech.status === "listening";

  function submit() {
    const question = value.trim();
    if (question.length === 0) return;
    if (listening) speech.stop();
    setValue("");
    onSubmit(question);
  }

  return (
    <form
      className={cn(
        "flex w-full max-w-[560px] items-center gap-1 rounded-control border border-glass-border bg-glass-strong py-1.5 pl-5 pr-1.5 shadow-[var(--shadow-raised)] backdrop-blur-3xl",
        listening && "border-accent",
      )}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        // Explicit rather than relying on implicit form submission, which the
        // disabled send button suppresses the moment the field is empty.
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          submit();
        }}
        placeholder={placeholder}
        aria-label="Ask about your assessments"
        className="min-w-0 flex-1 bg-transparent text-[14px] leading-6 text-foreground outline-none placeholder:text-tertiary"
      />

      {speech.supported ? (
        <IconButton
          icon={listening ? Square : Mic}
          label={listening ? "Stop dictating" : "Dictate"}
          size="sm"
          variant="ghost"
          className={cn(listening && "text-accent")}
          onClick={() => (listening ? speech.stop() : speech.start())}
        />
      ) : null}

      <IconButton
        icon={ArrowUp}
        label="Send"
        size="sm"
        variant="primary"
        type="submit"
        disabled={value.trim().length === 0}
      />
    </form>
  );
}
