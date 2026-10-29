import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For creators" };

const STEPS = [
  "Connect Instagram and finish PAN + UPI.",
  "Browse open bounties — see Eligible / Almost / Not eligible before you apply.",
  "Apply only where you match. Brands shortlist by Fit Score.",
  "Ship one draft. One revision. Then post with the paid partnership label.",
  "Earn base plus capped performance on verified views.",
];

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <h1>Earn on approved reels</h1>
      <p style={{ maxWidth: "52ch", marginTop: "0.75rem", fontSize: "1.05rem" }}>
        Connect Instagram, finish PAN and UPI, apply only where you match, and get base plus capped performance for
        verified views.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
        <Link href="/signup?role=creator" className="btn btn-primary">
          Create a creator account
        </Link>
        <Link href="/bounties" className="btn btn-ghost">
          Browse open bounties
        </Link>
      </div>

      <section className="how-band" style={{ marginTop: "2.5rem" }}>
        <div className="how-band-head">
          <h2>From profile to payout</h2>
          <p>Apply with confidence. Earn when the reel is live and views are verified.</p>
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
          <h3>Eligibility first</h3>
          <p style={{ marginTop: "0.4rem" }}>
            Every open bounty shows whether you match before you spend a minute writing.
          </p>
        </div>
        <div className="card">
          <h3>Pay for results</h3>
          <p style={{ marginTop: "0.4rem" }}>
            Base for an approved live reel, plus capped performance on verified views — within campaign caps.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
