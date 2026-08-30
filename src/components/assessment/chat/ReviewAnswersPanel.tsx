"use client";

import { Drawer } from "@/components/overlay/Drawer";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";

export interface ReviewAnswerEntry {
  label: string;
  confidence?: string;
}

export interface ReviewQuestion {
  question: string;
  section: string;
}

export interface ReviewAnswersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answers: Record<string, ReviewAnswerEntry>;
  getQuestion: (id: string) => ReviewQuestion | undefined;
  onJump: (questionId: string) => void;
}

export function ReviewAnswersPanel({
  open,
  onOpenChange,
  answers,
  getQuestion,
  onJump,
}: ReviewAnswersPanelProps) {
  const entries = Object.entries(answers).filter(([id]) => getQuestion(id));

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size="md"
      title="Review answers"
      description="Select an answer to revisit it in the conversation."
      footer={
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {entries.length === 0 ? (
          <Text tone="secondary">No answers yet.</Text>
        ) : (
          entries.map(([id, answer]) => {
            const question = getQuestion(id);
            if (!question) return null;
            return (
              <div
                key={id}
                className="rounded-md border border-border bg-background px-4 py-3"
              >
                <Text size="caption" tone="tertiary">
                  {question.section}
                </Text>
                <Text weight="semibold" className="mt-1">
                  {question.question}
                </Text>
                <Text tone="secondary" className="mt-1">
                  {answer.label}
                  {answer.confidence ? ` · ${answer.confidence}` : ""}
                </Text>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onJump(id);
                    onOpenChange(false);
                  }}
                >
                  Edit answer
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Drawer>
  );
}
