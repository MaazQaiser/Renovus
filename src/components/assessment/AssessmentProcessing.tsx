"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/primitives/Spinner";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

export function AssessmentProcessing() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace("/agents/assessment/results");
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <Spinner
        size="lg"
        tone="accent"
        label="Building the baseline report"
        className="size-8 border-[2.5px]"
      />
      <Heading level={1} size="h2" className="mt-6">
        Building the baseline
      </Heading>
      <Text tone="secondary" className="mt-2 max-w-[42ch]">
        Counting confidence tags, assembling the channel and people maps, and
        matching the AI candidate menu against what you told us.
      </Text>
    </div>
  );
}
