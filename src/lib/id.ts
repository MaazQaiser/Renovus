/**
 * Collision-resistant client id. Timestamp-prefixed so ids sort roughly by
 * creation order, with a random tail so two calls in the same millisecond
 * still differ.
 */
export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
