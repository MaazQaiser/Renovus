import type { Metadata } from "next";
import { CompaniesScreen } from "@/components/companies/CompaniesScreen";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "PortCos",
};

export default function CompaniesPage() {
  return (
    <PageContainer width="default" className="pb-16">
      <CompaniesScreen />
    </PageContainer>
  );
}
