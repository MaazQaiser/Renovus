import { readStorage, storageKeys, writeStorage } from "./storage";

const UI_PREFS_EVENT = "renovers:ui-prefs";

export interface UiPrefs {
  recordsView?: "list" | "grid";
  companiesView?: "list" | "grid";
  sidebarCollapsed?: boolean;
}

const EMPTY: UiPrefs = {};

let snapshotCache: { raw: string | null; value: UiPrefs } = {
  raw: null,
  value: EMPTY,
};

export function subscribeToUiPrefs(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(UI_PREFS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(UI_PREFS_EVENT, onStoreChange);
  };
}

/** Cached against the raw string so useSyncExternalStore sees a stable value. */
export function getUiPrefs(): UiPrefs {
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(storageKeys.ui);
  if (raw === snapshotCache.raw) return snapshotCache.value;

  const value = readStorage<UiPrefs>(storageKeys.ui) ?? EMPTY;
  snapshotCache = { raw, value };
  return value;
}

export function getServerUiPrefs(): UiPrefs {
  return EMPTY;
}

export function setUiPref<K extends keyof UiPrefs>(key: K, value: UiPrefs[K]): void {
  writeStorage(storageKeys.ui, { ...getUiPrefs(), [key]: value });
  snapshotCache = { raw: null, value: EMPTY };
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UI_PREFS_EVENT));
  }
}
