import { Text } from "@/components/primitives/Text";

export interface QuestionErrorProps {
  message: string;
  id?: string;
}

export function QuestionError({ message, id }: QuestionErrorProps) {
  return (
    <Text id={id} size="body-sm" tone="error" role="alert" className="mt-3">
      {message}
    </Text>
  );
}
