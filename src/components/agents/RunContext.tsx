import { Text } from "@/components/primitives/Text";

export interface RunContextProps {
  eyebrow?: string;
  title: string;
  meta?: string;
}

export function RunContext({ eyebrow = "Assessing", title, meta }: RunContextProps) {
  return (
    <div className="mt-6 rounded-lg border border-border bg-surface px-5 py-4">
      <Text size="overline" tone="secondary">
        {eyebrow}
      </Text>
      <Text weight="semibold" className="mt-2">
        {title}
      </Text>
      {meta ? (
        <Text tone="secondary" className="mt-1">
          {meta}
        </Text>
      ) : null}
    </div>
  );
}
