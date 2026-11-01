import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Terms of Service — RedCup" };

export default function TermsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "780px", margin: "2rem auto 4rem" }}>
        <p className="kicker">Legal Agreement</p>
        <h1 style={{ marginBottom: "1rem" }}>Terms of Service</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>Last updated: November 2026</p>

        <div className="card" style={{ padding: "2.5rem", display: "grid", gap: "1.75rem", lineHeight: 1.7 }}>
          <div>
            <h3>1. Campaign Escrow &amp; Funding</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              All brand bounties must be pre-funded in INR, including applicable GST and the 15% platform fee. Funds remain in escrow until reels are posted and Instagram Graph metrics are authenticated.
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>2. Creator Eligibility &amp; Compliance</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Creators must maintain authentic Instagram accounts, complete PAN and UPI verification, and strictly comply with Meta&apos;s Branded Content policies including the required &quot;Paid Partnership&quot; label.
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>3. View Verification &amp; Payouts</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Performance bonuses are calculated solely based on official Instagram Graph API metrics. Artificial, botted, or manipulated views are identified and deducted by the platform fraud engine.
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
