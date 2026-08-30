import type { OffshoringSession } from "@/types/offshoring";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import {
  COMPANY_PROMPT,
  INTRO_COPY,
  createInitialOffshoringSession,
  createMessage,
} from "./engine";

const SESSION_KEY = "renovers:offshoring";
const SESSION_EVENT = "renovers:offshoring";

let snapshotCache: { raw: string | null; value: OffshoringSession | null } = {
  raw: null,
  value: null,
};

let clientSession: OffshoringSession | null = null;

const SERVER_PLACEHOLDER: OffshoringSession = {
  id: "server-placeholder",
  phase: "company",
  messages: [
    createMessage("agent", "intro", INTRO_COPY),
    createMessage("agent", "company-prompt", COMPANY_PROMPT),
  ],
  files: [],
  skippedPayroll: false,
  detectedFunctions: [],
  answers: {},
  queue: [],
  status: "in-progress",
  startedAt: "1970-01-01T00:00:00.000Z",
  updatedAt: "1970-01-01T00:00:00.000Z",
};

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function subscribeToOffshoringSession(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(SESSION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(SESSION_EVENT, onStoreChange);
  };
}

function readStoredSession(): OffshoringSession | null {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(SESSION_KEY);

  if (raw === snapshotCache.raw) {
    return snapshotCache.value;
  }

  const value = readStorage<OffshoringSession>(SESSION_KEY) ?? null;
  snapshotCache = { raw, value };
  return value;
}

export function getServerOffshoringSession(): OffshoringSession {
  return SERVER_PLACEHOLDER;
}

export function getOrInitOffshoringSession(): OffshoringSession {
  if (typeof window === "undefined") return SERVER_PLACEHOLDER;

  if (clientSession) return clientSession;

  const stored = readStoredSession();
  if (stored) {
    const validPhases = new Set([
      "company",
      "payroll",
      "round1",
      "round2",
      "round3",
      "value-creation",
      "complete",
    ]);
    if (!validPhases.has(stored.phase)) {
      clientSession = createInitialOffshoringSession();
      return clientSession;
    }
    clientSession = {
      ...stored,
      detectedFunctions: stored.detectedFunctions ?? [],
      files: (stored.files ?? []).map((file) => ({
        ...file,
        status: file.status === "error" ? file.status : ("restored" as const),
        progress: file.status === "error" ? file.progress : 100,
      })),
    };
    return clientSession;
  }

  clientSession = createInitialOffshoringSession();
  return clientSession;
}

export function saveOffshoringSession(session: OffshoringSession): void {
  clientSession = session;
  writeStorage(SESSION_KEY, session);
  snapshotCache = { raw: null, value: null };
  emitChange();
}

export function clearOffshoringSession(): void {
  clientSession = null;
  removeStorage(SESSION_KEY);
  snapshotCache = { raw: null, value: null };
  emitChange();
}

export function startFreshOffshoringSession(): OffshoringSession {
  const session = createInitialOffshoringSession();
  saveOffshoringSession(session);
  return session;
}
