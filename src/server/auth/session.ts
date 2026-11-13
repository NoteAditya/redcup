import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@/lib/types";
import { syncClerkToLocalUser } from "./clerk-sync";

export type SessionData = {
  userId?: string;
  role?: Role;
  name?: string;
  isLoggedIn: boolean;
  clerkUserId?: string;
  needsRole?: boolean;
};

const DEV_ONLY_SECRET = "dev-only-session-secret-change-me-32chars!!";

/**
 * In production a real SESSION_SECRET (32+ chars) is mandatory. Falling back to
 * a public default would let anyone forge a login cookie, so fail loudly.
 */
function resolveSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
    throw new Error(
      secret
        ? "SESSION_SECRET must be at least 32 characters."
        : "SESSION_SECRET is not set. Refusing to sign sessions with a default key.",
    );
  }
  return secret && secret.length > 0 ? secret.padEnd(32, "!") : DEV_ONLY_SECRET;
}

export const sessionOptions: SessionOptions = {
  get password() {
    return resolveSessionSecret();
  },
  cookieName: "redcup_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
  },
};

async function getIron() {
  const jar = await cookies();
  return getIronSession<SessionData>(jar, sessionOptions);
}

/**
 * Unified session: Clerk (Google) first, then iron-session password auth.
 */
export async function getSession(): Promise<SessionData & { save?: () => Promise<void>; destroy?: () => void }> {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    try {
      const synced = await syncClerkToLocalUser();
      if (synced.ok) {
        return {
          userId: synced.user.id,
          role: synced.user.role,
          name: synced.user.name,
          isLoggedIn: true,
          clerkUserId: synced.user.clerkId || undefined,
        };
      }
      if (synced.reason === "needs_role") {
        return { isLoggedIn: false, needsRole: true };
      }
    } catch {
      // Fall through to iron-session when Clerk is misconfigured.
    }
  }
  return getIron();
}

export async function requireUser(roles?: Role[]) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) {
    throw new Error("UNAUTHORIZED");
  }
  if (roles && !roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session as SessionData & { userId: string; role: Role; name: string };
}

/** Iron-session handle for password login/signup (writes cookie). */
export async function getIronSessionHandle() {
  return getIron();
}
