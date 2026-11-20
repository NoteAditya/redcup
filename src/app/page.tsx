import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Building2, Check, CircleCheck, Clapperboard, Eye, FileText, IndianRupee, ShieldCheck, Users } from "lucide-react";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { ExampleReelPhone, ExampleTag, ProfilePhone, SectionReveal, StepsRow } from "@/components/marketing/Visuals";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";
import { campaignApproval } from "@/server/access";

export const dynamic = "force-dynamic";

const FAQS = [
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
            ];

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
      {/* Hero: centred headline + sub-line, two audience cards, two buttons, trust strip. No photo. */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="hero-inner">
          <span className="hero-badge">What if every rupee bought real results?</span>
          <h1 className="hero-title">
            <span>Brands get real content and real results.</span> <span>Creators get paid fairly.</span>
          </h1>
          <p className="hero-sub">
            Brands fund a campaign and approve every reel. Creators get a fixed base per reel, and the rest is paid only for verified results like views and engagement. Unused budget goes back to the brand. Creators earn for every approved reel, and more as their content performs.
          </p>

          <div className="hero-cards">
            <div className="hero-card">
              <span className="hero-card-label">
                <Building2 size={24} strokeWidth={1.75} aria-hidden="true" /> For brands
              </span>
              <h3>Pay mostly for real results</h3>
              <p>We shortlist, you pick and approve reels</p>
              <p className="hero-card-foot">Base per reel + pay for verified results</p>
            </div>
            <div className="hero-card">
              <span className="hero-card-label">
                <Clapperboard size={24} strokeWidth={1.75} aria-hidden="true" /> For creators
              </span>
              <h3>Get paid for your content</h3>
              <p>Free profile with your verified stats</p>
              <p className="hero-card-foot">Fixed pay per reel + more as it performs</p>
            </div>
          </div>

          <div className="hero-actions">
            <Link href="/signup?role=brand" className="btn btn-primary" prefetch>
              I&apos;m a brand: launch a campaign
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost" prefetch>
              I&apos;m a creator: join free
            </Link>
          </div>

          <ul className="trust-strip">
            <li>
              <ShieldCheck size={20} strokeWidth={1.75} aria-hidden="true" /> Budget held safely by Razorpay
            </li>
            <li>
              <Eye size={20} strokeWidth={1.75} aria-hidden="true" /> Views checked with Instagram&apos;s own data
            </li>
            <li>
              <IndianRupee size={20} strokeWidth={1.75} aria-hidden="true" /> Creators paid by UPI
            </li>
          </ul>
        </div>
      </section>

      {/* Under the hero: 4 steps with icons */}
      <section id="how-it-works" className="section">
        <div className="shell-container">
          <SectionReveal>
            <div className="section-head">
              <h2>How a campaign works</h2>
              <p className="lede">From brief to verified results in about 3 weeks</p>
            </div>
            <StepsRow
              steps={[
                { icon: <FileText size={24} strokeWidth={1.75} />, title: "Brand sets brief" },
                { icon: <Users size={24} strokeWidth={1.75} />, title: "Creators apply" },
                { icon: <CircleCheck size={24} strokeWidth={1.75} />, title: "Brand approves reel" },
                { icon: <BadgeIndianRupee size={24} strokeWidth={1.75} />, title: "Results verified, creators paid" },
              ]}
            />
          </SectionReveal>
        </div>
      </section>

      {/* Money section */}
      <section className="section section-alt">
        <SectionReveal className="shell-container split">
          <div>
            <h2>Your budget stays safe until the work is real.</h2>
            <p className="lede">
              Most creator deals mean paying big fees upfront and hoping. With RedCup, your budget is held by our payment partner, Razorpay, and creators are paid only for reels you approved and views Instagram verifies.
            </p>
            <ul className="checklist">
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Funded before work starts</strong>
                  <span>Creators start knowing the money is ready.</span>
                </div>
              </li>
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Fair payouts</strong>
                  <span>A fixed base after the reel stays live for 7 days, plus pay for every 1,000 verified views.</span>
                </div>
              </li>
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Unused budget comes back</strong>
                  <span>Anything creators don&apos;t earn is refunded to you.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Breakdown graphic: where ₹58,850 goes */}
          <figure className="breakdown" aria-label="Example campaign: where ₹58,850 goes">
            <div className="breakdown-head">
              <div>
                <span className="breakdown-eyebrow">Example campaign</span>
                <strong className="breakdown-title">Where ₹58,850 goes</strong>
              </div>
              <ExampleTag />
            </div>
            <div className="breakdown-bar" aria-hidden="true">
              <span className="seg seg-budget" style={{ flexBasis: `${(50000 / 58850) * 100}%` }} />
              <span className="seg seg-fee" style={{ flexBasis: `${(7500 / 58850) * 100}%` }} />
              <span className="seg seg-gst" style={{ flexBasis: `${(1350 / 58850) * 100}%` }} />
            </div>
            <dl className="breakdown-list">
              <div>
                <dt><i className="dot dot-budget" aria-hidden="true" />Creator bases (5 reels) · Paid after 7 days live</dt>
                <dd className="num">₹25,000</dd>
              </div>
              <div>
                <dt><i className="dot dot-budget" aria-hidden="true" />Views pay · ₹40 per 1,000 verified views, up to a cap</dt>
                <dd className="num">₹25,000</dd>
              </div>
              <div>
                <dt><i className="dot dot-fee" aria-hidden="true" />Platform fee 15%</dt>
                <dd className="num">₹7,500</dd>
              </div>
              <div>
                <dt><i className="dot dot-gst" aria-hidden="true" />GST</dt>
                <dd className="num">₹1,350</dd>
              </div>
              <div className="breakdown-total">
                <dt>Budget held by Razorpay</dt>
                <dd className="num">₹58,850</dd>
              </div>
            </dl>
          </figure>
        </SectionReveal>
      </section>

      {/* Verification section: phone with one example reel */}
      <section className="section">
        <SectionReveal className="shell-container split split-reverse">
          <div className="split-visual">
            <ExampleReelPhone />
          </div>
          <div>
            <h2>Views checked with Instagram&apos;s own data. No screenshots, no guesswork.</h2>
            <p className="lede">
              No more chasing creators for screenshots. RedCup reads each reel&apos;s views from Instagram and removes anything suspicious before anyone is paid.
            </p>
            <ul className="checklist">
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Checked views</strong>
                  <span>Suspicious spikes are removed before payment.</span>
                </div>
              </li>
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Paid Partnership label</strong>
                  <span>On every reel, as ASCI requires.</span>
                </div>
              </li>
              <li>
                <Check size={24} strokeWidth={1.75} aria-hidden="true" />
                <div>
                  <strong>Creators paid by UPI</strong>
                  <span>About a week after posting.</span>
                </div>
              </li>
            </ul>
          </div>
        </SectionReveal>
      </section>

      {/* Creator Profiles */}
      <section className="section section-alt">
        <SectionReveal className="shell-container split">
          <div>
            <h2>Your RedCup profile, verified.</h2>
            <p className="lede">
              One link with your best reels and verified stats. Put it in your bio and share it with any brand. No more screenshots.
            </p>
            <div className="actions">
              <Link href="/signup?role=creator" className="btn btn-primary">
                Create your free profile
              </Link>
            </div>
          </div>
          <div className="split-visual">
            <ProfilePhone />
          </div>
        </SectionReveal>
      </section>

      {/* Built for both sides */}
      <section className="section">
        <SectionReveal className="shell-container">
          <div className="section-head">
            <h2>Built for both sides</h2>
          </div>
          <div className="two-up">
            <div className="card side-card">
              <span className="side-card-icon" aria-hidden="true">
                <Building2 size={24} strokeWidth={1.75} />
              </span>
              <span className="side-card-label">For brands</span>
              <h3>No paying for nothing. A fixed base per approved reel, then the rest only for verified results.</h3>
              <p>Add your budget once. We shortlist creators who fit, you approve the reel, and you pay mostly for verified views.</p>
              <dl className="side-card-facts">
                <div><dt>Budget</dt><dd>Held by Razorpay</dd></div>
                <div><dt>Creators</dt><dd>Best-fit shortlist, you choose</dd></div>
                <div><dt>Approval</dt><dd>You approve every reel</dd></div>
              </dl>
              <Link href="/for-brands" className="btn btn-ghost">
                How it works for brands
              </Link>
            </div>
            <div className="card side-card">
              <span className="side-card-icon" aria-hidden="true">
                <Clapperboard size={24} strokeWidth={1.75} />
              </span>
              <span className="side-card-label">For creators</span>
              <h3>See if you qualify before you apply. Get paid by UPI.</h3>
              <p>Link your Instagram account to see whether you qualify before applying. Earn a fixed amount for every approved reel, plus more for every 1,000 verified views.</p>
              <dl className="side-card-facts">
                <div><dt>Application Pre-check</dt><dd>Instant Eligibility Tag</dd></div>
                <div><dt>Payout</dt><dd>UPI, about a week after posting</dd></div>
                <div><dt>Invoices</dt><dd>None to chase</dd></div>
              </dl>
              <Link href="/for-creators" className="btn btn-primary">
                How it works for creators
              </Link>
            </div>
          </div>
        </SectionReveal>
      </section>

      {/* Open Campaigns Gallery */}
      {featured.length > 0 && (
        <section className="section section-alt">
          <div className="shell-container">
            <div className="section-head section-head-row">
              <h2>Active campaigns accepting applications</h2>
              <Link href="/bounties" className="btn btn-ghost">
                View all campaigns
              </Link>
            </div>
            <div className="bounty-grid">
              {featured.map((c) => {
                const brand = brands.get(c.brandId)?.businessName || "Brand";
                return (
                  <Link key={c.id} href={"/bounties/" + c.slug} className="bounty-card" prefetch>
                    <div className="bounty-card-top">
                      <div>
                        <div className="bounty-card-title">{c.title}</div>
                        <div className="bounty-card-sub">{brand}</div>
                      </div>
                      <span className="chip">{c.status}</span>
                    </div>
                    <div className="bounty-card-foot">
                      <div>
                        <span className="bounty-card-sub" style={{ display: "block" }}>
                          Campaign Budget
                        </span>
                        <div className="bounty-card-budget num">{formatINR(c.budgetPaise)}</div>
                      </div>
                      <span className="bounty-card-sub">{c.slots} slots open</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ: accordion with + / − */}
      <section className="section">
        <SectionReveal className="shell-container faq-wrap">
          <div className="section-head">
            <h2>Questions brands and creators ask</h2>
            <p className="lede">Straight answers on payments, views and payouts.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="faq-item">
                <summary>
                  <span>{faq.q}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </summary>
                <div className="faq-body">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* Final call to action on a red band */}
      <section className="cta-band">
        <div className="shell-container cta-band-inner">
          <h2>Ready to try creator marketing that pays off?</h2>
          <p>Brands: launch your first campaign. Creators: join free and get notified when you qualify.</p>
          <div className="actions actions-center">
            <Link href="/signup?role=brand" className="btn btn-on-red">
              Create Brand Account <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
            </Link>
            <Link href="/signup?role=creator" className="btn btn-on-red-ghost">
              Join as Creator
            </Link>
          </div>
          <p className="cta-band-trust">Budget held by Razorpay · Views checked with Instagram data · Creators paid by UPI</p>
        </div>
      </section>
    </MarketingShell>
  );
}
