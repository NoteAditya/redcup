import { redirect } from "next/navigation";
import { after } from "next/server";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { requirePageRole } from "@/server/auth/guard";
import { creatorOnboarded } from "@/lib/profile";
import { syncTopReels, topReelsStale } from "@/server/instagram-sync";
import { CreatorBento } from "@/components/creator/CreatorBento";
import { CreatorProfileForm } from "@/components/creator/ProfileForm";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage() {
  await requirePageRole("creator");
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  if (!creator || !creatorOnboarded(creator)) redirect("/creator/onboarding");
  const metrics = db.creatorMetrics.find((m) => m.creatorId === creator.id);
  if (creator.instagram && topReelsStale(creator.instagram)) {
    const id = creator.id;
    after(() => syncTopReels(id).catch(() => null));
  }
  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <span className="chip">Your profile</span>
        <h1>How brands see you</h1>
        <p className="muted">Your picture, bio, followers and reels come from Instagram. Edit the rest below.</p>
      </div>
      <CreatorBento creator={creator} metrics={metrics} />
      <section className="bento-tile profile-edit" aria-labelledby="edit-h">
        <h2 id="edit-h">Edit profile</h2>
        <CreatorProfileForm
          initial={{
            displayName: creator.displayName,
            handle: creator.handle,
            city: creator.city,
            languages: creator.languages,
            categories: creator.categories,
            whatsapp: metrics?.whatsapp ?? "",
            panMasked: creator.panMasked,
            panSkipped: Boolean(creator.panSkippedAt),
            upiMasked: creator.upiMasked,
          }}
        />
      </section>
    </div>
  );
}
