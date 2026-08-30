export type UserRole = "operating-partner" | "portfolio-executive" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  initials: string;
  active: boolean;
}

export interface MockCredential {
  email: string;
  password: string;
  userId: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  roleLabel: string;
  initials: string;
  issuedAt: string;
  expiresAt: string;
}

export type AuthFailureReason =
  | "invalid-credentials"
  | "deactivated";

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; reason: AuthFailureReason };
