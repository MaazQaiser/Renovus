import { Text } from "@/components/primitives/Text";
import { cn } from "@/lib/cn";

export function TypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("w-full max-w-[40rem] py-2", className)} aria-live="polite">
      <Text size="body-sm" tone="secondary">
        Thinking…
      </Text>
    </div>
  );
}
