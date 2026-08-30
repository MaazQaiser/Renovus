import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";

export default function AgentsLayout({ children }: LayoutProps<"/agents">) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
