import type { AssessmentRecord } from "@/types/record";
import { readStorage, removeStorage, storageKeys, writeStorage } from "./storage";

const RECORDS_EVENT = "renovers:records";

// Mirrors lib/runs.ts: an id index plus one entry per record, so a single
// record can be read without deserialising the whole archive.
let snapshotCache: { raw: string | null; value: AssessmentRecord[] } = {
  raw: null,
  value: [],
};

function emitRecordsChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RECORDS_EVENT));
}

export function subscribeToRecords(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(RECORDS_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(RECORDS_EVENT, onStoreChange);
  };
}

/** Newest first. Cached against the raw index so useSyncExternalStore is stable. */
export function listRecords(): AssessmentRecord[] {
  const raw =
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(storageKeys.records);

  if (raw === snapshotCache.raw) {
    return snapshotCache.value;
  }

  const ids = readStorage<string[]>(storageKeys.records) ?? [];
  const records = ids
    .map((id) => readStorage<AssessmentRecord>(storageKeys.record(id)))
    .filter((record): record is AssessmentRecord => Boolean(record))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  snapshotCache = { raw, value: records };
  return records;
}

export function getServerRecords(): AssessmentRecord[] {
  return [];
}

export function getRecord(id: string): AssessmentRecord | undefined {
  return readStorage<AssessmentRecord>(storageKeys.record(id));
}

export function saveRecord(record: AssessmentRecord): void {
  const ids = readStorage<string[]>(storageKeys.records) ?? [];
  writeStorage(storageKeys.record(record.id), record);
  writeStorage(storageKeys.records, [
    ...ids.filter((id) => id !== record.id),
    record.id,
  ]);
  snapshotCache = { raw: null, value: [] };
  emitRecordsChange();
}

export function deleteRecord(id: string): void {
  const ids = (readStorage<string[]>(storageKeys.records) ?? []).filter(
    (entry) => entry !== id,
  );
  writeStorage(storageKeys.records, ids);
  removeStorage(storageKeys.record(id));
  snapshotCache = { raw: null, value: [] };
  emitRecordsChange();
}

/** Part F's benchmark needs at least three assessed companies. */
export function assessedCompanyCount(): number {
  return new Set(listRecords().map((record) => record.companyName)).size;
}
