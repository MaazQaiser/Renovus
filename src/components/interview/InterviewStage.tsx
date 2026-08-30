import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";
import { AgentAvatar } from "./AgentAvatar";

export interface InterviewStageProps {
  /** Changing this replays the enter animation — pass the current step's id. */
  stepKey: string;
  /** Agent framing shown above the headline (preview blocks, round intros). */
  context?: string[];
  headline: string;
  /** The answer control: options, composer, upload, or the analyze button. */
  children: React.ReactNode;
  className?: string;
}

export function InterviewStage({
  stepKey,
  context = [],
  headline,
  children,
  className,
}: InterviewStageProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", className)}>
      <div className="mx-auto flex w-full max-w-[640px] flex-1 flex-col justify-center px-6 py-10 md:px-8">
        <div key={stepKey} className="animate-stage-enter flex flex-col gap-6">
          <AgentAvatar />

          {context.length > 0 ? (
            <div className="flex flex-col gap-3">
              {context.map((line, index) => (
                <Text
                  key={index}
                  size="body-sm"
                  tone="secondary"
                  className="whitespace-pre-wrap"
                >
                  {line}
                </Text>
              ))}
            </div>
          ) : null}

          <h2 className="font-display text-[26px] leading-9 font-semibold tracking-[-0.015em] text-foreground md:text-[30px] md:leading-10">
            {headline}
          </h2>

          <div className="flex flex-col gap-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
