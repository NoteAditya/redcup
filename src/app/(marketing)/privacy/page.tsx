import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Privacy Policy — RedCup" };

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "780px", margin: "2rem auto 4rem" }}>
        <p className="kicker">Data Protection</p>
        <h1 style={{ marginBottom: "1rem" }}>Privacy Policy</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>Last updated: November 2026</p>

        <div className="card" style={{ padding: "2.5rem", display: "grid", gap: "1.75rem", lineHeight: 1.7 }}>
          <div>
            <h3>1. Information We Collect</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              We collect information required for business KYC (GSTIN, legal entity names) and creator verification (PAN, UPI ID, authenticated Instagram profile metrics).
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>2. Instagram Data Usage</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              We access read-only metrics via official Meta Graph API endpoints strictly to verify campaign reel view counts, engagement rates, and paid partnership compliance.
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>3. Payout &amp; Banking Security</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Sensitive financial credentials (PAN and UPI) are stored encrypted using industry-standard AES-256 encryption and processed through RBI-authorized payment aggregators.
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
