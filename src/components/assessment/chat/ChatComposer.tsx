"use client";

import { Send } from "lucide-react";
import { IconButton } from "@/components/primitives/IconButton";
import { SpeechInput } from "./SpeechInput";
import { cn } from "@/lib/cn";

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  sendDisabled?: boolean;
  supportsSpeech?: boolean;
  mockTranscript?: string;
  multiline?: boolean;
  className?: string;
  trailing?: React.ReactNode;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  placeholder = "Type your answer...",
  disabled,
  sendDisabled,
  supportsSpeech = true,
  mockTranscript = "That is something we handle manually today.",
  multiline,
  className,
  trailing,
}: ChatComposerProps) {
  const submit = () => {
    if (sendDisabled || disabled) return;
    onSend();
  };

  return (
    <div
      className={cn(
        "flex min-h-14 items-end gap-2 rounded-xl border border-border bg-surface px-2 py-2",
        className,
      )}
    >
      {multiline ? (
        <textarea
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          className="max-h-24 min-h-10 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-foreground placeholder:text-tertiary focus:outline-none"
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-foreground placeholder:text-tertiary focus:outline-none"
        />
      )}

      {trailing}

      <div className="mb-0.5 flex shrink-0 items-center gap-1.5">
        {supportsSpeech ? (
          <SpeechInput
            disabled={disabled}
            mockTranscript={mockTranscript}
            onTranscript={onChange}
          />
        ) : null}
        <IconButton
          icon={Send}
          label="Send answer"
          variant="primary"
          size="md"
          className="rounded-full"
          disabled={disabled || sendDisabled}
          onClick={submit}
        />
      </div>
    </div>
  );
}
