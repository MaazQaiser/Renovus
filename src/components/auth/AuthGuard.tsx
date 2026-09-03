"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";
import { Spinner } from "@/components/primitives/Spinner";
import type { AppHref } from "@/lib/routes";

export interface AuthGuardProps {
  children: React.ReactNode;
  require?: "authenticated" | "anonymous";
  redirectTo?: AppHref;
}

export function AuthGuard({
  children,
  require = "authenticated",
  redirectTo,
}: AuthGuardProps) {
  const { status } = useSession();
  const router = useRouter();
  const destination =
    redirectTo ?? (require === "authenticated" ? "/login" : "/companies");

  useEffect(() => {
    if (status === "loading") return;
    if (require === "authenticated" && status === "anonymous") {
      router.replace(destination);
    }
    if (require === "anonymous" && status === "authenticated") {
      router.replace(destination);
    }
  }, [status, require, destination, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner size="lg" label="Loading session" tone="accent" />
      </div>
    );
  }

  if (require === "authenticated" && status !== "authenticated") {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner size="lg" label="Redirecting to sign in" tone="accent" />
      </div>
    );
  }

  if (require === "anonymous" && status !== "anonymous") {
    return (
      <div className="flex min-h-full items-center justify-center">
        <Spinner size="lg" label="Redirecting" tone="accent" />
      </div>
    );
  }

  return <>{children}</>;
}
