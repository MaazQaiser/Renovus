import type { AppHref } from "@/lib/routes";

/** Mirrors recordMeta.recordHref: dynamic segments need the cast. */
export function companyHref(id: string): AppHref {
  return `/companies/${id}` as AppHref;
}

/** A department inside a PortCo — where that department's assessments live. */
export function departmentHref(companyId: string, departmentId: string): AppHref {
  return `/companies/${companyId}/${departmentId}` as AppHref;
}
