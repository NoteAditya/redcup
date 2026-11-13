import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { instagramAuthUrl, instagramRedirectUri } from "@/server/integrations/instagram";

export const dynamic = "force-dynamic";

const IG_STATE_COOKIE = "redcup_ig_state";

/** Starts creator login: one-time state in an httpOnly cookie, then off to Meta's dialog. */
export async function GET(req: NextRequest) {
  const state = randomBytes(24).toString("base64url");
  const url = instagramAuthUrl(state, instagramRedirectUri(req.nextUrl.origin));
  if (!url) return NextResponse.redirect(new URL("/login?ig_error=config", req.nextUrl.origin));
  const jar = await cookies();
  jar.set(IG_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return NextResponse.redirect(url);
}
