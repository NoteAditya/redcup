import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CupFill } from "@/components/marketing/CupFill";
import { Showcase } from "@/components/marketing/Showcase";
import { Reveal } from "@/components/motion/Reveal";
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
    <MarketingShell>
      <section className="hero-stage">
        <div className="hero-copy">
          <h1>Fund a reel bounty.</h1>
          <p className="lede">
            Pay for results — not vanity reach. Brands lock a budget. Eligible creators apply. You award, review one draft, and pay for an approved live reel plus verified views.
          </p>
          <div className="hero-actions">
            <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
              Start as a brand
            </Link>
            <Link href="/signup?role=creator" className="btn btn-secondary" prefetch>
              Join as a creator
            </Link>
          </div>
          <p className="muted" style={{ marginTop: "0.85rem", fontSize: "0.95rem" }}>
            Already on RedCup? <Link href="/login">Sign in</Link>
          </p>
        </div>
        <CupFill />
      </section>

      <Reveal><section className="how-band">
        <div className="how-band-head">
          <h2>How a bounty moves</h2>
          <p>
            Applications, drafts, awards, and view verification live in one place — so brands and creators share the
            same status, not three chat histories.
          </p>
        </div>
        <svg className="how-diagram" viewBox="0 0 720 120" role="img" aria-label="Many applications become one awarded reel">
          <circle cx="40" cy="60" r="10" fill="#C23B3B" />
          <circle cx="90" cy="36" r="8" fill="#9B2D3A" />
          <circle cx="90" cy="84" r="8" fill="#8E2F3C" />
          <circle cx="140" cy="24" r="7" fill="#6E1F2A" />
          <circle cx="140" cy="60" r="9" fill="#C23B3B" />
          <circle cx="140" cy="96" r="7" fill="#9B2D3A" />
          <circle cx="200" cy="40" r="8" fill="#8E2F3C" />
          <circle cx="200" cy="80" r="8" fill="#C23B3B" />
          <circle cx="260" cy="60" r="11" fill="#9B2D3A" />
          <path d="M290 60 H380" stroke="#E0D5D3" strokeWidth="2" />
          <circle cx="420" cy="60" r="28" fill="#1A1214" />
          <circle cx="420" cy="60" r="14" fill="#C23B3B" />
          <path d="M460 60 H540" stroke="#E0D5D3" strokeWidth="2" />
          <circle cx="600" cy="60" r="36" fill="#9B2D3A" />
          <circle cx="600" cy="60" r="18" fill="#F7F2F1" />
          <circle cx="600" cy="60" r="8" fill="#C23B3B" />
        </svg>
        <div className="how-cols">
          <div>
            <h3>Fund</h3>
            <p>Lock creator budget and platform fee. Campaign opens for applications.</p>
          </div>
          <div>
            <h3>Award</h3>
            <p>Shortlist by Fit Score. Award slots — or auto-award if the window closes.</p>
          </div>
          <div>
            <h3>Verify</h3>
            <p>One draft revision. Live reel with paid label. Pay on verified views.</p>
          </div>
        </div>
      </section></Reveal>

      <Reveal><section className="stats-step" aria-label="Live platform figures">
        <h2>On the platform today</h2>
        <div className="stat-tile">
          <div className="figure">{live.length}</div>
          <div className="caption">Live bounties</div>
        </div>
        <div className="stat-tile">
          <div className="figure">{db.creators.length}</div>
          <div className="caption">Creators</div>
        </div>
        <div className="stat-tile">
          <div className="figure">{db.brands.length}</div>
          <div className="caption">Brands{fundedPaise > 0 ? ` · ${formatINR(fundedPaise)} funded` : ""}</div>
        </div>
      </section></Reveal>

      {featured.length > 0 ? (
        <Reveal><section className="poster-list" aria-label="Open bounties">
          {featured.map((c) => {
            const brand = brands.get(c.brandId)?.businessName || "Brand";
            let label = `${brand} — ${c.title}`;
            if (label.length > 36) label = label.slice(0, 34) + "…";
            return (
              <Link key={c.id} href={"/bounties/" + c.slug} className="poster-row" prefetch>
                <span className="poster-title">{label}</span>
                <span className="poster-price" aria-label="Budget">{formatINR(c.budgetPaise)}</span>
              </Link>
            );
          })}
          <p className="poster-list-more">
            <Link href="/bounties" className="btn btn-primary" prefetch>
              All open bounties
            </Link>
          </p>
        </section></Reveal>
      ) : null}

      <Reveal><Showcase /></Reveal>

      <section className="media-band" aria-label="Production stills">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/film-cans-downstairs-in-the-electric-cinema.jpg"
            alt="Film cans stacked in the Electric Cinema basement"
          />
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/a-female-technician-repairing-a-broken-film.jpg" alt="Technician repairing film" />
        </figure>
      </section>

      <section className="media-band" aria-label="Atmosphere" style={{ gridTemplateColumns: "0.9fr 1.1fr" }}>
        <figure style={{ clipPath: "circle(72% at 60% 45%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/bridge-fog.jpg" alt="Bridge in fog" />
        </figure>
        <figure style={{ clipPath: "circle(75% at 35% 55%)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/facade.jpg" alt="Building facade" />
        </figure>
      </section>

      <section className="band band-ink band-split">
        <div>
          <h2 style={{ maxWidth: "14ch" }}>Spreadsheet claims, retired.</h2>
          <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "48ch", fontSize: "1.05rem" }}>
            Run a pay-for-results bounty or earn on approved reels — same status for both sides.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
            <Link href="/for-brands" className="btn btn-primary" prefetch>
              Brand flow
            </Link>
            <Link href="/for-creators" className="btn btn-ghost" prefetch>
              Creator flow
            </Link>
          </div>
        </div>
        <figure className="band-split-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/film-cans-downstairs-in-the-electric-cinema-2.jpg" alt="Rows of film cans" />
        </figure>
      </section>

      <Reveal><section className="faq-stack" aria-label="Questions">
        <h2 style={{ marginBottom: "0.5rem" }}>Questions brands and creators ask</h2>
        {[
          [
            "When does money move?",
            "Brands fund the creator budget and fee before a bounty goes live. Creators are paid after an approved live reel and verified views, within the campaign caps.",
          ],
          [
            "What does RedCup take?",
            "15% of the creator budget, plus GST. Shown clearly before you fund.",
          ],
          [
            "How are views verified?",
            "We read the Instagram Graph metrics on the approved permalink after the paid partnership label is present.",
          ],
          [
            "Can creators see eligibility before applying?",
            "Yes. Every open bounty shows Eligible, Almost, or Not eligible against the creator's profile.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section></Reveal>

      <Reveal><section className="cta-blank">
        <div>
          Fund a reel. Pay for{" "}
          <span style={{ display: "inline-block", minWidth: "4.5ch", borderBottom: "3px solid var(--cta)" }}>
            &nbsp;
          </span>
          .
        </div>
        <div className="cta-blank-actions">
          <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
            Start as a brand
          </Link>
          <Link href="/signup?role=creator" className="btn btn-secondary" prefetch>
            Join as a creator
          </Link>
        </div>
        <p className="cta-blank-note">verified views</p>
      </section></Reveal>
    </MarketingShell>
  );
}
