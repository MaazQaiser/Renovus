import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import type { QuestionSection } from "@/types/question";

export interface QuestionnaireSectionProps {
  section: QuestionSection;
  children: React.ReactNode;
}

export function QuestionnaireSection({ section, children }: QuestionnaireSectionProps) {
  return (
    <section className="mt-8">
      <Heading level={2} size="h2">
        {section.title}
      </Heading>
      {section.description ? (
        <Text tone="secondary" className="mt-2 max-w-[65ch]">
          {section.description}
        </Text>
      ) : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
