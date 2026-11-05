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

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-session-secret-change-me-32chars!!",
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
