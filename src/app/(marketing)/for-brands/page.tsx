import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For Brands — Performance Creator Bounties" };

const STEPS = [
  {
    step: "Step 1",
    tag: "Business Verification",
    title: "Complete Fast Business Verification",
    desc: "Verify your GSTIN and business profile. Admin verification protects the marketplace and guarantees campaign compliance.",
  },
  {
    step: "Step 2",
    tag: "Audience Filters",
    title: "Define Audience & Creator Criteria",
    desc: "Use category presets or define custom requirements (niche, city, follower range). See real-time eligible creator counts as you configure.",
  },
  {
    step: "Step 3",
    tag: "100% Escrow",
    title: "Fund Campaign Escrow",
    desc: "Lock the creator payout pool plus a 15% platform fee (+ GST). Your campaign immediately opens for applications.",
  },
  {
    step: "Step 4",
    tag: "Fit Score Rank",
    title: "Shortlist via Fit Score and Award",
    desc: "RedCup ranks applicants by Fit Score (audience overlap, historical reel views, engagement). Review and award slots within 48 hours.",
  },
  {
    step: "Step 5",
    tag: "API Verification",
    title: "Single Draft Review & View Tracking",
    desc: "Review one draft with one revision. Once approved, the creator publishes with the paid partnership tag. We verify views directly via Instagram Graph API.",
  },
];

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "680px", marginBottom: "3rem" }}>
        <h1 style={{ marginBottom: "0.85rem" }}>
          Run creator campaigns that guarantee verified views.
        </h1>
        <p className="lede">
          Lock your budget in escrow before production begins. Creators apply with pre-checked eligibility, Fit Score surfaces the best matches, and you pay only after the approved reel hits real view milestones.
        </p>
        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/signup?role=brand" className="btn btn-primary">
            Create Brand Account
          </Link>
          <Link href="/bounties" className="btn btn-ghost">
            View Live Bounties
          </Link>
        </div>
      </div>

      {/* 5-Step Ruled Ledger */}
      <section
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          backgroundColor: "var(--sheet)",
          margin: "var(--section-gap) 0",
        }}
      >
        <div style={{ padding: "1.5rem 1.75rem", borderBottom: "1px solid var(--line)", backgroundColor: "var(--paper-subtle)" }}>
          <span className="chip chip-cup">Standard SLA</span>
          <h2 style={{ fontSize: "1.25rem", marginTop: "0.35rem" }}>From GSTIN verification to verified views</h2>
        </div>

        <div>
          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: "1.5rem",
                padding: "1.5rem 1.75rem",
                borderBottom: idx < STEPS.length - 1 ? "1px solid var(--line)" : "none",
                alignItems: "start",
              }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--muted)" }}>
                {step.step}
              </div>
              <div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.0625rem" }}>{step.title}</h3>
                  <span className="chip" style={{ fontSize: "0.6875rem" }}>{step.tag}</span>
                </div>
                <p style={{ margin: "0.35rem 0 0", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.65rem" }}>Transparent Escrow</span>
          <h3 style={{ fontSize: "1.15rem" }}>No surprise retainers</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Creator pool and platform fee are displayed and locked before your campaign launches. Never worry about scope creep or hidden talent markup fees.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.65rem" }}>Automated Shortlist</span>
          <h3 style={{ fontSize: "1.15rem" }}>Fit Score ranking engine</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Our matching algorithms evaluate audience match, engagement authenticity, and past performance. In case you miss the award window, top Fit Scores auto-award to keep production on track.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
