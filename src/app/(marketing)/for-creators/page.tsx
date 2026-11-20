import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For Creators — Earn on Approved Reels" };

const STEPS = [
  {
    step: "Step 1",
    tag: "Instagram Auth",
    title: "Connect Instagram and add payout details",
    desc: "Your professional account, PAN and UPI.",
  },
  {
    step: "Step 2",
    tag: "Live Eligibility",
    title: "Check if you qualify",
    desc: "Every campaign shows Eligible, Almost or Not eligible before you apply.",
  },
  {
    step: "Step 3",
    tag: "Smart Matching",
    title: "Apply where you fit",
    desc: "No cold pitching. Brands pick creators within 48 hours.",
  },
  {
    step: "Step 4",
    tag: "Draft Feedback",
    title: "Send your draft",
    desc: "The brand approves it or asks for one change.",
  },
  {
    step: "Step 5",
    tag: "Direct UPI",
    title: "Post and get paid",
    desc: "Post with the Paid Partnership label. Your base is paid once the reel has been live for 7 days, plus more for every 1,000 verified views.",
  },
];

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "720px", margin: "clamp(1.5rem, 4vw, 3rem) 0 clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="kicker">
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
          <span>For creators</span>
        </div>
        <h1 style={{ marginBottom: "1.15rem", lineHeight: 1.08 }}>
          Get paid by brands for your reels.
        </h1>
        <p className="lede">
          Join free with your Instagram professional account. See which brand campaigns you qualify for, make a reel, and earn a fixed amount for every approved reel, plus more for every 1,000 verified views. Paid by UPI.
        </p>
        <div style={{ display: "flex", gap: "0.85rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/signup?role=creator" className="btn btn-primary">
            Join free
          </Link>
          <Link href="#how-you-get-paid" className="btn btn-ghost">
            See how payouts work
          </Link>
        </div>
        <p className="muted" style={{ marginTop: "1.25rem", fontSize: "0.9375rem", lineHeight: 1.6 }}>
          Example: base ₹1,000 + 50,000 verified views at ₹40 per 1,000 = ₹3,000; after RedCup&apos;s 10%, you get ₹2,700
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)" }}>
          RedCup keeps 10% of each payout. Joining is free.
        </p>
      </div>

      {/* 5-Step Ruled Ledger */}
      <section
        id="how-you-get-paid"
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
          <span className="chip chip-cup">How you get paid</span>
          <h2 style={{ fontSize: "1.35rem", marginTop: "0.5rem" }}>From sign-up to UPI payout</h2>
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

      {/* Creator Profiles */}
      <section className="card" style={{ margin: "var(--section-gap) 0", padding: "clamp(1.75rem, 4vw, 2.5rem)" }}>
        <h2 style={{ fontSize: "1.5rem" }}>Your RedCup profile, verified.</h2>
        <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65, maxWidth: "60ch" }}>
          One link with your best reels and verified stats. Put it in your bio and share it with any brand. No more screenshots.
        </p>
        <div style={{ marginTop: "1.25rem" }}>
          <Link href="/signup?role=creator" className="btn btn-primary">
            Create my free profile
          </Link>
        </div>
      </section>

      {/* Value Pillars */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip chip-ok" style={{ marginBottom: "0.85rem" }}>Zero Time Waste</span>
          <h3 style={{ fontSize: "1.25rem" }}>Eligibility upfront</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            Our matching system checks your profile against campaign criteria before you write an application. You immediately know if you qualify for the campaign.
          </p>
        </div>

        <div className="card">
          <span className="chip chip-cup" style={{ marginBottom: "0.85rem" }}>Pre-funded</span>
          <h3 style={{ fontSize: "1.25rem" }}>Money ready before you start</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            The brand funds every campaign before it opens, so your payment is waiting when your reel qualifies.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
