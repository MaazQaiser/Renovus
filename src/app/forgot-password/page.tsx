import type { Metadata } from "next";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";
import { Button } from "@/components/primitives/Button";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthGuard require="anonymous">
      <AuthLayout>
        <Text size="overline" tone="secondary">
          Account
        </Text>
        <Heading level={1} size="h1" className="mt-2">
          Reset your password
        </Heading>
        <Text tone="secondary" className="mt-2">
          This screen will be completed next. Return to sign in to continue the prototype.
        </Text>
        <div className="mt-8">
          <Button href="/login" variant="secondary">
            Back to sign in
          </Button>
        </div>
        <p className="sr-only">
          <Link href="/login">Back to sign in</Link>
        </p>
      </AuthLayout>
    </AuthGuard>
  );
}
