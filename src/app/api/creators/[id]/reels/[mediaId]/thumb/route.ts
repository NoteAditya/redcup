import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/server/auth/session";
import { readDb, updateDb } from "@/server/db/store";
import { fetchReelThumbnail } from "@/server/integrations/instagram";

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
 * Thumbnail for one of a creator's cached top reels, proxied so an expired Meta CDN link is
 * re-fetched with the creator's stored token. Only reels in the cache can be requested. Signed-in users only.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; mediaId: string }> }) {
  const session = await getSession();
  if (!session.isLoggedIn) return new NextResponse(null, { status: 401 });
  const { id, mediaId } = await ctx.params;
  const db = await readDb();
  const link = db.creators.find((c) => c.id === id)?.instagram;
  const reel = link?.topReels?.find((r) => r.mediaId === mediaId);
  if (!link || !reel) return new NextResponse(null, { status: 404 });

  let img = await fetchImage(reel.thumbnailUrl);
  if (!img) {
    const fresh = await fetchReelThumbnail(link, mediaId);
    img = await fetchImage(fresh);
    if (img && fresh) {
      await updateDb((d) => {
        const r = d.creators.find((c) => c.id === id)?.instagram?.topReels?.find((x) => x.mediaId === mediaId);
        if (r) r.thumbnailUrl = fresh;
      }).catch(() => null);
    }
  }
  if (!img) return new NextResponse(null, { status: 404 });
  return new NextResponse(img.body, {
    headers: { "content-type": img.type, "cache-control": "private, max-age=3600" },
  });
}
