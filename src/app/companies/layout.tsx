import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";

export default function CompaniesLayout({ children }: LayoutProps<"/companies">) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
