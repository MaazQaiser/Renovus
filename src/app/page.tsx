"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/providers/SessionProvider";
import { Spinner } from "@/components/primitives/Spinner";

export default function RootPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace("/agents");
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  return (
    <div className="flex min-h-full items-center justify-center bg-background">
      <Spinner size="lg" label="Loading" tone="accent" />
    </div>
  );
}
