const VERSION = 1;

interface StoredValue<T> {
  version: number;
  value: T;
}

export const storageKeys = {
  session: "renovers:session",
  runs: "renovers:runs",
  ui: "renovers:ui",
  run: (id: string) => `renovers:run:${id}`,
  result: (runId: string) => `renovers:results:${runId}`,
  records: "renovers:records",
  companies: "renovers:companies",
  companiesSeedRevision: "renovers:companies-seed-revision",
  demoSeeded: "renovers:demo-seeded",
  record: (id: string) => `renovers:record:${id}`,
} as const;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readStorage<T>(key: string): T | undefined {
  if (!canUseStorage()) return undefined;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredValue<T>;
    if (parsed.version !== VERSION) {
      window.localStorage.removeItem(key);
      return undefined;
    }
    return parsed.value;
  } catch {
    return undefined;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (!canUseStorage()) return;

  try {
    const payload: StoredValue<T> = { version: VERSION, value };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Quota or private-mode failures are ignored; the UI stays in-memory.
  }
}

export function removeStorage(key: string): void {
  if (!canUseStorage()) return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}
