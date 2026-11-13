import { CreatorOnboardingForm } from "@/components/creator/OnboardingForm";
import { instagramConnectState } from "@/server/integrations/instagram";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function CreatorOnboardingPage() {
  const ig = instagramConnectState();
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const link = creator?.instagram;
  return (
    <div>
      <h1>Creator onboarding</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1.25rem", maxWidth: "48ch" }}>
        {link
          ? `Connected as @${link.username}. Your handle and followers come from Instagram; add the rest below.`
          : "One question at a time. Watch your profile card take shape — resume anytime on this device."}
      </p>
      <CreatorOnboardingForm
        igMessage={!ig.ready ? ig.message : null}
        instagram={
          link && creator
            ? {
                username: link.username,
                name: link.name,
                followers: link.followers,
                avatarSrc: link.profilePictureUrl ? `/api/creators/${creator.id}/avatar` : null,
              }
            : null
        }
      />
    </div>
  );
}
