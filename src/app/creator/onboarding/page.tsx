import { CreatorOnboardingForm } from "@/components/creator/OnboardingForm";
import { instagramConnectState } from "@/server/integrations/instagram";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export default function CreatorOnboardingPage() {
  const ig = instagramConnectState();
  return (
    <div>
      <h1>Creator profile</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem", maxWidth: "48ch" }}>
        Connect Instagram (or enter self-reported followers until Meta keys exist), plus WhatsApp, PAN, and UPI.
      </p>
      {!ig.ready && ig.message && (
        <div style={{ marginBottom: "1rem", maxWidth: 520 }}>
          <ConnectBanner provider="Meta / Instagram" message={ig.message} />
        </div>
      )}
      <div style={{ maxWidth: 480 }}>
        <CreatorOnboardingForm />
      </div>
    </div>
  );
}
