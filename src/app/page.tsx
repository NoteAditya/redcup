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
    <MarketingShell night>
      <section className="chapter chapter-hero">
        <p className="chapter-kicker">Pay for results — not vanity reach</p>
        <h1 className="display-stack">
          <span className="display-line">Fund a reel</span>
          <span className="display-line display-accent">bounty.</span>
        </h1>
        <p className="lede night-lede">
          Brands lock a budget. Eligible creators apply. You award, review one draft, and pay for an approved live reel
          plus verified views.
        </p>
        <div className="hero-actions">
          <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
            Start as a brand
          </Link>
          <Link href="/signup?role=creator" className="btn btn-ghost-night" prefetch>
            Join as a creator
          </Link>
        </div>
        <p className="night-muted" style={{ marginTop: "0.85rem", fontSize: "0.95rem" }}>
          Already on RedCup? <Link href="/login">Sign in</Link>
        </p>
        <div className="hero-instrument">
          <CupFill />
        </div>
      </section>

      <Reveal>
        <section className="chapter chapter-split">
          <div>
            <p className="chapter-kicker">How it moves</p>
            <h2 className="display-stack display-stack-sm">
              <span className="display-line">The night starts</span>
              <span className="display-line">after funding.</span>
            </h2>
            <p className="night-lede" style={{ maxWidth: "42ch" }}>
              Applications, drafts, awards, and view verification live in one place — so brands and creators share the
              same status, not three chat histories.
            </p>
          </div>
          <ol className="chapter-steps">
            <li>
              <strong>Fund</strong>
              <span>Lock creator budget and platform fee. Campaign opens.</span>
            </li>
            <li>
              <strong>Award</strong>
              <span>Shortlist by Fit Score. Award slots — or auto-award.</span>
            </li>
            <li>
              <strong>Verify</strong>
              <span>One draft. Live reel with paid label. Pay on verified views.</span>
            </li>
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <section className="chapter chapter-figures" aria-label="Live platform figures">
          <p className="chapter-kicker">On the platform today</p>
          <div className="figure-rail">
            <div className="figure-block">
              <div className="figure">{live.length}</div>
              <div className="caption">Live bounties</div>
            </div>
            <div className="figure-block figure-block-hot">
              <div className="figure">{db.creators.length}</div>
              <div className="caption">Creators</div>
            </div>
            <div className="figure-block">
              <div className="figure">{db.brands.length}</div>
              <div className="caption">
                Brands{fundedPaise > 0 ? ` · ${formatINR(fundedPaise)} funded` : ""}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {featured.length > 0 ? (
        <Reveal>
          <section className="chapter chapter-collection" aria-label="Open bounties">
            <div className="chapter-collection-head">
              <p className="chapter-kicker">Collection</p>
              <h2 className="display-stack display-stack-sm">
                <span className="display-line">Open bounties</span>
                <span className="display-line display-accent">this week.</span>
              </h2>
            </div>
            <ul className="collection-list">
              {featured.map((c) => {
                const brand = brands.get(c.brandId)?.businessName || "Brand";
                let label = `${brand} — ${c.title}`;
                if (label.length > 42) label = label.slice(0, 40) + "…";
                return (
                  <li key={c.id}>
                    <Link href={"/bounties/" + c.slug} className="collection-row" prefetch>
                      <span className="collection-title">{label}</span>
                      <span className="collection-price">{formatINR(c.budgetPaise)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="collection-more">
              <Link href="/bounties" className="btn btn-primary" prefetch>
                All open bounties
              </Link>
            </p>
          </section>
        </Reveal>
      ) : null}

      <Reveal>
        <Showcase />
      </Reveal>

      <section className="chapter chapter-stills" aria-label="Production stills">
        <figure className="still still-tall">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/media/film-cans-downstairs-in-the-electric-cinema.jpg"
            alt="Film cans stacked in the Electric Cinema basement"
          />
        </figure>
        <figure className="still">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/a-female-technician-repairing-a-broken-film.jpg" alt="Technician repairing film" />
        </figure>
        <figure className="still still-wide">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/bridge-fog.jpg" alt="Bridge in fog" />
        </figure>
        <figure className="still">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/media/facade.jpg" alt="Building facade" />
        </figure>
      </section>

      <Reveal>
        <section className="chapter chapter-manifesto">
          <h2 className="display-stack display-stack-sm">
            <span className="display-line">Spreadsheet claims,</span>
            <span className="display-line display-accent">retired.</span>
          </h2>
          <p className="night-lede" style={{ maxWidth: "48ch" }}>
            Run a pay-for-results bounty or earn on approved reels — same status for both sides.
          </p>
          <div className="hero-actions">
            <Link href="/for-brands" className="btn btn-primary" prefetch>
              Brand flow
            </Link>
            <Link href="/for-creators" className="btn btn-ghost-night" prefetch>
              Creator flow
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="chapter chapter-faq" aria-label="Questions">
          <p className="chapter-kicker">Questions</p>
          <h2 className="display-stack display-stack-sm">
            <span className="display-line">What brands and</span>
            <span className="display-line">creators ask.</span>
          </h2>
          {[
            [
              "When does money move?",
              "Brands fund the creator budget and fee before a bounty goes live. Creators are paid after an approved live reel and verified views, within the campaign caps.",
            ],
            ["What does RedCup take?", "15% of the creator budget, plus GST. Shown clearly before you fund."],
            [
              "How are views verified?",
              "We read the Instagram Graph metrics on the approved permalink after the paid partnership label is present.",
            ],
            [
              "Can creators see eligibility before applying?",
              "Yes. Every open bounty shows Eligible, Almost, or Not eligible against the creator's profile.",
            ],
          ].map(([q, a]) => (
            <details key={q} className="night-details">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      </Reveal>

      <Reveal>
        <section className="chapter chapter-close">
          <h2 className="display-stack">
            <span className="display-line">Fund a reel.</span>
            <span className="display-line">
              Pay for <em className="display-blank">views</em>.
            </span>
          </h2>
          <div className="hero-actions">
            <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
              Start as a brand
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost-night" prefetch>
              Join as a creator
            </Link>
          </div>
        </section>
      </Reveal>
    </MarketingShell>
  );
}
