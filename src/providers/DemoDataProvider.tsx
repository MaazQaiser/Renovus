"use client";

import { useEffect } from "react";
import { seedDemoRecordsOnce } from "@/lib/demo/seed";

/**
 * Seeds the demo portfolio on a browser that has never seen it.
 *
 * In an effect rather than during render: seeding writes to localStorage and
 * fires the records change event, which must not happen while React is
 * rendering. Runs once per browser — see `seedDemoRecordsOnce` for why a
 * cleared demo stays cleared.
 */
export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedDemoRecordsOnce();
  }, []);

  return <>{children}</>;
}
