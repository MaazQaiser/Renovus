import type { Metadata } from "next";
import { OffshoringReport } from "@/components/offshoring/OffshoringReport";

export const metadata: Metadata = {
  title: "Results",
};

export default function OffshoringResultsPage() {
  // Full-bleed: the report is a document surface with its own rules and
  // padding, not another padded app panel.
  return <OffshoringReport />;
}
