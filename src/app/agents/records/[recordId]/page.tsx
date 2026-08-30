import type { Metadata } from "next";
import { RecordReport } from "@/components/records/RecordReport";

export const metadata: Metadata = {
  title: "Saved report",
};

export default async function RecordDetailPage({
  params,
}: PageProps<"/agents/records/[recordId]">) {
  const { recordId } = await params;
  return <RecordReport recordId={recordId} />;
}
