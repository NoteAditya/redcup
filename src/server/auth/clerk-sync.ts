import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { Role } from "@/lib/types";
import { id, nowIso, readDb, updateDb, type User } from "@/server/db/store";

const ROLE_COOKIE = "redcup_pending_role";

function normalizeEmail(email: string | null | undefined) {
  return (email || "").trim().toLowerCase() || null;
}

function displayNameFromClerk(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
}): string {
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (full) return full;
  if (user.username) return user.username;
  const email =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress ||
    "";
  return email.split("@")[0] || "RedCup user";
}

async function readPendingRole(): Promise<"brand" | "creator" | null> {
  const jar = await cookies();
  const raw = jar.get(ROLE_COOKIE)?.value;
  if (raw === "brand" || raw === "creator") return raw;
  return null;
}

export async function clearPendingRoleCookie() {
  try {
    const jar = await cookies();
    jar.delete(ROLE_COOKIE);
  } catch {
    // Cookie writes only in Server Actions / Route Handlers.
  }
}

/**
 * Map a signed-in Clerk user onto a Neon RedCup user.
 * Uses auth() (local JWT) first so pages stay fast when nobody is on Clerk.
 */
export async function syncClerkToLocalUser(): Promise<
  | { ok: true; user: User }
  | { ok: false; reason: "no_clerk" | "needs_role" }
> {
  let userId: string | null = null;
  try {
    const a = await auth();
    userId = a.userId;
  } catch {
    return { ok: false, reason: "no_clerk" };
  }
  if (!userId) return { ok: false, reason: "no_clerk" };

  let clerk;
  try {
    clerk = await currentUser();
  } catch {
    return { ok: false, reason: "no_clerk" };
  }
  if (!clerk) return { ok: false, reason: "no_clerk" };

  const clerkId = clerk.id;
  const email = normalizeEmail(
    clerk.primaryEmailAddress?.emailAddress || clerk.emailAddresses[0]?.emailAddress,
  );
  const name = displayNameFromClerk(clerk);
  const pendingRole = await readPendingRole();

  const existing = await readDb();
  const byClerk = existing.users.find((u) => u.clerkId === clerkId);
  if (byClerk) {
    if (pendingRole) await clearPendingRoleCookie();
    return { ok: true, user: byClerk };
  }

  if (email) {
    const byEmail = existing.users.find((u) => u.email && u.email === email);
    if (byEmail) {
      const linked = await updateDb((db) => {
        const u = db.users.find((x) => x.id === byEmail.id);
        if (!u) return byEmail;
        u.clerkId = clerkId;
        if (!u.name && name) u.name = name;
        return u;
      });
      if (pendingRole) await clearPendingRoleCookie();
      return { ok: true, user: linked };
    }
  }

  if (!pendingRole) {
    return { ok: false, reason: "needs_role" };
  }

  const role: Role = pendingRole;
  const newUserId = id("usr");
  const created = await updateDb((db) => {
    const user: User = {
      id: newUserId,
      role,
      email,
      phone: null,
      name,
      status: "active",
      clerkId,
      createdAt: nowIso(),
    };
    db.users.push(user);
    if (role === "brand") {
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "brand";
      db.brands.push({
        id: id("br"),
        userId: newUserId,
        businessName: name,
        slug: `${slug}-${newUserId.slice(-4)}`,
        category: "",
        city: "",
        gstin: null,
        kycStatus: "not_submitted",
        website: null,
        createdAt: nowIso(),
      });
    } else {
      const handle =
        (name.replace(/\s+/g, "").toLowerCase() || "creator") + newUserId.slice(-4);
      db.creators.push({
        id: id("cr"),
        userId: newUserId,
        displayName: name,
        handle,
        city: "",
        languages: [],
        categories: [],
        level: "listed",
        panMasked: null,
        upiMasked: null,
        createdAt: nowIso(),
      });
    }
    return user;
  });

  await clearPendingRoleCookie();
  return { ok: true, user: created };
}

export { ROLE_COOKIE };
