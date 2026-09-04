import { Button } from "@/components/primitives/Button";
import { ButtonGroup } from "@/components/primitives/ButtonGroup";

export interface QuestionNavigationProps {
  onBack: () => void;
  onContinue: () => void;
  backLabel?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
}

export function QuestionNavigation({
  onBack,
  onContinue,
  backLabel = "Back",
  continueLabel = "Continue",
  continueDisabled,
}: QuestionNavigationProps) {
  return (
    <div className="sticky bottom-0 -mx-8 mt-10 border-t border-border bg-background px-8 py-4 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
      <ButtonGroup align="start" stackOn="sm" reverseOnStack>
        <Button variant="ghost" onClick={onBack}>
          {backLabel}
        </Button>
        <Button size="lg" disabled={continueDisabled} onClick={onContinue}>
          {continueLabel}
        </Button>
      </ButtonGroup>
    </div>
  );
}
