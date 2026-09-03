const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateTime.format(date);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateOnly.format(date);
}

/**
 * "2 days ago" while that still conveys recency, then the absolute date.
 * Callers must be client-only: the result moves with the clock, so rendering
 * it on the server would guarantee a hydration mismatch.
 */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;

  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  if (seconds < 90) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.round(hours / 24);
  if (days <= 14) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(iso);
}

/** "No assessments" reads better than "0 assessments" on an untouched company. */
export function formatAssessmentCount(count: number): string {
  if (count === 0) return "No assessments";
  return `${count} assessment${count === 1 ? "" : "s"}`;
}
