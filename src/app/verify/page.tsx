import { MarketingShell } from "@/components/layout/MarketingShell";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export const metadata = { title: "Verify" };

export default function VerifyPage() {
  return (
    <MarketingShell>
      <h1>Verify OTP</h1>
      <div style={{ maxWidth: 480, marginTop: "1rem" }}>
        <ConnectBanner
          provider="Resend or MSG91"
          message="OTP verification needs RESEND_API_KEY or SMS_API_KEY. Use password sign-in until those keys are connected."
        />
      </div>
    </MarketingShell>
  );
}
