import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <AuthGuard require="anonymous">
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </AuthGuard>
  );
}
