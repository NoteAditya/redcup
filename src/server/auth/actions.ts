"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { id, nowIso, readDb, updateDb } from "@/server/db/store";
import { getIronSessionHandle } from "./session";
import { ROLE_COOKIE } from "./clerk-sync";
import { sendWelcomeEmail, sendMail } from "@/server/integrations/mail";

function normalizeContact(contact: string) {
  return contact.trim().toLowerCase();
}

export async function demoSignUp(input: {
  role: "brand" | "creator";
  name: string;
  email?: string;
  phone?: string;
  password: string;
}) {
  const contact = input.email || input.phone;
  if (!contact || input.password.length < 6) {
    return { ok: false as const, error: "Email or phone and a password of 6+ characters are required." };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const userId = id("usr");

  const result = await updateDb((db) => {
    const exists = db.users.find(
      (u) =>
        (input.email && u.email === normalizeContact(input.email)) ||
        (input.phone && u.phone === input.phone.trim()),
    );
    if (exists) return { ok: false as const, error: "An account with that contact already exists." };

    db.users.push({
      id: userId,
      role: input.role,
      email: input.email ? normalizeContact(input.email) : null,
      phone: input.phone?.trim() || null,
      name: input.name.trim(),
      status: "active",
      passwordHash,
      createdAt: nowIso(),
    });

    if (input.role === "brand") {
      const slug =
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 40) || "brand";
      db.brands.push({
        id: id("br"),
        userId,
        businessName: input.name.trim(),
        slug: `${slug}-${userId.slice(-4)}`,
        category: "",
        city: "",
        gstin: null,
        kycStatus: "not_submitted",
        website: null,
        createdAt: nowIso(),
      });
    } else {
      const handle =
        (input.name.replace(/\s+/g, "").toLowerCase() || "creator") + userId.slice(-4);
      db.creators.push({
        id: id("cr"),
        userId,
        displayName: input.name.trim(),
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
    return { ok: true as const };
  });

  if (!result.ok) return result;

  const session = await getIronSessionHandle();
  session.userId = userId;
  session.role = input.role;
  session.name = input.name.trim();
  session.isLoggedIn = true;
  await session.save();

  if (input.email) {
    await sendWelcomeEmail(normalizeContact(input.email), input.name.trim(), input.role);
  }

  redirect(input.role === "brand" ? "/brand/onboarding" : "/creator/onboarding");
}

export async function demoSignIn(input: { contact: string; password: string }) {
  const contact = normalizeContact(input.contact);
  const db = await readDb();
  const user =
    db.users.find(
      (u) =>
        (u.email && u.email === contact) ||
        (u.phone && u.phone === input.contact.trim()),
    ) || null;

  if (!user?.passwordHash) {
    return { ok: false as const, error: "No account found for that contact." };
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) return { ok: false as const, error: "Wrong password." };

  const session = await getIronSessionHandle();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  session.isLoggedIn = true;
  await session.save();

  if (user.role === "brand") redirect("/brand");
  if (user.role === "creator") redirect("/creator");
  redirect("/admin");
}

export async function signOut() {
  const session = await getIronSessionHandle();
  session.destroy();
  redirect("/");
}

export async function requestOtp(contact: string) {
  if (!process.env.RESEND_API_KEY && !process.env.SMS_API_KEY) {
    return {
      ok: false as const,
      needsConnect: true as const,
      provider: contact.includes("@") ? "Resend (email OTP)" : "MSG91 / Twilio (SMS OTP)",
      message:
        "OTP login needs an email or SMS provider key. Use password sign-in for now, or add RESEND_API_KEY / SMS_API_KEY.",
    };
  }
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await updateDb((db) => {
    db.otps = db.otps.filter((o) => o.contact !== normalizeContact(contact));
    db.otps.push({
      contact: normalizeContact(contact),
      code,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    });
  });
  if (contact.includes("@") && process.env.RESEND_API_KEY) {
    await sendMail({
      to: normalizeContact(contact),
      subject: "Your RedCup sign-in code",
      html: `<p>Your code is <strong>${code}</strong>. It expires in 10 minutes.</p>`,
    });
    return { ok: true as const };
  }
  return { ok: true as const, demoCode: process.env.NODE_ENV === "production" ? undefined : code };
}

/** Persist brand/creator choice for the next Google SSO completion. */
export async function setPendingRole(role: "brand" | "creator") {
  const { cookies } = await import("next/headers");
  const jar = await cookies();
  jar.set(ROLE_COOKIE, role, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 15,
    path: "/",
  });
  return { ok: true as const };
}

/** Claim a role for a Clerk user who signed in without a pending role. */
export async function claimClerkRole(role: "brand" | "creator") {
  await setPendingRole(role);
  const { syncClerkToLocalUser } = await import("./clerk-sync");
  const synced = await syncClerkToLocalUser();
  if (!synced.ok) {
    return { ok: false as const, error: "Could not create your RedCup profile. Try Google again." };
  }
  redirect(role === "brand" ? "/brand/onboarding" : "/creator/onboarding");
}
