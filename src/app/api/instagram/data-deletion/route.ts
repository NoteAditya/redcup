import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { nowIso, updateDb } from "@/server/db/store";
import { instagramConfig, parseSignedRequest } from "@/server/integrations/instagram";
import { eraseCreatorInstagram } from "@/server/data-deletion";

export const dynamic = "force-dynamic";

/**
 * Meta "Data Deletion Request" callback. Meta POSTs a signed_request (form field) when someone
 * removes RedCup from their Instagram/Facebook settings. We verify it with the app secret, erase the
 * Instagram data we hold for that account, and answer with a status URL and confirmation code.
 */
export async function POST(req: NextRequest) {
  const cfg = instagramConfig();
  if (!cfg) return NextResponse.json({ error: "not configured" }, { status: 503 });
  let signed = "";
  const type = req.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    const body = (await req.json().catch(() => ({}))) as { signed_request?: string };
    signed = body.signed_request || "";
  } else {
    const form = await req.formData().catch(() => null);
    signed = String(form?.get("signed_request") || "");
  }
  const data = parseSignedRequest(signed, cfg.appSecret);
  if (!data) return NextResponse.json({ error: "invalid signed_request" }, { status: 400 });
  const metaUserId = data.user_id != null ? String(data.user_id) : null;

  const code = randomBytes(9).toString("base64url");
  await updateDb((db) => {
    const erased = metaUserId ? eraseCreatorInstagram(db, (c) => c.instagram?.igUserId === metaUserId) : null;
    db.dataDeletionRequests.push({
      code,
      igUserId: metaUserId,
      creatorId: erased,
      source: "meta_callback",
      requestedAt: nowIso(),
      status: erased ? "completed" : "no_data",
    });
  });

  const base = (process.env.APP_URL || req.nextUrl.origin).replace(/\/$/, "");
  return NextResponse.json({ url: `${base}/data-deletion?code=${code}`, confirmation_code: code });
}
