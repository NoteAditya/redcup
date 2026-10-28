import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For brands" };

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <h1>Run a pay-for-results bounty</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem" }}>
        You fund the creator budget upfront. RedCup takes a 15% fee (+ GST). Creators apply, we shortlist by Fit
        Score, you award, review drafts, and pay against verified views.
      </p>
      <ol className="card" style={{ marginTop: "1.25rem", paddingLeft: "1.6rem", lineHeight: 1.7 }}>
        <li>Complete KYC (GSTIN). An admin approves before first live bounty.</li>
        <li>Build criteria with presets — see a live eligible-creator count.</li>
        <li>Fund budget + fee. Campaign goes live for applications.</li>
        <li>Close applications → shortlist (3× slots) → award within 48 hours.</li>
        <li>Review draft (one revision). Approve → creator posts → we verify views.</li>
      </ol>
      <Link href="/signup?role=brand" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
        Create a brand account
      </Link>
    </MarketingShell>
  );
}
