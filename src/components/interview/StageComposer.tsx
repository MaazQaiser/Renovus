"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Keyboard, Mic, Paperclip, Square } from "lucide-react";
import { Text } from "@/components/primitives/Text";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cn } from "@/lib/cn";

type SpeechState = "idle" | "recording" | "transcribing";

export interface StageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  sendDisabled?: boolean;
  multiline?: boolean;
  supportsSpeech?: boolean;
  /**
   * Canned answer used only where the browser has no Web Speech API, so the
   * walkthrough still demonstrates the dictation step.
   */
  mockTranscript?: string;
  /** Rendered as a third mode button; used by steps that accept a file. */
  onAttach?: () => void;
  className?: string;
}

function ModeButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Keyboard;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-11 items-center justify-center rounded-full border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        active
          ? "border-gold-border bg-gold-subtle text-gold-ink"
          : "border-border bg-surface text-secondary hover:border-border-strong hover:text-foreground",
      )}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden />
    </button>
  );
}

export function StageComposer({
  value,
  onChange,
  onSend,
  placeholder = "Type here...",
  sendDisabled,
  multiline,
  supportsSpeech = true,
  mockTranscript = "That is something we handle manually today.",
  onAttach,
  className,
}: StageComposerProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [mockSpeech, setMockSpeech] = useState<SpeechState>("idle");
  const timers = useRef<number[]>([]);

  /*
   * Whatever was already typed when dictation started. Each result rewrites the
   * field from this baseline, so revised words replace rather than pile up, and
   * anything typed beforehand survives.
   */
  const baseValueRef = useRef("");

  const speech = useSpeechToText({
    onTranscript: (text) => {
      const base = baseValueRef.current;
      onChange(base && text ? `${base.trimEnd()} ${text}` : base + text);
    },
  });

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const submit = () => {
    if (sendDisabled) return;
    onSend();
  };

  const startMockSpeech = () => {
    if (mockSpeech !== "idle") return;
    setMockSpeech("recording");
    timers.current.push(
      window.setTimeout(() => {
        setMockSpeech("transcribing");
        timers.current.push(
          window.setTimeout(() => {
            onChange(mockTranscript);
            setMockSpeech("idle");
          }, 700),
        );
      }, 1200),
    );
  };

  const stopMockSpeech = () => {
    if (mockSpeech !== "recording") return;
    setMockSpeech("transcribing");
    timers.current.push(
      window.setTimeout(() => {
        onChange(mockTranscript);
        setMockSpeech("idle");
      }, 500),
    );
  };

  const startSpeech = () => {
    if (!speech.supported) {
      startMockSpeech();
      return;
    }
    baseValueRef.current = value;
    speech.start();
  };

  const stopSpeech = () => {
    if (!speech.supported) {
      stopMockSpeech();
      return;
    }
    speech.stop();
    inputRef.current?.focus();
  };

  const state: SpeechState = speech.supported
    ? speech.status === "listening"
      ? "recording"
      : speech.status === "stopping"
        ? "transcribing"
        : "idle"
    : mockSpeech;

  const inputClassName =
    "min-w-0 flex-1 resize-none bg-transparent text-[17px] leading-7 text-foreground placeholder:text-tertiary focus:outline-none";

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-end gap-3 border-b border-border pb-3">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            rows={1}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            className={cn(inputClassName, "max-h-32 py-1")}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
            className={cn(inputClassName, "h-9")}
          />
        )}

        <button
          type="button"
          onClick={submit}
          disabled={sendDisabled}
          aria-label="Send answer"
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            sendDisabled
              ? "cursor-not-allowed bg-surface-tertiary text-tertiary"
              : "bg-gold text-primary hover:bg-gold-hover",
          )}
        >
          <ArrowRight size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <ModeButton
          icon={Keyboard}
          label="Type your answer"
          active={state === "idle"}
          onClick={() => inputRef.current?.focus()}
        />
        {supportsSpeech ? (
          state === "recording" ? (
            <ModeButton
              icon={Square}
              label="Stop recording"
              active
              onClick={stopSpeech}
            />
          ) : (
            <ModeButton
              icon={Mic}
              label="Speak your answer"
              active={state === "transcribing"}
              onClick={startSpeech}
            />
          )
        ) : null}
        {onAttach ? (
          <ModeButton icon={Paperclip} label="Attach a file" onClick={onAttach} />
        ) : null}
      </div>

      {speech.error && state === "idle" ? (
        <Text size="caption" tone="error" className="text-center" role="status">
          {speech.error}
        </Text>
      ) : state !== "idle" ? (
        <Text
          size="caption"
          tone={state === "recording" ? "error" : "secondary"}
          className={cn("text-center", state === "recording" && "animate-pulse")}
          role="status"
        >
          {state === "recording" ? "Listening…" : "Transcribing…"}
        </Text>
      ) : null}
    </div>
  );
}
