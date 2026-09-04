"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/primitives/Spinner";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

export function OffshoringProcessing() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/agents/offshoring/results");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <Spinner
        size="lg"
        tone="accent"
        label="Analyzing offshoring potential"
        className="size-8 border-[2.5px]"
      />
      <Heading level={1} size="h2" className="mt-6">
        Building the assessment
      </Heading>
      <Text tone="secondary" className="mt-2 max-w-[40ch]">
        Scoring functions, applying the deal-team cost assumption, and assembling
        the executive dashboard.
      </Text>
    </div>
  );
}
