import type { Metadata } from "next";
import { SalesReport } from "@/components/sales/SalesReport";

export const metadata: Metadata = {
  title: "Results",
};

export default function AssessmentResultsPage() {
  // Full-bleed: the report is a document surface with its own rules.
  return <SalesReport />;
}
