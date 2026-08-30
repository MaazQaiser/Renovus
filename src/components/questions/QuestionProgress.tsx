import { Text } from "@/components/primitives/Text";

export interface QuestionProgressProps {
  current: number;
  total: number;
  sectionLabel?: string;
}

export function QuestionProgress({ current, total, sectionLabel }: QuestionProgressProps) {
  return (
    <div className="flex flex-col gap-1">
      {sectionLabel ? (
        <Text size="overline" tone="secondary">
          {sectionLabel}
        </Text>
      ) : null}
      <Text size="caption" tone="tertiary">
        Question {current} of {total}
      </Text>
    </div>
  );
}
