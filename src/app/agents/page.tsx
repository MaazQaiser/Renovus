import type { Metadata } from "next";
import { AgentHub } from "@/components/agents/AgentHub";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "AI Agents",
};

export default function AgentHubPage() {
  return (
    <PageContainer width="default" className="flex flex-1 flex-col">
      <AgentHub />
    </PageContainer>
  );
}
