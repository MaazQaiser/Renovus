import { createId } from "@/lib/id";
import { readStorage, writeStorage } from "@/lib/storage";

const SHARES_KEY = "renovers:interview-shares";
const SHARES_EVENT = "renovers:interview-shares";

export interface ShareRecipient {
  id: string;
  name: string;
  email: string;
  role?: string;
  invitedAt: string;
}

/** subject id ("sales", "offshoring", …) → the people it has been shared with. */
export type ShareMap = Record<string, ShareRecipient[]>;

const EMPTY_MAP: ShareMap = {};

/** Stable empty array so a subject with no recipients never re-renders. */
export const NO_RECIPIENTS: ShareRecipient[] = [];

let snapshotCache: { raw: string | null; value: ShareMap } = {
  raw: null,
  value: EMPTY_MAP,
};

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SHARES_EVENT));
}

export function subscribeToShares(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SHARES_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SHARES_EVENT, onStoreChange);
  };
}

/**
 * The whole map, cached against the raw string. Callers select their own
 * subject from it — returning a filtered array here would hand
 * useSyncExternalStore a new reference on every read and loop forever.
 */
export function getShareMap(): ShareMap {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(SHARES_KEY);

  if (raw === snapshotCache.raw) return snapshotCache.value;

  const value = readStorage<ShareMap>(SHARES_KEY) ?? EMPTY_MAP;
  snapshotCache = { raw, value };
  return value;
}

export function getServerShareMap(): ShareMap {
  return EMPTY_MAP;
}

function commit(next: ShareMap): void {
  writeStorage(SHARES_KEY, next);
  snapshotCache = { raw: null, value: EMPTY_MAP };
  emitChange();
}

export interface ShareRecipientInput {
  name: string;
  email: string;
  role?: string;
}

export function addShareRecipient(
  subject: string,
  input: ShareRecipientInput,
): ShareRecipient {
  const recipient: ShareRecipient = {
    id: createId("share"),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role?.trim() || undefined,
    invitedAt: new Date().toISOString(),
  };

  const map = getShareMap();
  commit({ ...map, [subject]: [...(map[subject] ?? []), recipient] });
  return recipient;
}

export function removeShareRecipient(subject: string, id: string): void {
  const map = getShareMap();
  const next = (map[subject] ?? []).filter((entry) => entry.id !== id);
  commit({ ...map, [subject]: next });
}

/** True when this email is already on the subject's list. */
export function hasShareRecipient(
  recipients: ShareRecipient[],
  email: string,
): boolean {
  const normalized = email.trim().toLowerCase();
  return recipients.some((entry) => entry.email === normalized);
}
