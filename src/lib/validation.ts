const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(normalizeEmail(value));
}

export function emailFieldError(value: string): string | undefined {
  if (value.trim() === "") {
    return "Enter your work email address.";
  }
  if (!isValidEmail(value)) {
    return "Enter a valid email address.";
  }
  return undefined;
}

export function passwordFieldError(value: string): string | undefined {
  if (value === "") {
    return "Enter your password.";
  }
  return undefined;
}
