import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="hero-grid">
        <div>
          <p className="chip" style={{ marginBottom: "1rem" }}>
            Pay for verified Instagram views
          </p>
          <h1>Fund a reel bounty. Pay for results.</h1>
          <p className="muted" style={{ marginTop: "0.9rem", maxWidth: "42ch", fontSize: "1.02rem" }}>
            Brands lock a budget. Eligible creators apply. You award, review one draft, and pay for an approved
            live reel plus verified views — not vanity reach.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.35rem" }}>
            <Link href="/signup?role=brand" className="btn btn-primary">
              Start as a brand
            </Link>
            <Link href="/signup?role=creator" className="btn btn-secondary">
              Join as a creator
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.85rem" }}>
            Already on RedCup? <Link href="/login">Sign in</Link>
          </p>
        </div>

        <div className="ui-fragment" aria-hidden>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
            <strong style={{ fontSize: "0.92rem" }}>Bounty · Skincare reel</strong>
            <span className="chip chip-ok">Live</span>
          </div>
          <div style={{ display: "grid", gap: "0.55rem", fontSize: "0.88rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Creator budget</span>
              <strong>₹48,000</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="muted">Platform fee (15%)</span>
              <strong>₹7,200</strong>
            </div>
            <div style={{ height: 1, background: "var(--line)", margin: "0.25rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Eligibility</span>
              <span className="chip">12 matched</span>
            </div>
            <div
              style={{
                marginTop: "0.35rem",
                padding: "0.75rem",
                borderRadius: 12,
                background: "var(--blush)",
                display: "grid",
                gap: "0.45rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Ananya · Beauty</span>
                <span className="chip chip-ok">Eligible</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Rohan · Lifestyle</span>
                <span className="chip chip-warn">Almost</span>
              </div>
            </div>
            <div style={{ marginTop: "0.35rem" }}>
              <span className="btn btn-primary" style={{ width: "100%", pointerEvents: "none" }}>
                Review shortlist
              </span>
            </div>
          </div>
        </div>
      </section>

      <p className="tagline-block">
        All the clarity of a brief.
        <br />
        None of the retainer fog.
      </p>

      <section className="band band-mint">
        <h2 style={{ marginBottom: "1.1rem" }}>How a bounty moves</h2>
        <div className="axis axis-4">
          {[
            ["01", "Fund", "Lock creator budget and platform fee. Campaign opens for applications."],
            ["02", "Apply", "Creators see Eligible / Almost / Not eligible before they spend a minute."],
            ["03", "Award", "Shortlist by Fit Score. Award slots — or auto-award if the window closes."],
            ["04", "Verify", "One draft revision. Live reel with paid label. Pay on verified views."],
          ].map(([n, t, d]) => (
            <div key={n} className="card" style={{ boxShadow: "none" }}>
              <div className="step-num">{n}</div>
              <h3>{t}</h3>
              <p className="muted" style={{ marginTop: "0.4rem", fontSize: "0.9rem" }}>
                {d}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="split-panel">
        <div className="card">
          <p className="chip" style={{ marginBottom: "0.75rem" }}>
            Brands
          </p>
          <h2>Run a pay-for-results bounty</h2>
          <p className="muted" style={{ marginTop: "0.65rem" }}>
            KYC once, build criteria with a live eligible count, fund upfront, and pay against approved posts plus
            verified views. RedCup takes 15% (+ GST).
          </p>
          <Link href="/for-brands" className="btn btn-primary" style={{ marginTop: "1.1rem" }}>
            See brand flow
          </Link>
        </div>
        <div className="card">
          <p className="chip" style={{ marginBottom: "0.75rem" }}>
            Creators
          </p>
          <h2>Earn on approved reels</h2>
          <p className="muted" style={{ marginTop: "0.65rem" }}>
            Connect Instagram, finish PAN and UPI, apply only where you match, and get base plus capped performance
            for verified views.
          </p>
          <Link href="/for-creators" className="btn btn-secondary" style={{ marginTop: "1.1rem" }}>
            See creator flow
          </Link>
        </div>
      </section>

      <section className="band band-ink">
        <h2 style={{ maxWidth: "22ch" }}>WhatsApp threads and spreadsheet claims, retired.</h2>
        <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "48ch" }}>
          Applications, drafts, awards, and view verification live in one place — so brands and creators share the
          same status, not three chat histories.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
          <Link href="/bounties" className="btn btn-primary">
            Browse open bounties
          </Link>
          <Link href="/about" className="btn btn-ghost" style={{ color: "#fff", borderColor: "color-mix(in srgb, white 25%, transparent)" }}>
            About RedCup
          </Link>
        </div>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        <h2>Questions brands and creators ask</h2>
        <div className="axis" style={{ marginTop: "1rem", gap: "0.75rem" }}>
          {[
            [
              "When does money move?",
              "Brands fund the creator budget and fee before a bounty goes live. Creators are paid after an approved live reel and verified views, within the campaign caps.",
            ],
            [
              "What is Fit Score?",
              "A shortlist signal from niche match, audience fit, and reliability. Brands award from the shortlist; missed award windows auto-award top Fit Scores.",
            ],
            [
              "Do I need Instagram Business?",
              "Creators connect Instagram and finish PAN + UPI before applying. Brands complete GSTIN KYC before the first live bounty.",
            ],
          ].map(([q, a]) => (
            <div key={q} className="card" style={{ boxShadow: "none" }}>
              <h3>{q}</h3>
              <p className="muted" style={{ marginTop: "0.4rem" }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
