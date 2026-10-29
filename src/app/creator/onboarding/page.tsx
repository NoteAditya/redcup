import { CreatorOnboardingForm } from "@/components/creator/OnboardingForm";
import { instagramConnectState } from "@/server/integrations/instagram";

export default function CreatorOnboardingPage() {
  const ig = instagramConnectState();
  return (
    <div>
      <h1>Creator onboarding</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1.25rem", maxWidth: "48ch" }}>
        One question at a time. Watch your profile card take shape — resume anytime on this device.
      </p>
      <CreatorOnboardingForm igMessage={!ig.ready ? ig.message : null} />
    </div>
  );
}
