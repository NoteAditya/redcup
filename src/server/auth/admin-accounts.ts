import type { Db, LoginThrottle } from "@/server/db/store";

/** Admin sign-in lockout: this many failures within the window locks the email (and client) out. */
export const ADMIN_MAX_FAILURES = 5;
export const ADMIN_FAILURE_WINDOW_MS = 15 * 60_000;
export const ADMIN_LOCKOUT_MS = 15 * 60_000;

export type AdminLogin = { email: string; password: string };

/**
 * Owner-provided admin accounts from ADMIN_LOGINS: JSON `[{"email":"...","password":"..."}]`.
 * Invalid JSON or entries are ignored (and never echoed, since they hold passwords).
 */
export function parseAdminLogins(raw: string | undefined | null): AdminLogin[] {
  if (!raw || !raw.trim()) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error("[admin-login] ADMIN_LOGINS is not valid JSON; ignoring it.");
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: AdminLogin[] = [];
  for (const row of data) {
    const email = typeof row?.email === "string" ? row.email.trim().toLowerCase() : "";
    const password = typeof row?.password === "string" ? row.password : "";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length > 0 && !out.some((x) => x.email === email)) {
      out.push({ email, password });
    }
  }
  return out;
}

export function adminLoginFor(email: string, env = process.env): AdminLogin | null {
  const e = email.trim().toLowerCase();
  const list = parseAdminLogins(env.ADMIN_LOGINS);
  const boot = (env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  if (boot && env.ADMIN_BOOTSTRAP_PASSWORD && !list.some((x) => x.email === boot)) {
    list.push({ email: boot, password: env.ADMIN_BOOTSTRAP_PASSWORD });
  }
  return list.find((x) => x.email === e) ?? null;
}

function entry(db: Db, key: string): LoginThrottle | undefined {
  return db.loginThrottle.find((t) => t.key === key);
}

/** Milliseconds left on a lockout for any of these keys, or 0. */
export function lockedFor(db: Db, keys: string[], now = Date.now()): number {
  let left = 0;
  for (const k of keys) {
    const t = entry(db, k);
    if (t?.lockedUntil) left = Math.max(left, Date.parse(t.lockedUntil) - now);
  }
  return Math.max(0, left);
}

/** Record a failure; returns true when this failure triggered a lockout. */
export function recordFailure(db: Db, keys: string[], now = Date.now()): boolean {
  let locked = false;
  const at = new Date(now).toISOString();
  for (const k of keys) {
    let t = entry(db, k);
    if (!t || now - Date.parse(t.firstFailureAt) > ADMIN_FAILURE_WINDOW_MS || (t.lockedUntil && Date.parse(t.lockedUntil) <= now)) {
      db.loginThrottle = db.loginThrottle.filter((x) => x.key !== k);
      t = { key: k, failures: 0, firstFailureAt: at, lockedUntil: null };
      db.loginThrottle.push(t);
    }
    t.failures += 1;
    if (t.failures >= ADMIN_MAX_FAILURES && !t.lockedUntil) {
      t.lockedUntil = new Date(now + ADMIN_LOCKOUT_MS).toISOString();
      locked = true;
    }
  }
  // Drop stale rows so the list stays small.
  db.loginThrottle = db.loginThrottle.filter(
    (t) => now - Date.parse(t.firstFailureAt) < ADMIN_FAILURE_WINDOW_MS + ADMIN_LOCKOUT_MS,
  );
  return locked;
}

export function clearFailures(db: Db, keys: string[]) {
  db.loginThrottle = db.loginThrottle.filter((t) => !keys.includes(t.key));
}
