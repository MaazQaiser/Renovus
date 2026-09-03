import { AuthenticatedShell } from "@/components/layout/AuthenticatedShell";

export default function HomeLayout({ children }: LayoutProps<"/home">) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
