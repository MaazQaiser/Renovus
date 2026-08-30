import type { Metadata } from "next";
import { AssessmentWorkspace } from "@/components/assessment/AssessmentWorkspace";

export const metadata: Metadata = {
  title: "Assessment Agent",
};

export default function AssessmentAgentPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AssessmentWorkspace />
    </div>
  );
}
