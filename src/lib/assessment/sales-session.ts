import type { SalesAssessmentSession } from "@/types/sales-assessment";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import { createInitialSession } from "./sales-engine";

const SESSION_KEY = "renovers:sales-assessment";
const SESSION_EVENT = "renovers:sales-assessment";
const CURRENT_QBANK = "v4";

let snapshotCache: { raw: string | null; value: SalesAssessmentSession | null } = {
  raw: null,
  value: null,
};

/** Stable client session reference for useSyncExternalStore. */
let clientSession: SalesAssessmentSession | null = null;

const SERVER_PLACEHOLDER: SalesAssessmentSession = {
  ...createInitialSession(),
  id: "server-placeholder",
  startedAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeToSalesSession(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
}

/**
 * Legacy conversational drafts (pre-gate / pre-v4) lack required fields.
 * Drop them rather than crash the rail.
 */
function isCurrentSalesSession(
  value: Partial<SalesAssessmentSession> | null | undefined,
): value is SalesAssessmentSession {
  if (!value || typeof value !== "object") return false;
  if (!value.gate || typeof value.gate.status !== "string") return false;
  if (!Array.isArray(value.gate.corrections)) return false;
  if (!value.activeSession) return false;
  if (!value.answers || typeof value.answers !== "object") return false;
  if (!Array.isArray(value.messages)) return false;
  if (!Array.isArray(value.queue)) return false;
  if (value.qbankVersion !== CURRENT_QBANK) return false;
  return true;
}

function readStoredSession(): SalesAssessmentSession | null {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_KEY);

  if (raw === snapshotCache.raw) {
    return snapshotCache.value;
  }

  const value = readStorage<SalesAssessmentSession>(SESSION_KEY) ?? null;
  if (value && !isCurrentSalesSession(value)) {
    removeStorage(SESSION_KEY);
    snapshotCache = { raw: null, value: null };
    return null;
  }

  snapshotCache = { raw, value: value && isCurrentSalesSession(value) ? value : null };
  return snapshotCache.value;
}

export function getSalesSession(): SalesAssessmentSession | null {
  return readStoredSession();
}

export function getServerSalesSession(): SalesAssessmentSession {
  return SERVER_PLACEHOLDER;
}

/**
 * Client snapshot for useSyncExternalStore.
 * Never writes during getSnapshot — only returns a stable reference.
 */
export function getOrInitSalesSession(): SalesAssessmentSession {
  if (typeof window === "undefined") return SERVER_PLACEHOLDER;

  const stored = readStoredSession();
  if (stored) {
    clientSession = stored;
    return stored;
  }

  if (!clientSession || !isCurrentSalesSession(clientSession)) {
    clientSession = createInitialSession();
  }
  return clientSession;
}

export function saveSalesSession(session: SalesAssessmentSession): void {
  clientSession = session;
  writeStorage(SESSION_KEY, session);
  snapshotCache = { raw: null, value: null };
  emitChange();
}

export function clearSalesSession(): void {
  clientSession = null;
  removeStorage(SESSION_KEY);
  snapshotCache = { raw: null, value: null };
  emitChange();
}

export function startFreshSalesSession(): SalesAssessmentSession {
  const session = createInitialSession();
  saveSalesSession(session);
  return session;
}
