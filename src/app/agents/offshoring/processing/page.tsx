import type { Metadata } from "next";
import { OffshoringProcessing } from "@/components/offshoring/OffshoringProcessing";

export const metadata: Metadata = {
  title: "Analysis",
};

export default function OffshoringProcessingPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <OffshoringProcessing />
    </div>
  );
}
