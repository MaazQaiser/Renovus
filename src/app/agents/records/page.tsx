import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { RecordsScreen } from "@/components/records/RecordsScreen";

export const metadata: Metadata = {
  title: "Records",
};

export default function RecordsPage() {
  return (
    <PageContainer width="default" className="pb-16">
      <RecordsScreen />
    </PageContainer>
  );
}
