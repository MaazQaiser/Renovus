import type { Metadata } from "next";
import { SalesIntakeWorkspace } from "@/components/assessment/intake/SalesIntakeWorkspace";

export const metadata: Metadata = {
  title: "Sales baseline from an export",
};

export default function AssessmentIntakePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SalesIntakeWorkspace />
    </div>
  );
}
