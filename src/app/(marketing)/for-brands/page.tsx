import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For brands" };

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <p className="chip" style={{ marginBottom: "0.85rem" }}>
        Brands
      </p>
      <h1>Run a pay-for-results bounty</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem", fontSize: "1.02rem" }}>
        You fund the creator budget upfront. RedCup takes a 15% fee (+ GST). Creators apply, we shortlist by Fit
        Score, you award, review drafts, and pay against verified views.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
        <Link href="/signup?role=brand" className="btn btn-primary">
          Create a brand account
        </Link>
        <Link href="/bounties" className="btn btn-ghost">
          See open bounties
        </Link>
      </div>

      <section className="band band-mint" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>From KYC to verified views</h2>
        <ol className="axis" style={{ listStyle: "none", padding: 0, gap: "0.75rem" }}>
          {[
            "Complete KYC (GSTIN). An admin approves before first live bounty.",
            "Build criteria with presets — see a live eligible-creator count.",
            "Fund budget + fee. Campaign goes live for applications.",
            "Close applications → shortlist (3× slots) → award within 48 hours.",
            "Review draft (one revision). Approve → creator posts → we verify views.",
          ].map((step, i) => (
            <li key={step} className="card" style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", boxShadow: "none" }}>
              <span className="step-num" style={{ margin: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="axis axis-2" style={{ marginTop: "0.5rem" }}>
        <div className="card">
          <h3>Clear spend</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Creator budget and platform fee are shown before you fund. No surprise retainers.
          </p>
        </div>
        <div className="card">
          <h3>Fit Score shortlist</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Award from a ranked shortlist. Miss the window and top Fit Scores auto-award so the campaign does not stall.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
