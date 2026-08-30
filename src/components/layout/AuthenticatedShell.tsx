"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppShell } from "./AppShell";

export function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard require="authenticated">
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
