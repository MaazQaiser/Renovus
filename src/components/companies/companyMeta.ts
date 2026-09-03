import type { AppHref } from "@/lib/routes";

/** Mirrors recordMeta.recordHref: dynamic segments need the cast. */
export function companyHref(id: string): AppHref {
  return `/companies/${id}` as AppHref;
}
