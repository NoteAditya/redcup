import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CupFill } from "@/components/marketing/CupFill";
import { BloomWorkbench } from "@/components/marketing/BloomWorkbench";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) =>
    ["live", "shortlisted", "in_production", "tracking"].includes(c.status),
  );
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const fundedPaise = db.ledger
    .filter((l) => l.type === "funding")
    .reduce((a, l) => a + l.amountPaise, 0);

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
              <span>The Creator Escrow &amp; Verified Settlement Protocol</span>
            </div>

            <h1 style={{ margin: "1.25rem 0 1.15rem", lineHeight: 1.05 }}>
              Fund creator reels.<br className="hidden sm:inline" /> Pay on verified views.
            </h1>

            <p className="lede" style={{ marginBottom: "2rem" }}>
              Deposit campaign budgets into escrow, match creators by audience fit, and pay only when reels hit verified views.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", alignItems: "center" }}>
              <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
                Start as a Brand
              </Link>
              <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
                Join as a Creator
              </Link>
            </div>

            {/* Micro Trust Row */}
            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <span>100% Escrow Funded Upfront</span>
              </div>
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Official Meta Graph API</span>
              </div>
              <div className="hero-trust-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                <span>Instant UPI Settlements</span>
              </div>
            </div>
          </div>

          {/* Frosted Glass Budget Simulator */}
          <div>
            <CupFill />
          </div>
        </div>
      </section>

      {/* Main Content Sections wrapped in shell-container */}
      <div className="shell-container">
        {/* Architectural 4-Metric Proof Band (Squarespace Editorial Metric Ledger) */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div className="ledger-grid">
            <div className="ledger-cell">
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", fontWeight: 600 }}>
                Live Bounties
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                  color: "var(--color-ink)",
                  margin: "0.5rem 0",
                  lineHeight: 1,
                }}
              >
                {live.length}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Open campaigns accepting creator pitches
              </span>
            </div>

            <div className="ledger-cell">
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", fontWeight: 600 }}>
                Active Creators
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                  color: "var(--color-ink)",
                  margin: "0.5rem 0",
                  lineHeight: 1,
                }}
              >
                {db.creators.length}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Verified Instagram creator accounts
              </span>
            </div>

            <div className="ledger-cell">
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", fontWeight: 600 }}>
                Total Escrow Secured
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                  color: "var(--color-accent)",
                  margin: "0.5rem 0",
                  lineHeight: 1,
                }}
              >
                {fundedPaise > 0 ? formatINR(fundedPaise) : "₹50,000+"}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Locked in escrow and settled via protocol
              </span>
            </div>

            <div className="ledger-cell" style={{ borderRight: "none" }}>
              <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-muted)", fontWeight: 600 }}>
                Invoicing Delay
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.25rem)",
                  color: "var(--ok)",
                  margin: "0.5rem 0",
                  lineHeight: 1,
                }}
              >
                0 Days
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Automated direct UPI milestone payouts
              </span>
            </div>
          </div>
        </section>

        {/* Squarespace Editorial Feature Spotlight 1: Zero-Risk Capital Protection */}
        <section className="editorial-spread">
          <div>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>01 / Capital Protection</span>
            </div>
            <h2 style={{ marginBottom: "1.15rem" }}>
              Deposit once. Release funds only after verified views land.
            </h2>
            <p className="lede">
              Traditional influencer contracts require upfront retainers or leave creators unpaid for months. RedCup holds 100% of the campaign budget in an RBI-compliant escrow account before any script is filmed.
            </p>

            <div className="checklist">
              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>100% Escrow Funded Upfront</strong>
                  <span>Creators begin production knowing payouts are already secured in an RBI-compliant vault.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Milestone-Triggered Payouts</strong>
                  <span>Base fee releases when the reel goes live; bonus tiers disburse as real views accumulate.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Automated Refund SLA</strong>
                  <span>Unclaimed creator slots or unreached performance milestones return automatically to your account.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Simulation of Escrow Vault */}
          <div className="editorial-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                  Vault #ESC-4092
                </span>
                <div style={{ fontWeight: 600, fontSize: "1.0625rem", color: "var(--ink)", marginTop: "0.15rem" }}>
                  Escrow Contract Overview
                </div>
              </div>
              <span className="chip chip-ok" style={{ fontSize: "0.75rem" }}>
                Locked &amp; Verified
              </span>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ background: "var(--paper-subtle)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Brand Escrow Deposit</span>
                  <strong style={{ fontSize: "1.125rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹57,500</strong>
                </div>
                <span className="chip chip-cup" style={{ fontSize: "0.6875rem" }}>Pre-funded</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Base Fee Milestone (Reel Live)</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹25,000</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--ok)", fontWeight: 600 }}>Ready on Live Post</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Performance Pool (Views Tiers)</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹25,000</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--wine)", fontWeight: 600 }}>Tiers: 10K / 25K Views</span>
              </div>

              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "0.9rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>Platform Service Fee (15% + GST)</span>
                  <strong style={{ fontSize: "0.9375rem", fontFamily: "var(--font-mono)", color: "var(--ink)" }}>₹7,500</strong>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 500 }}>No Recurring Retainers</span>
              </div>
            </div>
          </div>
        </section>

        {/* Squarespace Editorial Feature Spotlight 2: Official Meta Graph API Verification */}
        <section className="editorial-spread">
          {/* Visual Simulation of Instagram Graph API Verification */}
          <div className="editorial-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "1rem", borderBottom: "1px solid var(--line)" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase" }}>
                  Meta Graph API /v21.0
                </span>
                <div style={{ fontWeight: 600, fontSize: "1.0625rem", color: "var(--ink)", marginTop: "0.15rem" }}>
                  Live Webhook Telemetry
                </div>
              </div>
              <span className="chip chip-ok" style={{ fontSize: "0.75rem" }}>
                Active Webhook
              </span>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ background: "var(--sheet)", border: "1px solid var(--line)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Instagram Reel Target</span>
                  <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--wine)", fontWeight: 600 }}>#paidpartnership Confirmed</span>
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)", fontFamily: "var(--font-mono)" }}>
                  instagram.com/reel/DC91mF2p...
                </div>
              </div>

              <div style={{ background: "var(--paper-subtle)", padding: "1rem 1.15rem", borderRadius: "var(--radius-inner)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Verified Organic Views</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--ok)", fontWeight: 600 }}>Milestone 2 Reached</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span className="serif-moment" style={{ fontSize: "1.75rem", color: "var(--ink)" }}>
                    28,450
                  </span>
                  <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>
                    Target: 25,000 Views
                  </span>
                </div>
                <div style={{ marginTop: "0.5rem", height: "6px", background: "var(--line)", borderRadius: "var(--radius-pill)", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: "100%", background: "var(--ok)" }} />
                </div>
              </div>

              <div style={{ background: "var(--ok-bg)", border: "1px solid var(--ok-border)", padding: "0.85rem 1.15rem", borderRadius: "var(--radius-inner)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--ok)", fontWeight: 600, display: "block" }}>Settlement Trigger</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--ink)", fontWeight: 600 }}>Instant UPI Transfer to Creator</span>
                </div>
                <strong style={{ fontSize: "1rem", fontFamily: "var(--font-mono)", color: "var(--ok)" }}>₹8,500</strong>
              </div>
            </div>
          </div>

          <div>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>02 / Real-Time Verification</span>
            </div>
            <h2 style={{ marginBottom: "1.15rem" }}>
              Official Instagram Graph API. No screenshots, no guesswork.
            </h2>
            <p className="lede">
              Forget asking creators for unverified analytics screenshots or waiting for end-of-month spreadsheets. RedCup connects directly to Instagram's official Graph API via verified paid partnership tags.
            </p>

            <div className="checklist">
              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Direct Meta API Integration</strong>
                  <span>Views are read authenticated straight from Meta's servers, filtering out fake engagement spikes.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Automated Tag Compliance</strong>
                  <span>Tracking starts only once Instagram verifies the sponsor tag, protecting ASCI brand guidelines.</span>
                </div>
              </div>

              <div className="checklist-item">
                <div className="checklist-icon">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <strong style={{ color: "var(--ink)", display: "block" }}>Direct UPI Milestone Transfers</strong>
                  <span>Every time a reel crosses a view threshold, payout transfers directly to the creator without manual invoices.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hallmark Bloom Working Workbench */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div style={{ marginBottom: "2rem" }}>
            <div className="kicker">
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--wine)" }} />
              <span>Interactive Protocol Workbench</span>
            </div>
            <h2>Track every rupee from deposit to verified payout</h2>
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
            <h2>Precision workflows for brands and creators</h2>
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
                  Zero retainer lock-in. Pay per verified view.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                  Deposit your budget into escrow once. Fit Score matches creators who actually reach your audience. Review a single draft, and release payment only after verified views come in.
                </p>

                <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.65rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Escrow Protection</span>
                    <span style={{ fontWeight: 600 }}>100% Pre-funded</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Shortlisting</span>
                    <span style={{ fontWeight: 600 }}>Fit Score Algorithm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Draft Turnaround</span>
                    <span style={{ fontWeight: 600 }}>Max 1 Revision Round</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href="/for-brands" className="btn btn-ghost" style={{ width: "100%" }}>
                  Read Brand Documentation
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
                  Know eligibility upfront. Guaranteed payouts.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
                  Link your Instagram account to see whether you qualify before applying. Get your base fee as soon as the reel goes live, then earn bonuses as views hit each milestone.
                </p>

                <div style={{ marginTop: "1.5rem", display: "grid", gap: "0.65rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Application Pre-check</span>
                    <span style={{ fontWeight: 600 }}>Instant Eligibility Tag</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Payout Method</span>
                    <span style={{ fontWeight: 600 }}>Instant UPI Transfer</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Invoicing Delays</span>
                    <span style={{ fontWeight: 600 }}>0 Days</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <Link href="/for-creators" className="btn btn-primary" style={{ width: "100%" }}>
                  Read Creator Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Open Bounties Gallery */}
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
                View all bounties
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
            <h2>Platform mechanics and policies</h2>
            <p className="lede" style={{ marginTop: "0.5rem" }}>
              Straightforward answers about our escrow security, view verification, and payout timelines.
            </p>
          </div>

          <div className="faq-list">
            {[
              {
                q: "When does campaign money move?",
                a: "Brands deposit creator budget and platform fee upfront into secure escrow. Creators receive their base payment immediately upon approved live reel with paid tag, followed by performance bonuses on verified views.",
              },
              {
                q: "What is RedCup's platform fee?",
                a: "RedCup charges a transparent 15% platform fee (+ GST) on funded creator budgets. There are no monthly retainer fees, hidden listing costs, or creator deduction cuts.",
              },
              {
                q: "How are Instagram reel views verified?",
                a: "We query the official Instagram Graph API directly using the approved permalink once the paid partnership tag is confirmed. Bot views and unauthenticated counts are filtered automatically.",
              },
              {
                q: "Can creators check eligibility before applying?",
                a: "Yes. Every open bounty displays your status (Eligible, Almost, or Not Eligible) based on audience and creator criteria so creators never waste time writing applications for mismatched campaigns.",
              },
              {
                q: "What happens if a creator fails to deliver on time?",
                a: "If an awarded creator does not submit a draft within the agreed window, the slot can be reassigned or the locked funds return directly to the brand's escrow balance according to our SLA.",
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
            Fund creator reels. Pay for verified views.
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
            Run performance campaigns with guaranteed escrow, verified views, and instant UPI payouts.
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
            <span>RBI-Compliant Escrow Account</span>
            <span>•</span>
            <span>Official Instagram Graph API</span>
            <span>•</span>
            <span>Direct UPI Bank Settlement</span>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
