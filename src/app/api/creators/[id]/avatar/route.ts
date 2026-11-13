import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { syncCreatorInstagram } from "@/server/instagram-sync";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/i;

async function fetchImage(url: string | null | undefined) {
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch {
    return null;
  }
  if (!ALLOWED_HOSTS.test(host)) return null;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" }).catch(() => null);
  if (!res?.ok || !(res.headers.get("content-type") || "").startsWith("image/")) return null;
  return { body: await res.arrayBuffer(), type: res.headers.get("content-type")! };
}

/**
 * Instagram profile picture for a creator, proxied so the browser never depends on a Meta CDN
 * link that has expired. Refreshes the link with the creator's stored token when it is stale or broken.
 * Signed-in users only.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) return new NextResponse(null, { status: 401 });
  const { id } = await ctx.params;
  const db = await readDb();
  const creator = db.creators.find((c) => c.id === id);
  if (!creator?.instagram) return new NextResponse(null, { status: 404 });

  let link = (await syncCreatorInstagram(id).catch(() => null)) ?? creator.instagram;
  let img = await fetchImage(link.profilePictureUrl);
  const recentlyFetched = link.pictureFetchedAt && Date.now() - Date.parse(link.pictureFetchedAt) < 10 * 60_000;
  if (!img && !recentlyFetched) {
    link = (await syncCreatorInstagram(id, { force: true }).catch(() => null)) ?? link;
    img = await fetchImage(link.profilePictureUrl);
  }
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(img.body, {
    headers: { "content-type": img.type, "cache-control": "private, max-age=3600" },
  });
}
