import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Refunds" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>Refunds</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>Unused budget after a bounty closes returns to the brand wallet (minus non-refundable platform fee already charged). Creators are paid only after verification.</p>
    </MarketingShell>
  );
}
