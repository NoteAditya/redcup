import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For brands" };

const STEPS = [
  "Complete KYC (GSTIN). An admin approves before first live bounty.",
  "Build criteria with presets — see a live eligible-creator count.",
  "Fund budget + fee. Campaign goes live for applications.",
  "Close applications → shortlist (3× slots) → award within 48 hours.",
  "Review draft (one revision). Approve → creator posts → we verify views.",
];

export default function ForBrandsPage() {
  return (
    <MarketingShell night>
      <h1>Run a pay-for-results bounty</h1>
      <p style={{ maxWidth: "52ch", marginTop: "0.75rem", fontSize: "1.05rem" }}>
        You fund the creator budget upfront. RedCup takes a 15% fee (+ GST). Creators apply, we shortlist by Fit Score,
        you award, review drafts, and pay against verified views.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
        <Link href="/signup?role=brand" className="btn btn-primary">
          Create a brand account
        </Link>
        <Link href="/bounties" className="btn btn-ghost">
          See open bounties
        </Link>
      </div>

      <section className="how-band" style={{ marginTop: "2.5rem" }}>
        <div className="how-band-head">
          <h2>From KYC to verified views</h2>
          <p>One status for both sides — no retainer fog, no spreadsheet claims.</p>
        </div>
        <div className="how-cols" style={{ gridTemplateColumns: "1fr" }}>
          {STEPS.map((step) => (
            <div key={step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
              <span
                aria-hidden
                style={{
                  width: "0.55rem",
                  height: "0.55rem",
                  borderRadius: "50%",
                  background: "var(--cta)",
                  marginTop: "0.45rem",
                  flexShrink: 0,
                }}
              />
              <p style={{ margin: 0, maxWidth: "56ch" }}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="axis axis-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3>Clear spend</h3>
          <p style={{ marginTop: "0.4rem" }}>
            Creator budget and platform fee are shown before you fund. No surprise retainers.
          </p>
        </div>
        <div className="card">
          <h3>Fit Score shortlist</h3>
          <p style={{ marginTop: "0.4rem" }}>
            Award from a ranked shortlist. Miss the window and top Fit Scores auto-award so the campaign does not stall.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
