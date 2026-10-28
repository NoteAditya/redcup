import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>About</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>RedCup is an India-focused creator marketing platform. Brands fund Instagram reel bounties; eligible creators apply; Fit Score shortlists; brands award; creators earn base + pay per verified views.</p>
    </MarketingShell>
  );
}
