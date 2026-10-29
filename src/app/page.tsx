import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { HeroCup } from "@/components/motion/HeroCup";
import { Magnetic } from "@/components/motion/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { BountyCard } from "@/components/bounty/BountyCard";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) =>
    ["live", "shortlisted", "in_production", "tracking"].includes(c.status),
  );
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const fundedPaise = db.ledger.filter((l) => l.type === "funding").reduce((a, l) => a + l.amountPaise, 0);
  const stats = [
    { label: "Live bounties", value: String(live.length) },
    { label: "Creators", value: String(db.creators.length) },
    { label: "Brands", value: String(db.brands.length) },
    { label: "Funded", value: fundedPaise > 0 ? formatINR(fundedPaise) : "—" },
  ];
  const featured = live.slice(0, 3);

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
            <Magnetic>
              <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
                Start as a brand
              </Link>
            </Magnetic>
            <Link href="/signup?role=creator" className="btn btn-secondary" prefetch>
              Join as a creator
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.85rem" }}>
            Already on RedCup? <Link href="/login">Sign in</Link>
          </p>
          <dl className="hero-stats">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="muted">{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-visual" aria-label="Stylised RedCup mark">
          <HeroCup />
          {featured[0] ? (
            <div className="hero-live-chip">
              <span className="chip chip-ok">Live</span>
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                {featured[0].title} · {formatINR(featured[0].budgetPaise)}
              </span>
            </div>
          ) : null}
        </div>
      </section>

      <Reveal>
        <p className="tagline-block">
          All the clarity of a brief.
          <br />
          None of the retainer fog.
        </p>
      </Reveal>

      <Reveal>
        <section className="band band-mint">
          <h2 style={{ marginBottom: "1.1rem" }}>How a bounty moves</h2>
          <div className="axis axis-4">
            {[
              ["01", "Fund", "Lock creator budget and platform fee. Campaign opens for applications."],
              ["02", "Apply", "Creators see Eligible / Almost / Not eligible before they spend a minute."],
              ["03", "Award", "Shortlist by Fit Score. Award slots — or auto-award if the window closes."],
              ["04", "Verify", "One draft revision. Live reel with paid label. Pay on verified views."],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={0.05 * i}>
                <div className="card card-lift" style={{ boxShadow: "none", height: "100%" }}>
                  <div className="step-num">{n}</div>
                  <h3>{t}</h3>
                  <p className="muted" style={{ marginTop: "0.4rem", fontSize: "0.9rem" }}>
                    {d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {featured.length > 0 ? (
        <Reveal>
          <section style={{ margin: "1.75rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: "1rem" }}>
              <h2>Open now</h2>
              <Link href="/bounties" className="muted" style={{ fontSize: "0.9rem", fontWeight: 600 }} prefetch>
                All bounties →
              </Link>
            </div>
            <div className="bounty-grid" style={{ marginTop: "0.9rem" }}>
              {featured.map((c) => (
                <BountyCard
                  key={c.id}
                  href={"/bounties/" + c.slug}
                  title={c.title}
                  brandName={brands.get(c.brandId)?.businessName}
                  status={c.status}
                  budgetPaise={c.budgetPaise}
                  slots={c.slots}
                />
              ))}
            </div>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <section className="split-panel">
          <div className="card card-lift">
            <p className="chip" style={{ marginBottom: "0.75rem" }}>
              Brands
            </p>
            <h2>Run a pay-for-results bounty</h2>
            <p className="muted" style={{ marginTop: "0.65rem" }}>
              KYC once, build criteria with a live eligible count, fund upfront, and pay against approved posts plus
              verified views. RedCup takes 15% (+ GST).
            </p>
            <Magnetic>
              <Link href="/for-brands" className="btn btn-primary" style={{ marginTop: "1.1rem" }} prefetch>
                See brand flow
              </Link>
            </Magnetic>
          </div>
          <div className="card card-lift">
            <p className="chip" style={{ marginBottom: "0.75rem" }}>
              Creators
            </p>
            <h2>Earn on approved reels</h2>
            <p className="muted" style={{ marginTop: "0.65rem" }}>
              Connect Instagram, finish PAN and UPI, apply only where you match, and get base plus capped performance
              for verified views.
            </p>
            <Link href="/for-creators" className="btn btn-secondary" style={{ marginTop: "1.1rem" }} prefetch>
              See creator flow
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="band band-ink">
          <h2 style={{ maxWidth: "22ch" }}>WhatsApp threads and spreadsheet claims, retired.</h2>
          <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "48ch" }}>
            Applications, drafts, awards, and view verification live in one place — so brands and creators share the
            same status, not three chat histories.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
            <Magnetic>
              <Link href="/bounties" className="btn btn-primary" prefetch>
                Browse open bounties
              </Link>
            </Magnetic>
            <Link
              href="/about"
              className="btn btn-ghost"
              style={{ color: "#fff", borderColor: "color-mix(in srgb, white 25%, transparent)" }}
              prefetch
            >
              About RedCup
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
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
      </Reveal>
    </MarketingShell>
  );
}
