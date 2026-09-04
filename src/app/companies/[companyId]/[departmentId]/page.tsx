import type { Metadata } from "next";
import { DepartmentDetail } from "@/components/companies/DepartmentDetail";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "Department",
};

export default async function DepartmentDetailPage({
  params,
}: PageProps<"/companies/[companyId]/[departmentId]">) {
  const { companyId, departmentId } = await params;

  return (
    <PageContainer width="default" className="pb-16">
      <DepartmentDetail companyId={companyId} departmentId={departmentId} />
    </PageContainer>
  );
}
