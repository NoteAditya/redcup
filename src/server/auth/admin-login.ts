"use server";

import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { id, nowIso, readDb, updateDb } from "@/server/db/store";
import { logAdmin } from "@/server/access";
import { getIronSessionHandle } from "./session";
import { adminLoginFor, clearFailures, lockedFor, recordFailure } from "./admin-accounts";

type Result = { ok: false; error: string };

const GENERIC = "Wrong email or password.";

let dummy: Promise<string> | null = null;
function dummyHash() {
  dummy ??= bcrypt.hash("redcup-admin-timing-pad", 10);
  return dummy;
}

function safeEqual(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

async function clientKey() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || h.get("x-real-ip") || "unknown").split(",")[0].trim();
  // Only a hash of the address is stored.
  return "ip:" + createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

/**
 * Dedicated admin sign-in (email + password). Accounts come only from the owner's ADMIN_LOGINS list
 * and the ADMIN_BOOTSTRAP_* account; on first use they are stored as admins with a bcrypt hash.
 * Repeated failures lock the email and client out for a while. Successful logins go to the activity log.
 */
export async function adminSignIn(input: { email: string; password: string }): Promise<Result> {
  const email = (input.email || "").trim().toLowerCase();
  const password = input.password || "";
  if (!email || !password) return { ok: false, error: "Enter your admin email and password." };
  const keys = ["email:" + createHash("sha256").update(email).digest("hex").slice(0, 16), await clientKey()];

  const db = await readDb();
  const lock = lockedFor(db, keys);
  if (lock > 0) {
    return { ok: false, error: `Too many attempts. Try again in ${Math.ceil(lock / 60_000)} minute(s).` };
  }

  const provisioned = adminLoginFor(email);
  const envMatch = Boolean(provisioned && safeEqual(password, provisioned.password));
  let user = db.users.find((u) => u.email === email) ?? null;
  let valid = false;
  let storedOk = false;
  if (user && user.role === "admin" && user.status === "active") {
    storedOk = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    valid = storedOk || envMatch;
  } else {
    // Same work either way so response time doesn't reveal which emails exist.
    await bcrypt.compare(password, await dummyHash());
  }

  // First use of an owner-listed account (or its password changed in ADMIN_LOGINS): store it hashed.
  if (envMatch && (!user || (user.role === "admin" && !storedOk))) {
    const hash = await bcrypt.hash(password, 12);
    user = await updateDb((d) => {
      let u = d.users.find((x) => x.email === email) ?? null;
      if (!u) {
        u = { id: id("usr"), role: "admin", email, phone: null, name: "RedCup Admin", status: "active", passwordHash: hash, createdAt: nowIso() };
        d.users.push(u);
        logAdmin(d, { adminId: "system:admin-logins", action: "admin_account_provisioned", targetType: "user", targetId: u.id, reason: "Added from the owner's admin list" });
      } else if (u.role === "admin") {
        u.passwordHash = hash;
      }
      return u;
    });
    valid = user.role === "admin" && user.status === "active";
  }
  if (user && user.role !== "admin") valid = false;

  if (!valid || !user) {
    await updateDb((d) => {
      if (recordFailure(d, keys)) {
        logAdmin(d, {
          adminId: "system:admin-login",
          action: "admin_login_locked",
          targetType: "user",
          targetId: user?.id ?? "unknown",
          reason: "Too many failed admin sign-in attempts",
        });
      }
    });
    return { ok: false, error: GENERIC };
  }

  await updateDb((d) => {
    clearFailures(d, keys);
    logAdmin(d, { adminId: user.id, action: "admin_login", targetType: "user", targetId: user.id, reason: "Signed in to the admin dashboard" });
  });

  const session = await getIronSessionHandle();
  session.userId = user.id;
  session.role = "admin";
  session.name = user.name;
  session.isLoggedIn = true;
  session.via = "password";
  session.needsRole = undefined;
  session.creatorUseInstagram = undefined;
  await session.save();
  redirect("/admin");
}

/** Form-action wrapper for useActionState (progressive POST, works before hydration). */
export async function adminSignInForm(_prev: Result | null, form: FormData): Promise<Result> {
  return adminSignIn({ email: String(form.get("email") || ""), password: String(form.get("password") || "") });
}
