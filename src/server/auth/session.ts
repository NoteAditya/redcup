import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@/lib/types";

export type SessionData = {
  userId?: string;
  role?: Role;
  name?: string;
  isLoggedIn: boolean;
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

export async function getSession() {
  const jar = await cookies();
  return getIronSession<SessionData>(jar, sessionOptions);
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
