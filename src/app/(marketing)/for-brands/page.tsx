import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CupFill } from "@/components/marketing/CupFill";

export const metadata = { title: "For Brands — Performance Creator Campaigns" };

const STEPS = [
  {
    step: "Step 1",
    tag: "Business Verification",
    title: "Verify your business",
    desc: "Add your GSTIN and details. We check every brand to keep the marketplace safe.",
  },
  {
    step: "Step 2",
    tag: "Audience Filters",
    title: "Choose who you want",
    desc: "Pick a preset or set niche, city and follower range, and see how many creators match.",
  },
  {
    step: "Step 3",
    tag: "Pre-funded",
    title: "Fund your campaign",
    desc: "Creator budget + 15% fee + GST, held safely by Razorpay. It opens to creators once approved.",
  },
  {
    step: "Step 4",
    tag: "Fit Score Rank",
    title: "Pick your creators",
    desc: "We rank applicants by fit and past results, and you choose within 48 hours.",
  },
  {
    step: "Step 5",
    tag: "Instagram data",
    title: "Approve, post, track",
    desc: "You approve each draft (one revision). The reel goes live with the Paid Partnership label, and we verify its views for 7 days.",
  },
];

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "720px", margin: "clamp(1.5rem, 4vw, 3rem) 0 clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="kicker">
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
          <span>For brands</span>
        </div>
        <h1 style={{ marginBottom: "1.15rem", lineHeight: 1.08 }}>
          Get reels from creators who fit your brand. Pay mostly for real views.
        </h1>
        <p className="lede">
          Set your brief and budget. Only creators who match can apply, you pick the best fit, and you approve every reel. Your budget is held by Razorpay: creators get a fixed base per approved reel, and the rest is paid only for verified results, and unused budget comes back to you.
        </p>
        <div style={{ display: "flex", gap: "0.85rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/signup?role=brand" className="btn btn-primary">
            Launch your first campaign
          </Link>
          <Link href="#calculator" className="btn btn-ghost">
            See pricing
          </Link>
        </div>
      </div>

      {/* Campaign cost calculator (moved from the homepage) */}
      <section id="calculator" style={{ maxWidth: "560px", margin: "0 0 var(--section-gap)", scrollMarginTop: "6rem" }}>
        <CupFill />
      </section>

      {/* 5-Step Ruled Ledger */}
      <section
        id="how-it-works"
        style={{
          scrollMarginTop: "6rem",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          backgroundColor: "var(--sheet)",
          margin: "var(--section-gap) 0",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ padding: "1.75rem 2rem", borderBottom: "1px solid var(--line)", backgroundColor: "var(--paper-subtle)" }}>
          <span className="chip chip-cup">How it works</span>
          <h2 style={{ fontSize: "1.35rem", marginTop: "0.5rem" }}>From brief to verified results in about 3 weeks</h2>
        </div>

        <div>
          {STEPS.map((step, idx) => (
            <div
              key={step.step}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "1.75rem",
                padding: "1.75rem 2rem",
                borderBottom: idx < STEPS.length - 1 ? "1px solid var(--line)" : "none",
                alignItems: "start",
              }}
            >
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {step.step}
              </div>
              <div>
                <div style={{ display: "flex", gap: "0.65rem", alignItems: "center", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "1.125rem" }}>{step.title}</h3>
                  <span className="chip" style={{ fontSize: "0.6875rem" }}>{step.tag}</span>
                </div>
                <p style={{ margin: "0.45rem 0 0", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.85rem" }}>Clear costs</span>
          <h3 style={{ fontSize: "1.25rem" }}>No surprise fees</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            You see the full cost, including GST, before you pay. Unused budget comes back to you.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.85rem" }}>Smart shortlist</span>
          <h3 style={{ fontSize: "1.25rem" }}>Best-fit creators first</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            We rank creators by fit and past results. If you don&apos;t choose in 48 hours, we pick the top matches so your campaign isn&apos;t delayed.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
