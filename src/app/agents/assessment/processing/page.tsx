import type { Metadata } from "next";
import { AssessmentProcessing } from "@/components/assessment/AssessmentProcessing";

export const metadata: Metadata = {
  title: "Analysis",
};

export default function AssessmentProcessingPage() {
  return <AssessmentProcessing />;
}
