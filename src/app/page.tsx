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
      {/* Modern Minimal Hero Section with Dawn Landscape Atmosphere */}
      <section className="hero-stage">
        {/* Real Landscape at the Turn of the Morning Light */}
        <img
          src="/media/hero-warm.jpg"
          alt="Atmospheric dawn landscape"
          className="hero__photo"
          aria-hidden="true"
        />
        {/* Soft Warm Fog Scrim: ensures dark typography has crisp contrast */}
        <div className="hero__scrim" aria-hidden="true" />

        <div className="hero-stage-content">
          <div className="hero-stage-text" style={{ maxWidth: "560px" }}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>The Creator Escrow &amp; Verified Settlement Protocol</span>
            </div>

            <h1 style={{ margin: "1.15rem 0" }}>
              Fund creator reels. Pay on verified views.
            </h1>

            <p className="lede" style={{ marginBottom: "1.75rem" }}>
              Deposit campaign budgets into escrow, match creators by audience fit, and pay only when reels hit verified views.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
              <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
                Start as a Brand
              </Link>
              <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
                Join as a Creator
              </Link>
            </div>

            <p style={{ marginTop: "1rem", fontSize: "0.8125rem", color: "var(--muted)" }}>
              Already on RedCup?{" "}
              <Link href="/login" style={{ color: "var(--wine)", fontWeight: 600 }}>
                Sign In
              </Link>
            </p>
          </div>

          {/* Frosted Glass Budget Simulator on the Right */}
          <div>
            <CupFill />
          </div>
        </div>
      </section>

      {/* Main Content Sections wrapped in shell-container */}
      <div className="shell-container">
        {/* Real Data Platform Ledger with Gambarino Figures */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div className="ledger-grid">
            <div className="ledger-cell">
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", fontWeight: 600 }}>
                Live Bounties
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "2.75rem",
                  color: "var(--color-ink)",
                  margin: "0.4rem 0",
                  lineHeight: 1,
                }}
              >
                {live.length}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Open campaigns accepting applications
              </span>
            </div>

            <div className="ledger-cell">
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", fontWeight: 600 }}>
                Active Creators
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "2.75rem",
                  color: "var(--color-ink)",
                  margin: "0.4rem 0",
                  lineHeight: 1,
                }}
              >
                {db.creators.length}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Connected Instagram creator accounts
              </span>
            </div>

            <div className="ledger-cell" style={{ borderRight: "none" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)", fontWeight: 600 }}>
                Total Escrow Funded
              </span>
              <div
                className="serif-moment"
                style={{
                  fontSize: "2.75rem",
                  color: "var(--color-accent)",
                  margin: "0.4rem 0",
                  lineHeight: 1,
                }}
              >
                {fundedPaise > 0 ? formatINR(fundedPaise) : "₹50,000+"}
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                Locked in escrow and disbursed to creators
              </span>
            </div>
          </div>
        </section>

        {/* Hallmark Bloom Atmospheric Working Sheet Graphic */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h2>Track every rupee from deposit to verified payout</h2>
            <p className="lede" style={{ marginTop: "0.35rem", fontSize: "1rem" }}>
              Follow the workflow below. Tap the button or select a milestone to see how each check works.
            </p>
          </div>

          <BloomWorkbench />
        </section>

        {/* Two-Sided Architecture Matrix */}
        <section style={{ margin: "var(--section-gap) 0" }}>
          <div style={{ marginBottom: "1.75rem" }}>
            <h2>Precision workflows for both sides</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span className="pill-card" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem", backgroundColor: "var(--ok-bg)", color: "var(--ok)", border: "1px solid var(--ok-border)" }}>
                    For Brands
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>
                    Zero Retainer Waste
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.65rem" }}>
                  Zero retainer lock-in. Pay per verified view.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Deposit your budget into escrow once. Fit Score matches creators who actually reach your audience. Review a single draft, and release payment only after verified views come in.
                </p>

                <div style={{ marginTop: "1.25rem", display: "grid", gap: "0.5rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Escrow Protection</span>
                    <span style={{ fontWeight: 600 }}>100% Pre-funded</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Shortlisting</span>
                    <span style={{ fontWeight: 600 }}>Fit Score Algorithm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Draft Turnaround</span>
                    <span style={{ fontWeight: 600 }}>Max 1 Revision</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/for-brands" className="btn btn-ghost" style={{ width: "100%" }}>
                  Read Brand Documentation
                </Link>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <span className="pill-card" style={{ fontSize: "0.75rem", padding: "0.2rem 0.65rem", backgroundColor: "var(--color-paper-2)", color: "var(--color-accent)", border: "1px solid var(--color-rule)" }}>
                    For Creators
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", fontWeight: 600 }}>
                    Direct UPI Deposits
                  </span>
                </div>
                <h3 style={{ fontSize: "1.35rem", marginBottom: "0.65rem" }}>
                  Know eligibility upfront. Guaranteed payouts.
                </h3>
                <p style={{ color: "var(--color-ink-2)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Link your Instagram account to see whether you qualify before applying. Get your base fee as soon as the reel goes live, then earn bonuses as views hit each milestone.
                </p>

                <div style={{ marginTop: "1.25rem", display: "grid", gap: "0.5rem", borderTop: "1px solid var(--color-rule)", paddingTop: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Application Pre-check</span>
                    <span style={{ fontWeight: 600 }}>Eligibility Tag</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Payout Method</span>
                    <span style={{ fontWeight: 600 }}>Instant UPI Transfer</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-muted)" }}>Invoicing Delays</span>
                    <span style={{ fontWeight: 600 }}>0 Days</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/for-creators" className="btn btn-primary" style={{ width: "100%" }}>
                  Read Creator Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Open Bounties Ledger */}
        {featured.length > 0 && (
          <section style={{ margin: "var(--section-gap) 0" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
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
                          Budget
                        </span>
                        <div className="bounty-card-budget serif-moment" style={{ fontSize: "1.35rem" }}>
                          {formatINR(c.budgetPaise)}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
                        {c.slots} slots
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Precision FAQ */}
        <section
          style={{
            margin: "var(--section-gap) 0",
            maxWidth: "800px",
            marginInline: "auto",
          }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <h2>Platform mechanics and policies</h2>
          </div>

          <div style={{ display: "grid", gap: "0.75rem" }}>
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
            ].map((faq) => (
              <details
                key={faq.q}
                style={{
                  backgroundColor: "var(--color-sheet)",
                  border: "1px solid var(--color-rule)",
                  borderRadius: "var(--radius-card)",
                  padding: "1.25rem",
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <summary
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--color-ink)",
                    listStyle: "none",
                  }}
                >
                  {faq.q}
                </summary>
                <p
                  style={{
                    margin: "0.75rem 0 0",
                    color: "var(--color-ink-2)",
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* Final Call-to-Action */}
        <section
          style={{
            backgroundColor: "var(--color-paper-2)",
            border: "1px solid var(--color-rule)",
            borderRadius: "var(--radius-card)",
            padding: "clamp(2.5rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)",
            textAlign: "center",
            margin: "var(--section-gap) 0 1rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
            Fund a reel. Pay for verified views.
          </h2>
          <p
            style={{
              maxWidth: "48ch",
              margin: "0.85rem auto 1.75rem",
              color: "var(--color-ink-2)",
              fontSize: "0.95rem",
            }}
          >
            Run performance campaigns with guaranteed escrow, verified views, and instant UPI payouts.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.65rem",
            }}
          >
            <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
              Create Brand Account
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
              Join as Creator
            </Link>
          </div>
        </section>
      </div>
    </MarketingShell>
  );
}
