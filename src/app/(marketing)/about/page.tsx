import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About RedCup — Performance Creator Protocol" };

export default function AboutPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "720px", marginBottom: "3rem" }}>
        <p className="kicker">About the Platform</p>
        <h1 style={{ marginBottom: "0.85rem" }}>
          Built for brands and creators who want verified results.
        </h1>
        <p className="lede">
          Most influencer marketing runs on fake screenshots, delayed invoices, and guesswork. RedCup fixes that with escrow and direct API tracking. Brands deposit budgets before work begins, creators review clear briefs, and payouts trigger automatically as verified Instagram views hit each milestone.
        </p>

        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.5rem" }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.75rem" }}>
            For Brands
          </span>
          <h3 style={{ fontSize: "1.15rem" }}>Predictable ROI</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Fund your campaign once into escrow. Award creators ranked by Fit Score and only pay when the reel is live and real views are verified.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.75rem" }}>
            For Creators
          </span>
          <h3 style={{ fontSize: "1.15rem" }}>Guaranteed Payouts</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Check your eligibility tag before spending time applying. Receive your base fee upon publication, plus view bonuses directly via UPI.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-warn" style={{ marginBottom: "0.75rem" }}>
            Platform Engine
          </span>
          <h3 style={{ fontSize: "1.15rem" }}>Graph API Verification</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            No fake screenshots or spoofed analytics. RedCup reads direct Instagram Graph metrics on verified post permalinks with paid partnership tags.
          </p>
        </div>
      </div>
    </MarketingShell>
  );
}
