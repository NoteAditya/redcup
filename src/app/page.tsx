import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="axis axis-hero" style={{ padding: "1.5rem 0 2rem" }}>
        <div>
          <p className="chip chip-cup" style={{ marginBottom: "1rem" }}>
            Pay for verified views
          </p>
          <h1 style={{ maxWidth: "18ch" }}>Fund a reel bounty. Pay creators for results.</h1>
          <p className="prose-tight" style={{ marginTop: "1rem", maxWidth: "42ch", fontSize: "1rem" }}>
            RedCup is for Indian brands that want Instagram reels with an upfront budget, a shortlist of
            eligible creators, and payouts tied to an approved live reel plus verified views — not vanity
            follower counts.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            <Link href="/signup?role=brand" className="btn btn-primary">
              Start as a brand
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost">
              Join as a creator
            </Link>
          </div>
        </div>
        <div className="ui-fragment" aria-hidden>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Product preview · bounty card
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
            <strong>Weekend skincare reel</strong>
            <span className="chip">Live</span>
          </div>
          <p className="muted" style={{ margin: "0.5rem 0 0.75rem", fontSize: "0.85rem" }}>
            Base + {formatINR(80000)} / 1K views · cap {formatINR(1500000)}
          </p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <span className="chip">Beauty</span>
            <span className="chip">Hindi / English</span>
            <span className="chip chip-ok">Eligible</span>
          </div>
          <div className="solid-block" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Apply → shortlist by Fit Score → brand awards → draft → live reel → verified views
          </div>
        </div>
      </section>

      <section className="axis axis-2" style={{ marginTop: "1rem" }}>
        <div className="card">
          <h2>For brands</h2>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Set criteria, fund the bounty once, shortlist from Fit Score, award up to your slots, review drafts,
            and settle against verified views.
          </p>
          <Link href="/for-brands" className="btn btn-ghost" style={{ marginTop: "0.9rem" }}>
            How brands use RedCup
          </Link>
        </div>
        <div className="card">
          <h2>For creators</h2>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            See eligibility on every card. Apply only when you match. Earn a base for an approved live reel, then
            pay per verified 1,000 views up to the cap.
          </p>
          <Link href="/for-creators" className="btn btn-ghost" style={{ marginTop: "0.9rem" }}>
            How creators earn
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
