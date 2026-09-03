"use client";

import { agents } from "@/data/agents";
import { AgentGrid } from "@/components/agents/AgentGrid";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

export function AgentHub() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col justify-center overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--border-subtle) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative">
        <header>
          <Heading
            level={1}
            size="display"
            className="text-[36px] leading-[42px] font-normal tracking-[-0.02em] md:text-[44px] md:leading-[50px]"
          >
            How we create
            <br />
            operating leverage
          </Heading>
          <Text tone="secondary" className="mt-3 max-w-[48ch] text-[15px] leading-6">
            Structured assessments for Renovus PortCos. Baseline the function,
            find leverage, prioritize action.
          </Text>
        </header>

        <div className="mt-12">
          <AgentGrid agents={agents} />
        </div>
      </div>
    </div>
  );
}
