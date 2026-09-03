"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Link2, Trash2, UserPlus } from "lucide-react";
import { Modal } from "@/components/overlay/Modal";
import { Button } from "@/components/primitives/Button";
import { IconButton } from "@/components/primitives/IconButton";
import { Text } from "@/components/primitives/Text";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { isValidEmail } from "@/lib/validation";
import {
  addShareRecipient,
  getServerShareMap,
  getShareMap,
  hasShareRecipient,
  NO_RECIPIENTS,
  removeShareRecipient,
  subscribeToShares,
} from "@/lib/interview/share";

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which assessment is being shared — "sales", "offshoring", … */
  subject: string;
  /** Path the recipient should land on, e.g. "/agents/assessment". */
  path: string;
  /** Named in the dialog copy so it is obvious what is being handed over. */
  label: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  subject,
  path,
  label,
}: ShareDialogProps) {
  const map = useSyncExternalStore(subscribeToShares, getShareMap, getServerShareMap);
  const recipients = map[subject] ?? NO_RECIPIENTS;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | undefined>();
  // Kept apart from the form error: a clipboard failure is not an email problem
  // and must not render under the email field.
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  // origin is only known in the browser; the modal never renders server-side.
  const url = useMemo(
    () => (typeof window === "undefined" ? path : `${window.location.origin}${path}`),
    [path],
  );

  function handleAdd() {
    if (!name.trim()) return setError("Enter a name.");
    if (!isValidEmail(email)) return setError("Enter a valid email address.");
    if (hasShareRecipient(recipients, email)) return setError("Already on the list.");

    addShareRecipient(subject, { name, email, role });
    setName("");
    setEmail("");
    setRole("");
    setError(undefined);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      // Blocked outside a secure context. Say so rather than claiming a copy
      // that did not happen, and leave the field selectable by hand.
      setCopyState("failed");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Share this assessment"
      description={`Give someone else access to the ${label} so they can answer their part.`}
      size="md"
      footer={
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <section>
          <div className="flex flex-col gap-3 sm:flex-row">
            <FormField label="Name" className="flex-1">
              <Input
                value={name}
                placeholder="Dana Whitfield"
                onChange={(event) => setName(event.target.value)}
              />
            </FormField>
            <FormField label="Role" optionalLabel className="flex-1">
              <Input
                value={role}
                placeholder="Marketing owner"
                onChange={(event) => setRole(event.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Email" className="mt-3" error={error}>
            <Input
              type="email"
              value={email}
              placeholder="dana@company.com"
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAdd();
                }
              }}
            />
          </FormField>

          <Button
            variant="secondary"
            leadingIcon={UserPlus}
            className="mt-3"
            onClick={handleAdd}
          >
            Add person
          </Button>
        </section>

        {recipients.length > 0 ? (
          <section>
            <Text size="overline" tone="tertiary" as="div">
              Shared with
            </Text>
            <ul className="mt-2 overflow-hidden rounded-lg border border-glass-border bg-glass-quiet backdrop-blur-xl">
              {recipients.map((recipient) => (
                <li
                  key={recipient.id}
                  className="flex items-center gap-3 border-b border-glass-hairline px-4 py-2.5 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <Text size="body-sm" weight="semibold" className="truncate">
                      {recipient.name}
                      {recipient.role ? (
                        <span className="font-normal text-tertiary">
                          {" "}
                          · {recipient.role}
                        </span>
                      ) : null}
                    </Text>
                    <Text size="caption" tone="tertiary" className="truncate">
                      {recipient.email}
                    </Text>
                  </div>
                  <IconButton
                    icon={Trash2}
                    label={`Remove ${recipient.name}`}
                    size="sm"
                    variant="ghost"
                    onClick={() => removeShareRecipient(subject, recipient.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <Text size="overline" tone="tertiary" as="div">
            Or send a link
          </Text>
          <div className="mt-2 flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                readOnly
                value={url}
                leadingIcon={Link2}
                aria-label="Shareable link"
                onFocus={(event) => event.currentTarget.select()}
              />
            </div>
            <Button
              variant="secondary"
              leadingIcon={copyState === "copied" ? Check : Copy}
              onClick={handleCopy}
            >
              {copyState === "copied" ? "Copied" : "Copy"}
            </Button>
          </div>
          <Text
            size="caption"
            tone={copyState === "failed" ? "error" : "tertiary"}
            className="mt-2"
          >
            {copyState === "failed"
              ? "Couldn't reach the clipboard. Select the link above and copy it manually."
              : "People added here are recorded on this device. Send them the link so they can pick the assessment up."}
          </Text>
        </section>
      </div>
    </Modal>
  );
}
