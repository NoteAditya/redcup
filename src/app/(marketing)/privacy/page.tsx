import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Privacy" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>Privacy</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>We store account, KYC, campaign, and Instagram metric data needed to run bounties. PAN and UPI are masked in the UI and encrypted at rest when ENCRYPTION_KEY is set.</p>
    </MarketingShell>
  );
}
