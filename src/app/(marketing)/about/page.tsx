import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About RedCup — Performance Creator Protocol" };

export default function AboutPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "760px", margin: "clamp(1.5rem, 4vw, 3rem) 0 clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="kicker">
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
          <span>About the Protocol</span>
        </div>
        <h1 style={{ marginBottom: "1.15rem", lineHeight: 1.08 }}>
          Built for brands and creators who want verified results.
        </h1>
        <p className="lede">
          Most influencer marketing runs on fake screenshots, delayed invoices, and guesswork. RedCup fixes that with escrow and direct API tracking. Brands deposit budgets before work begins, creators review clear briefs, and payouts trigger automatically as verified Instagram views hit each milestone.
        </p>

        <div style={{ display: "flex", gap: "0.85rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/signup" className="btn btn-primary">
            Get Started on RedCup
          </Link>
          <Link href="/bounties" className="btn btn-ghost">
            View Live Bounties
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.85rem" }}>
            For Brands
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Predictable ROI</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            Fund your campaign once into escrow. Award creators ranked by Fit Score and only pay when the reel is live and real views are verified.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.85rem" }}>
            For Creators
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Guaranteed Payouts</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            Check your eligibility tag before spending time applying. Receive your base fee upon publication, plus view bonuses directly via UPI.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-warn" style={{ marginBottom: "0.85rem" }}>
            Platform Engine
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Graph API Verification</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            No fake screenshots or spoofed analytics. RedCup reads direct Instagram Graph metrics on verified post permalinks with paid partnership tags.
          </p>
        </div>
      </div>

      {/* Platform Guarantees Section */}
      <section
        style={{
          backgroundColor: "var(--paper-subtle)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          padding: "clamp(2.5rem, 5vw, 4rem)",
          margin: "var(--section-gap) 0 2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ maxWidth: "600px", marginBottom: "2rem" }}>
          <div className="kicker">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
            <span>Core Standards</span>
          </div>
          <h2>Our architectural commitments</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <div style={{ fontFamily: "var(--font-outlier)", fontSize: "2rem", color: "var(--cta)", marginBottom: "0.35rem" }}>
              01
            </div>
            <h4 style={{ marginBottom: "0.35rem" }}>100% Escrow Backing</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              No campaign opens without pre-funded capital safely locked in an RBI-compliant escrow account.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-outlier)", fontSize: "2rem", color: "var(--wine)", marginBottom: "0.35rem" }}>
              02
            </div>
            <h4 style={{ marginBottom: "0.35rem" }}>Direct Meta Telemetry</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Official Instagram Graph API integration means zero fake screenshots, zero bot spikes, and clean metric tracking.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: "var(--font-outlier)", fontSize: "2rem", color: "var(--ok)", marginBottom: "0.35rem" }}>
              03
            </div>
            <h4 style={{ marginBottom: "0.35rem" }}>Direct UPI Milestone Transfers</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Instant automated deposits to creator bank accounts as soon as reel views hit agreed tiers.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
