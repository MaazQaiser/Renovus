"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authenticate } from "@/lib/auth";
import { emailFieldError, passwordFieldError } from "@/lib/validation";
import { credentials } from "@/data/users";
import { useSession } from "@/providers/SessionProvider";
import { Alert } from "@/components/feedback/Alert";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { PasswordInput } from "@/components/forms/PasswordInput";
import { Button } from "@/components/primitives/Button";
import { Heading } from "@/components/primitives/Heading";
import { Text } from "@/components/primitives/Text";

const FAILURE_WARNING_AT = 5;
const PREFILLED_ACCOUNT = credentials[0];

type FormAlert =
  | { tone: "error"; title?: string; body: string }
  | { tone: "warning"; title: string; body: string }
  | null;

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState(PREFILLED_ACCOUNT.email);
  const [password, setPassword] = useState(PREFILLED_ACCOUNT.password);
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const [failures, setFailures] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const nextEmail = emailFieldError(email);
    const nextPassword = passwordFieldError(password);
    setEmailError(nextEmail);
    setPasswordError(nextPassword);
    return !nextEmail && !nextPassword;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    if (!validate()) return;

    setSubmitting(true);

    // Brief delay so the loading state is perceptible on a local mock.
    await new Promise((resolve) => window.setTimeout(resolve, 400));

    const result = authenticate(email, password);

    if (!result.ok) {
      const nextFailures =
        result.reason === "invalid-credentials" ? failures + 1 : failures;
      setFailures(nextFailures);

      if (result.reason === "deactivated") {
        setFormAlert({
          tone: "error",
          body: "This account has been deactivated. Contact your Renovus administrator.",
        });
      } else if (nextFailures >= FAILURE_WARNING_AT) {
        setFormAlert({
          tone: "warning",
          title: "Too many unsuccessful attempts",
          body: "Reset your password, or try again. The form is not locked.",
        });
      } else {
        setFormAlert({
          tone: "error",
          body: "The email or password you entered is incorrect.",
        });
      }

      setSubmitting(false);
      return;
    }

    signIn(result.session);
    router.replace("/agents");
  }

  return (
    <div>
      <Text size="overline" tone="secondary">
        Sign in
      </Text>
      <Heading level={1} size="h1" className="mt-2">
        Welcome back
      </Heading>
      <Text tone="secondary" className="mt-2">
        Access Renovus AI agents for portfolio companies.
      </Text>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6" noValidate>
        {formAlert ? (
          <Alert
            tone={formAlert.tone}
            title={formAlert.title}
            action={
              formAlert.tone === "warning" ? (
                <Button variant="link" size="sm" href="/forgot-password">
                  Forgot password
                </Button>
              ) : undefined
            }
          >
            {formAlert.body}
          </Alert>
        ) : null}

        <FormField label="Work email" htmlFor="email" error={emailError} required>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="name@renovuscapital.com"
            size="lg"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError(undefined);
            }}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={passwordError} required>
          <PasswordInput
            id="password"
            name="password"
            size="lg"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError(undefined);
            }}
          />
        </FormField>

        <div className="-mt-3 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-[13px] font-semibold text-accent hover:text-accent-hover"
          >
            Forgot password
          </Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
