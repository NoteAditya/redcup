import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { BloomWorkbench } from "@/components/marketing/BloomWorkbench";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";
import { campaignApproval } from "@/server/access";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const live = db.campaigns.filter(
    (c) =>
      ["live", "shortlisted", "in_production", "tracking"].includes(c.status) &&
      campaignApproval(c) === "approved",
  );
  const brands = new Map(db.brands.map((b) => [b.id, b]));

  const featured = live
    .filter((c) => {
      const brand = brands.get(c.brandId)?.businessName || "";
      return !/\be2e\b/i.test(c.title) && !/\be2e\b/i.test(brand) && !/^test brand/i.test(brand);
    })
    .slice(0, 6);

  return (
    <MarketingShell fullWidth={true}>
      {/* Modern Minimal Hero Section with Dawn Atmosphere */}
      <section className="hero-stage">
        {/* Turn of the morning light background */}
        <img
          src="/media/hero-warm.jpg"
          alt="Atmospheric morning light"
          className="hero__photo"
          aria-hidden="true"
        />
        {/* Soft Warm Fog Scrim: ensures dark typography has crisp contrast */}
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero-stage-content">
          <div style={{ maxWidth: "600px" }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>What if every rupee bought real results?</span>
            </div>

            <h1 style={{ margin: "1.25rem 0 1.15rem", lineHeight: 1.05 }}>
              Brands get real content and real results.<br className="hidden sm:inline" /> Creators get paid fairly.
            </h1>

            <p className="lede" style={{ marginBottom: "2rem" }}>
              Brands fund a campaign and approve every reel. Creators get a fixed base per reel, and the rest is paid only for verified results like views and engagement. Unused budget goes back to the brand. Creators earn for every approved reel, and more as their content performs.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
              <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
                I&apos;m a brand: launch a campaign
              </Link>
              <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
                I&apos;m a creator: join free
              </Link>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>Budget held safely by Razorpay</span>
              </div>
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Views checked with Instagram&apos;s own data</span>
              </div>
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Creators paid by UPI</span>
              </div>
            </div>
          </div>

          {/* One card per audience (the calculator lives on /for-brands) */}
          <div style={{ display: "grid", gap: "1rem" }}>
            <div className="glass" style={{ padding: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>
              <span className="chip chip-ok" style={{ fontSize: "0.75rem" }}>For brands</span>
              <h3 style={{ marginTop: "0.65rem", fontSize: "1.25rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
                Pay mostly for real results
              </h3>
              <p style={{ margin: "0.4rem 0 0", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
                We shortlist, you pick and approve reels
              </p>
              <p style={{ margin: "0.85rem 0 0", paddingTop: "0.75rem", borderTop: "1px solid var(--line)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)" }}>
                Base per reel + pay for verified results
              </p>
            </div>
            <div className="glass" style={{ padding: "clamp(1.25rem, 2.5vw, 1.75rem)" }}>
              <span className="chip chip-cup" style={{ fontSize: "0.75rem" }}>For creators</span>
              <h3 style={{ marginTop: "0.65rem", fontSize: "1.25rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
                Get paid for your content
              </h3>
              <p style={{ margin: "0.4rem 0 0", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.55 }}>
                Free profile with your verified stats
              </p>
              <p style={{ margin: "0.85rem 0 0", paddingTop: "0.75rem", borderTop: "1px solid var(--line)", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)" }}>
                Fixed pay per reel + more as it performs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections wrapped in shell-container */}
      <div className="shell-container">
        {/* Squarespace Editorial Feature Spotlight 1: Zero-Risk Capital Protection */}
        <section className="editorial-spread">
          <div>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>01 / Your money is safe</span>
            </div>
            <h2 style={{ marginBottom: "1.15rem" }}>
              Your budget stays safe until the work is real.
            </h2>
            <p className="lede">
              Most creator deals mean paying big fees upfront and hoping. With RedCup, your budget is held by our payment partner, Razorpay, and creators are paid only for reels you approved and views Instagram verifies.
            </p>

            <div className="checklist">
              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Funded before work starts</strong>
                  <span>Creators start knowing the money is ready.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Fair payouts</strong>
                  <span>A fixed base after the reel stays live for 7 days, plus pay for every 1,000 verified views.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Unused budget comes back</strong>
                  <span>Anything creators don&apos;t earn is refunded to you.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Example campaign breakdown (sample, not a live account) */}
          <div className="editorial-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                  Example campaign
                </span>
                <div style={{ fontWeight: 600, fontSize: "1.0625rem", color: "var(--ink)", marginTop: "0.15rem" }}>
                  Where ₹58,850 goes
                </div>
              </div>
              <span className="chip chip-ok" style={{ fontSize: "0.75rem" }}>
                Example
              </span>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ background: "var(--paper-subtle)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Budget held by Razorpay</span>
                  <strong style={{ fontSize: "1.125rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹58,850</strong>
                </div>
                <span className="chip chip-cup" style={{ fontSize: "0.6875rem" }}>Pre-funded</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Creator bases (5 reels)</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹25,000</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--ok)", fontWeight: 600 }}>Paid after 7 days live</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Views pay</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹25,000</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--wine)", fontWeight: 600 }}>₹40 per 1,000 verified views, up to a cap</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Platform fee 15%</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹7,500</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>+ GST ₹1,350</span>
              </div>
            </div>
          </div>
        </section>

        {/* Squarespace Editorial Feature Spotlight 2: Real results only */}
        <section className="editorial-spread">
          {/* Example reel (sample, not live data) */}
          <div className="editorial-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                  Example reel
                </span>
                <div style={{ fontWeight: 600, fontSize: "1.0625rem", color: "var(--ink)", marginTop: "0.15rem" }}>
                  Paid Partnership ✓
                </div>
              </div>
              <span className="chip chip-ok" style={{ fontSize: "0.75rem" }}>
                Example
              </span>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Example reel</span>
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                  instagram.com/reel/DC91mF2p...
                </div>
              </div>

              <div style={{ background: "var(--paper-subtle)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Verified views</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="serif-moment" style={{ fontSize: "1.75rem", color: "var(--ink)" }}>
                    28,450
                  </span>
                </div>
              </div>

              <div style={{ background: "var(--ok-bg)", border: "1px solid var(--ok-border)", padding: "0.85rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.875rem", color: "var(--ink)", fontWeight: 600 }}>Creator earns</span>
                </div>
                <strong style={{ fontSize: "1rem", fontFamily: "var(--font-mono)", color: "var(--ok)" }}>₹1,838</strong>
              </div>
            </div>
          </div>

          <div>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>02 / Real results only</span>
            </div>
            <h2 style={{ marginBottom: "1.15rem" }}>
              Views checked with Instagram&apos;s own data. No screenshots, no guesswork.
            </h2>
            <p className="lede">
              No more chasing creators for screenshots. RedCup reads each reel&apos;s views from Instagram and removes anything suspicious before anyone is paid.
            </p>

            <div className="checklist">
              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Checked views</strong>
                  <span>Suspicious spikes are removed before payment.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Paid Partnership label</strong>
                  <span>On every reel, as ASCI requires.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Creators paid by UPI</strong>
                  <span>About a week after posting.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hallmark Bloom Working Workbench */}
        <section id="how-it-works" style={{ margin: "var(--section-gap) 0", scrollMarginTop: "6rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>How a campaign works</span>
            </div>
            <h2>From brief to verified results in about 3 weeks</h2>
            <p className="lede" style={{ marginTop: "0.5rem" }}>
              Follow the workflow below. Press the tactile button or select any milestone to inspect how each check executes.
            </p>
          </div>

          <BloomWorkbench />
        </section>

        {/* Two-Sided Capability Matrix */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>Tailored For Both Sides</span>
            </div>
            <h2>Built for both sides</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.75rem",
            }}
          >
            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <span className="pill-card" style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", backgroundColor: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-border)", fontWeight: 600 }}>
                    For Brands
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>
                    Zero Retainer Waste
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.75rem" }}>
                  No paying for nothing. A fixed base per approved reel, then the rest only for verified results.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                  Add your budget once. We shortlist creators who fit, you approve the reel, and you pay mostly for verified views.
                </p>

                <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.65rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Budget</span>
                    <span style={{ fontWeight: 600 }}>Held by Razorpay</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Creators</span>
                    <span style={{ fontWeight: 600 }}>Best-fit shortlist, you choose</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Approval</span>
                    <span style={{ fontWeight: 600 }}>You approve every reel</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href="/for-brands" className="btn btn-ghost" style={{ width: "100%" }}>
                  How it works for brands
                </Link>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <span className="pill-card" style={{ fontSize: "0.75rem", padding: "0.25rem 0.75rem", backgroundColor: "var(--color-paper-2)", color: "var(--color-accent)", border: "1px solid var(--color-rule)", fontWeight: 600 }}>
                    For Creators
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>
                    Direct UPI Deposits
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.75rem" }}>
                  See if you qualify before you apply. Get paid by UPI.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                  Link your Instagram account to see whether you qualify before applying. Earn a fixed amount for every approved reel, plus more for every 1,000 verified views.
                </p>

                <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.65rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Application Pre-check</span>
                    <span style={{ fontWeight: 600 }}>Instant Eligibility Tag</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Payout</span>
                    <span style={{ fontWeight: 600 }}>UPI, about a week after posting</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Invoices</span>
                    <span style={{ fontWeight: 600 }}>None to chase</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href="/for-creators" className="btn btn-primary" style={{ width: "100%" }}>
                  How it works for creators
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Open Campaigns Gallery */}
        {featured.length > 0 && (
          <section style={{ margin: "var(--section-gap) 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "2rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div className="kicker">
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
                  <span>Marketplace Opportunities</span>
                </div>
                <h2>Active campaigns accepting applications</h2>
              </div>
              <Link href="/bounties" className="btn btn-ghost btn-compact">
                View all campaigns
              </Link>
            </div>

            <div className="bounty-grid">
              {featured.map((c) => {
                const brand = brands.get(c.brandId)?.businessName || "Brand";
                return (
                  <Link
                    key={c.id}
                    href={"/bounties/" + c.slug}
                    className="bounty-card"
                    prefetch
                  >
                    <div className="bounty-card-top">
                      <div>
                        <div className="bounty-card-title">{c.title}</div>
                        <div className="bounty-card-sub">{brand}</div>
                      </div>
                      <span className="chip chip-ok">{c.status}</span>
                    </div>

                    <div className="bounty-card-foot">
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", display: "block" }}>
                          Campaign Budget
                        </span>
                        <div className="bounty-card-budget serif-moment">
                          {formatINR(c.budgetPaise)}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", fontWeight: 500 }}>
                        {c.slots} slots open
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Precision FAQ — Squarespace Minimalist Accordion */}
        <section
          style={{
            margin: "var(--section-gap) 0",
            maxWidth: "860px",
            marginInline: "auto",
          }}
        >
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>Questions &amp; Answers</span>
            </div>
            <h2>Questions brands and creators ask</h2>
            <p className="lede" style={{ marginTop: "0.5rem" }}>
              Straight answers on payments, views and payouts.
            </p>
          </div>

          <div className="faq-list">
            {[
              {
                q: "When does campaign money move?",
                a: "Brands pay the creator budget and platform fee upfront, held safely by our payment partner, Razorpay. Creators get a fixed base once the approved reel has been live for 7 days, plus more for every 1,000 verified views, paid by UPI about a week after posting.",
              },
              {
                q: "What is RedCup's platform fee?",
                a: "RedCup charges a transparent 15% platform fee (+ GST) on funded creator budgets. There are no monthly retainer fees or hidden listing costs. RedCup keeps 10% of each creator payout. Joining is free.",
              },
              {
                q: "How are Instagram reel views verified?",
                a: "RedCup reads each reel's views from Instagram once it is live with the Paid Partnership label, and removes anything suspicious before anyone is paid.",
              },
              {
                q: "Can creators check eligibility before applying?",
                a: "Yes. Every open campaign displays your status (Eligible, Almost, or Not Eligible) based on audience and creator criteria so creators never waste time writing applications for mismatched campaigns.",
              },
              {
                q: "What happens if a creator fails to deliver on time?",
                a: "If an awarded creator does not submit a draft within the agreed window, the slot can be reassigned or the unused budget comes back to the brand, as set out in our Refund and Cancellation Policy.",
              },
            ].map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>
                  <span>{faq.q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </summary>
                <div className="faq-body">
                  <p style={{ margin: 0 }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final Statement Call-to-Action (Squarespace Clean Closing Section) */}
        <section
          style={{
            backgroundColor: "var(--color-paper-2)",
            border: "1px solid var(--color-rule)",
            borderRadius: "var(--radius-card)",
            padding: "clamp(3.5rem, 6vw, 5.5rem) clamp(1.5rem, 5vw, 4rem)",
            textAlign: "center",
            margin: "var(--section-gap) 0 2rem",
            boxShadow: "var(--shadow-card)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="kicker" style={{ justifyContent: "center" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--cta)" }} />
            <span>Ready to Get Started</span>
          </div>

          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", maxWidth: "20ch", margin: "0.5rem auto 1rem" }}>
            Ready to try creator marketing that pays off?
          </h2>

          <p
            style={{
              maxWidth: "52ch",
              margin: "0 auto 2.25rem",
              color: "var(--color-ink-2)",
              fontSize: "1.0625rem",
              lineHeight: 1.65,
            }}
          >
            Brands: launch your first campaign. Creators: join free and get notified when you qualify.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.85rem",
            }}
          >
            <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
              Create Brand Account
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
              Join as Creator
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginTop: "2.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--line)",
              fontSize: "0.8125rem",
              color: "var(--muted)",
            }}
          >
            <span>Budget held by Razorpay</span>
            <span>•</span>
            <span>Views checked with Instagram data</span>
            <span>•</span>
            <span>Creators paid by UPI</span>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
