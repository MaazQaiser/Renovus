import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

export interface ChatTranscriptMessage {
  role: "agent" | "user";
  content: string;
  kind?: string;
}

export interface ChatMessageProps {
  message: ChatTranscriptMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "user") {
    return <UserMessage content={message.content} />;
  }
  return <AgentMessage content={message.content} kind={message.kind} />;
}

/** Flat agent copy — sits on the page background, no bubble. */
export function AgentMessage({
  content,
  kind,
}: {
  content: string;
  kind?: string;
}) {
  const isQuestion = kind === "question";
  const isCompanyPrompt = kind === "company-prompt";

  return (
    <div className="w-full max-w-[40rem] py-2">
      <Text
        tone="primary"
        weight={isCompanyPrompt || isQuestion ? "medium" : "regular"}
        className={cn(
          "whitespace-pre-wrap text-foreground",
          isCompanyPrompt
            ? "text-[22px] leading-8"
            : isQuestion
              ? "text-[18px] leading-7"
              : "text-[15px] leading-7",
        )}
      >
        {content}
      </Text>
    </div>
  );
}

/** Strong accent pill for the user’s reply — ChatGPT / Claude style. */
export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end py-2">
      <div
        className={cn(
          "max-w-[85%] rounded-[1.25rem] bg-accent px-4 py-2.5 text-left",
        )}
      >
        <Text tone="inverse" className="whitespace-pre-wrap text-[15px] leading-6">
          {content}
        </Text>
      </div>
    </div>
  );
}
