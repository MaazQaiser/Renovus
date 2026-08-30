"use client";

import { FileUpload } from "@/components/files/FileUpload";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import type { UploadedFile } from "@/types/file";

export interface PayrollUploadPromptProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function PayrollUploadPrompt({
  files,
  onChange,
  onContinue,
  onSkip,
}: PayrollUploadPromptProps) {
  const ready =
    files.length > 0 &&
    files.every((file) => file.status === "complete" || file.status === "restored");

  return (
    <div className="flex w-full max-w-[40rem] flex-col gap-3">
      <Text size="body-sm" tone="secondary">
        Excel, CSV, or PDF preferred. You can attach more than one file.
      </Text>
      <FileUpload files={files} onChange={onChange} />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button size="lg" fullWidth disabled={!ready} onClick={onContinue}>
          Continue
        </Button>
        <Button size="lg" variant="ghost" fullWidth onClick={onSkip}>
          Continue without a sheet
        </Button>
      </div>
    </div>
  );
}
