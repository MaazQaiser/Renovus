"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/Button";
import { Text } from "@/components/primitives/Text";

export interface RespondentPromptProps {
  onSubmit: (name: string, role: string) => void;
}

const ROLE_SUGGESTIONS = ["CEO / Founder", "Sales lead", "Marketing owner", "Operations"];

/**
 * Asked at each session boundary. The spec runs its sessions with different
 * people, so answers are attributed to whoever is in the room for that part.
 */
export function RespondentPrompt({ onSubmit }: RespondentPromptProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const ready = name.trim().length > 0 && role.trim().length > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="respondent-name">
          <Text size="caption" tone="secondary">
            Name
          </Text>
        </label>
        <input
          id="respondent-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Dana Whitfield"
          className="h-11 rounded-md border border-border bg-surface px-3 text-[15px] text-foreground placeholder:text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="respondent-role">
          <Text size="caption" tone="secondary">
            Role
          </Text>
        </label>
        <input
          id="respondent-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && ready) onSubmit(name.trim(), role.trim());
          }}
          placeholder="e.g. CEO"
          className="h-11 rounded-md border border-border bg-surface px-3 text-[15px] text-foreground placeholder:text-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <div className="flex flex-wrap gap-1.5">
          {ROLE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setRole(suggestion)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-secondary transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="md" disabled={!ready} onClick={() => onSubmit(name.trim(), role.trim())}>
          Start
        </Button>
      </div>
    </div>
  );
}
