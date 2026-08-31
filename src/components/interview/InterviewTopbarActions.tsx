"use client";

import { ListChecks, RotateCcw } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";

export interface InterviewTopbarActionsProps {
  canReview: boolean;
  onReview: () => void;
  onRestart: () => void;
}

/**
 * Topbar actions shared by the interview agents. Labels collapse to icons below
 * `sm` so the single-line topbar still has room for the page title.
 */
export function InterviewTopbarActions({
  canReview,
  onReview,
  onRestart,
}: InterviewTopbarActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {canReview ? (
        <>
          <IconButton
            icon={ListChecks}
            label="Review answers"
            variant="ghost"
            className="sm:hidden"
            onClick={onReview}
          />
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={onReview}
          >
            Review answers
          </Button>
        </>
      ) : null}

      <IconButton
        icon={RotateCcw}
        label="Start over"
        variant="gold"
        className="sm:hidden"
        onClick={onRestart}
      />
      <Button
        variant="gold"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={onRestart}
      >
        Start over
      </Button>
    </div>
  );
}
