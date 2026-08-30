import { Logo } from "@/components/brand/Logo";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="relative hidden w-[44%] max-w-[560px] shrink-0 flex-col justify-between bg-surface-inverse px-10 py-10 lg:flex xl:px-16">
        <Logo variant="lockup" tone="inverse" size="md" />
        <div>
          <div className="mb-6 h-10 w-1 bg-highlight" aria-hidden />
          <Text size="overline" className="text-accent-border">
            Renovers
          </Text>
          <Heading level={2} size="display" tone="inverse" className="mt-3 max-w-sm">
            AI agents for portfolio companies
          </Heading>
          <Text className="mt-6 max-w-[36ch] text-inverse/72">
            Identify where AI and offshoring can create operating leverage — one structured
            workflow at a time.
          </Text>
        </div>
        <Text size="caption" className="text-inverse/48">
          For Renovus operating partners and portfolio executives.
        </Text>
      </aside>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10 md:px-10">
        <div className="mb-8 lg:hidden">
          <Logo variant="lockup" size="md" />
        </div>
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
    </div>
  );
}
