"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Keyboard, Mic, Paperclip, Square } from "lucide-react";
import { Text } from "@/components/primitives/Text";
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
          ? "border-accent-border bg-accent-subtle text-accent"
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
  const [speech, setSpeech] = useState<SpeechState>("idle");
  const timers = useRef<number[]>([]);

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

  const startSpeech = () => {
    if (speech !== "idle") return;
    setSpeech("recording");
    timers.current.push(
      window.setTimeout(() => {
        setSpeech("transcribing");
        timers.current.push(
          window.setTimeout(() => {
            onChange(mockTranscript);
            setSpeech("idle");
          }, 700),
        );
      }, 1200),
    );
  };

  const stopSpeech = () => {
    if (speech !== "recording") return;
    setSpeech("transcribing");
    timers.current.push(
      window.setTimeout(() => {
        onChange(mockTranscript);
        setSpeech("idle");
      }, 500),
    );
  };

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
              : "bg-primary text-inverse hover:bg-accent",
          )}
        >
          <ArrowRight size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      <div className="flex items-center justify-center gap-3">
        <ModeButton
          icon={Keyboard}
          label="Type your answer"
          active={speech === "idle"}
          onClick={() => inputRef.current?.focus()}
        />
        {supportsSpeech ? (
          speech === "recording" ? (
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
              active={speech === "transcribing"}
              onClick={startSpeech}
            />
          )
        ) : null}
        {onAttach ? (
          <ModeButton icon={Paperclip} label="Attach a file" onClick={onAttach} />
        ) : null}
      </div>

      {speech !== "idle" ? (
        <Text
          size="caption"
          tone={speech === "recording" ? "error" : "secondary"}
          className={cn("text-center", speech === "recording" && "animate-pulse")}
          role="status"
        >
          {speech === "recording" ? "Listening…" : "Transcribing…"}
        </Text>
      ) : null}
    </div>
  );
}
