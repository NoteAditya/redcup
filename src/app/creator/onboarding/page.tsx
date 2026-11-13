import { CreatorOnboardingForm } from "@/components/creator/OnboardingForm";
import { instagramConnectState } from "@/server/integrations/instagram";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { requirePageRole } from "@/server/auth/guard";
import { redirect } from "next/navigation";
import { creatorOnboarded } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function CreatorOnboardingPage() {
  await requirePageRole("creator");
  const ig = instagramConnectState();
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  // The step-by-step setup is only for creators that haven't finished it; everyone else edits their profile.
  if (creatorOnboarded(creator)) redirect("/creator/profile");
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
