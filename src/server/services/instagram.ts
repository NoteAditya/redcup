"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { getIronSessionHandle, requireUser } from "@/server/auth/session";
import { nowIso, readDb, updateDb } from "@/server/db/store";
import { eraseCreatorInstagram } from "@/server/data-deletion";
import { InstagramError, fetchReelViews } from "@/server/integrations/instagram";
import { logAdmin } from "@/server/access";

/** Creator-initiated: erase the Instagram data we hold, sign out, show the confirmation code. */
export async function deleteMyInstagramData() {
  const session = await requireUser(["creator"]);
  const code = randomBytes(9).toString("base64url");
  await updateDb((db) => {
    const creatorId = eraseCreatorInstagram(db, (c) => c.userId === session.userId);
    db.dataDeletionRequests.push({
      code,
      igUserId: null,
      creatorId,
      source: "creator",
      requestedAt: nowIso(),
      status: creatorId ? "completed" : "no_data",
    });
  });
  const iron = await getIronSessionHandle();
  iron.destroy();
  redirect(`/data-deletion?code=${code}`);
}

/**
 * Admin: read a posted reel's views from Instagram insights. It only fills the number in;
 * the admin still reviews and saves it through the manual form, which stays as the fallback.
 */
export async function fetchViewsFromInstagram(
  applicationId: string,
): Promise<{ ok: true; views: number } | { ok: false; error: string }> {
  const session = await requireUser(["admin"]);
  const db = await readDb();
  const app = db.applications.find((a) => a.id === applicationId);
  const reel = db.reels.find((r) => r.applicationId === applicationId);
  const creator = app ? db.creators.find((c) => c.id === app.creatorId) : null;
  if (!app || !reel) return { ok: false, error: "No reel submitted for this application." };
  if (!creator?.instagram) return { ok: false, error: "This creator hasn't logged in with Instagram. Enter views by hand." };
  try {
    const { views, mediaId } = await fetchReelViews(creator.instagram, { permalink: reel.permalink });
    await updateDb((d) => {
      logAdmin(d, {
        adminId: session.userId,
        action: "instagram_views_fetch",
        targetType: "application",
        targetId: applicationId,
        reason: `Instagram reported ${views} views`,
        details: `media ${mediaId}`,
      });
    });
    return { ok: true, views };
  } catch (e) {
    return { ok: false, error: e instanceof InstagramError ? e.message : "Couldn't reach Instagram. Enter views by hand." };
  }
}
