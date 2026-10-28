import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Terms" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>Terms</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>By using RedCup you agree to fund bounties in INR, keep KYC accurate, and follow Meta paid partnership rules. Full legal terms ship with launch counsel review.</p>
    </MarketingShell>
  );
}
