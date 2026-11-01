import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For Creators — Earn on Approved Reels" };

const STEPS = [
  {
    step: "Step 1",
    tag: "Instagram Auth",
    title: "Connect Instagram & Set Up Payouts",
    desc: "Authenticate your professional Instagram account and submit PAN + UPI details for automated direct deposits.",
  },
  {
    step: "Step 2",
    tag: "Live Eligibility",
    title: "Instant Eligibility Check on Every Bounty",
    desc: "Browse live campaigns and see whether you are Eligible, Almost, or Not Eligible before writing a single word.",
  },
  {
    step: "Step 3",
    tag: "Smart Matching",
    title: "Apply Only Where You Match",
    desc: "No wasted pitches. Brands review automated Fit Score shortlists and award slots within 48 hours.",
  },
  {
    step: "Step 4",
    tag: "Draft Feedback",
    title: "Submit Draft with One Revision Cycle",
    desc: "Upload your reel draft directly in the creator dashboard. Clear brand feedback with maximum one revision round.",
  },
  {
    step: "Step 5",
    tag: "Direct UPI",
    title: "Publish & Receive Guaranteed Payout",
    desc: "Post with the paid partnership tag. Earn guaranteed base payout upon publishing, plus performance bonuses per 1,000 verified views.",
  },
];

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "680px", marginBottom: "3rem" }}>
        <h1 style={{ marginBottom: "0.85rem" }}>
          Earn on approved reels and verified views.
        </h1>
        <p className="lede">
          Connect your Instagram account, check your eligibility on any open campaign before applying, upload a single draft, and get paid directly via UPI as soon as views hit each milestone.
        </p>
        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/signup?role=creator" className="btn btn-primary">
            Join as a Creator
          </Link>
          <Link href="/bounties" className="btn btn-ghost">
            Browse Open Bounties
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
          <span className="chip chip-cup">Creator SLA</span>
          <h2 style={{ fontSize: "1.25rem", marginTop: "0.35rem" }}>From profile connection to direct UPI payout</h2>
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

      {/* Value Pillars */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.65rem" }}>Zero Time Waste</span>
          <h3 style={{ fontSize: "1.15rem" }}>Eligibility upfront</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Our matching system checks your profile against campaign criteria before you write an application. You immediately know if you qualify for the bounty.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.65rem" }}>Escrow Protected</span>
          <h3 style={{ fontSize: "1.15rem" }}>Guaranteed payout</h3>
          <p style={{ marginTop: "0.4rem", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
            Every bounty budget is deposited by the brand before launch. Once your reel goes live with the paid partnership tag and views are verified, payouts trigger automatically.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
