import { credentials, getUserById } from "@/data/users";
import { normalizeEmail } from "@/lib/validation";
import type { AuthResult, Session } from "@/types/session";

const SESSION_HOURS = 12;

export function createSession(
  userId: string,
  email: string,
  name: string,
  roleLabel: string,
  initials: string,
  now = new Date(),
): Session {
  const issuedAt = now.toISOString();
  const expires = new Date(now.getTime() + SESSION_HOURS * 60 * 60 * 1000);

  return {
    userId,
    email,
    name,
    roleLabel,
    initials,
    issuedAt,
    expiresAt: expires.toISOString(),
  };
}

export function isSessionExpired(session: Session, now = new Date()): boolean {
  return new Date(session.expiresAt).getTime() <= now.getTime();
}

export function authenticate(email: string, password: string): AuthResult {
  const normalized = normalizeEmail(email);
  const match = credentials.find(
    (entry) => entry.email === normalized && entry.password === password,
  );

  if (!match) {
    return { ok: false, reason: "invalid-credentials" };
  }

  const user = getUserById(match.userId);
  if (!user) {
    return { ok: false, reason: "invalid-credentials" };
  }

  if (!user.active) {
    return { ok: false, reason: "deactivated" };
  }

  return {
    ok: true,
    session: createSession(
      user.id,
      user.email,
      user.name,
      user.roleLabel,
      user.initials,
    ),
  };
}
