import type { Metadata } from "next";
import { OffshoringWorkspace } from "@/components/offshoring/OffshoringWorkspace";

export const metadata: Metadata = {
  title: "Offshoring Agent",
};

export default function OffshoringAgentPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OffshoringWorkspace />
    </div>
  );
}
