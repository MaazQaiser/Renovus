"use client";

import { useState } from "react";
import { ArrowRight, Download, MessagesSquare } from "lucide-react";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";
import { FileDropzone } from "@/components/files/FileDropzone";
import { INTAKE_TEMPLATE_FILENAME } from "@/data/sales/intakeTemplate";
import type { IntakeParseFailure } from "@/types/sales-intake";

/** Generated from the same columns the parser matches — see the route. */
const TEMPLATE_URL = "/templates/sales-intake";

export interface IntakeUploadPanelProps {
  /** Hands up the file's name and text; the caller parses it. */
  onFile: (fileName: string, text: string) => void;
  /** Why the last attempt was rejected, if it was. */
  failure?: IntakeParseFailure;
  onFailureDismiss: () => void;
  /** Switches to the conversational assessment instead. */
  onQuestionnaire: () => void;
}

export function IntakeUploadPanel({
  onFile,
  failure,
  onFailureDismiss,
  onQuestionnaire,
}: IntakeUploadPanelProps) {
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | undefined>();

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    onFailureDismiss();
    setReadError(undefined);
    setReading(true);
    try {
      onFile(file.name, await file.text());
    } catch {
      setReadError("That file could not be read. Try exporting it again as CSV.");
    } finally {
      setReading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[40rem] flex-col gap-4">
      <FileDropzone
        accept=".csv,.txt"
        maxFiles={1}
        disabled={reading}
        label="Drop the opportunity export here, or browse"
        activeLabel="Drop to read it"
        hint="One CSV · up to 25 MB"
        onFilesAdded={(files) => void handleFiles(files)}
        className="min-h-32"
      />

      {failure ? (
        <Alert
          tone="warning"
          title={failure.reason}
          onDismiss={onFailureDismiss}
          action={
            <Button
              size="sm"
              variant="secondary"
              leadingIcon={Download}
              externalHref={TEMPLATE_URL}
              download={INTAKE_TEMPLATE_FILENAME}
            >
              Download template
            </Button>
          }
        >
          {failure.detail}
        </Alert>
      ) : null}

      {readError ? <Alert tone="error">{readError}</Alert> : null}

      <Button
        size="lg"
        variant="secondary"
        fullWidth
        leadingIcon={Download}
        externalHref={TEMPLATE_URL}
        download={INTAKE_TEMPLATE_FILENAME}
      >
        Download template
      </Button>

      {/* The second way in. Kept on this screen rather than behind an earlier
          choice: which route makes sense depends on whether an export exists,
          and that is only obvious once you are looking at the drop target. */}
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-glass-hairline" />
        <Text size="overline" tone="tertiary">
          or
        </Text>
        <span className="h-px flex-1 bg-glass-hairline" />
      </div>

      <Button
        size="lg"
        variant="secondary"
        fullWidth
        leadingIcon={MessagesSquare}
        trailingIcon={ArrowRight}
        onClick={onQuestionnaire}
      >
        Start interview
      </Button>
    </div>
  );
}
