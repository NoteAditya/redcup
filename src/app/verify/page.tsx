import { MarketingShell } from "@/components/layout/MarketingShell";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export const metadata = { title: "Verify Code — RedCup" };

export default function VerifyPage() {
  return (
    <MarketingShell>
      <div
        style={{
          maxWidth: 440,
          margin: "2rem auto 4rem",
          backgroundColor: "var(--sheet)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <span className="chip chip-warn" style={{ marginBottom: "0.5rem" }}>
          Security Verification
        </span>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Verify One-Time Code</h1>
        <p className="muted" style={{ marginBottom: "1.25rem", fontSize: "0.875rem" }}>
          Enter the authentication code sent to your registered channel.
        </p>

        <div>
          <ConnectBanner
            provider="Resend or MSG91"
            message="OTP delivery requires RESEND_API_KEY or SMS_API_KEY. Please use password sign-in until those services are connected."
          />
        </div>
      </div>
    </MarketingShell>
  );
}
