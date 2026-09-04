import type { Metadata } from "next";
import { CompanyDetail } from "@/components/companies/CompanyDetail";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "PortCo",
};

export default async function CompanyDetailPage({
  params,
}: PageProps<"/companies/[companyId]">) {
  const { companyId } = await params;

  return (
    <PageContainer width="default" className="pb-16">
      <CompanyDetail companyId={companyId} />
    </PageContainer>
  );
}
