"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { isSessionExpired } from "@/lib/auth";
import { readStorage, removeStorage, storageKeys, writeStorage } from "@/lib/storage";
import type { Session } from "@/types/session";

type SessionStatus = "loading" | "anonymous" | "authenticated";

interface SessionContextValue {
  session: Session | null;
  status: SessionStatus;
  signIn: (session: Session) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

let snapshotCache: { raw: string | null; value: Session | null } = {
  raw: null,
  value: null,
};

function readSession(): Session | null {
  const raw =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(storageKeys.session);

  if (raw === snapshotCache.raw) {
    return snapshotCache.value;
  }

  const stored = readStorage<Session>(storageKeys.session);
  if (!stored) {
    snapshotCache = { raw, value: null };
    return null;
  }
  if (isSessionExpired(stored)) {
    removeStorage(storageKeys.session);
    snapshotCache = { raw: null, value: null };
    return null;
  }

  snapshotCache = { raw, value: stored };
  return stored;
}

function subscribeToStorage(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("renovers:session", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("renovers:session", onStoreChange);
  };
}

function emitSessionChange() {
  window.dispatchEvent(new Event("renovers:session"));
}

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function getServerSessionSnapshot() {
  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot,
  );
  const session = useSyncExternalStore(
    subscribeToStorage,
    readSession,
    getServerSessionSnapshot,
  );

  const signIn = useCallback((next: Session) => {
    writeStorage(storageKeys.session, next);
    snapshotCache = { raw: null, value: null };
    emitSessionChange();
  }, []);

  const signOut = useCallback(() => {
    removeStorage(storageKeys.session);
    snapshotCache = { raw: null, value: null };
    emitSessionChange();
  }, []);

  const status: SessionStatus = !hydrated
    ? "loading"
    : session
      ? "authenticated"
      : "anonymous";

  const value = useMemo(
    () => ({ session, status, signIn, signOut }),
    [session, status, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
