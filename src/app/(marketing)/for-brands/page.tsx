import Link from "next/link";
import { BadgeCheck, Eye, ListChecks, ShieldCheck, Users, Wallet } from "lucide-react";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CupFill } from "@/components/marketing/CupFill";
import { SectionReveal, StepTimeline, StickyCta } from "@/components/marketing/Visuals";

export const metadata = { title: "For Brands — Performance Creator Campaigns" };

const STEPS = [
  {
    icon: <ShieldCheck size={24} strokeWidth={1.75} />,
    title: "Verify your business",
    desc: "Add your GSTIN and details. We check every brand to keep the marketplace safe.",
  },
  {
    icon: <ListChecks size={24} strokeWidth={1.75} />,
    title: "Choose who you want",
    desc: "Pick a preset or set niche, city and follower range, and see how many creators match.",
  },
  {
    icon: <Wallet size={24} strokeWidth={1.75} />,
    title: "Fund your campaign",
    desc: "Creator budget + 15% fee + GST, held safely by Razorpay. It opens to creators once approved.",
  },
  {
    icon: <Users size={24} strokeWidth={1.75} />,
    title: "Pick your creators",
    desc: "We rank applicants by fit and past results, and you choose within 48 hours.",
  },
  {
    icon: <Eye size={24} strokeWidth={1.75} />,
    title: "Approve, post, track",
    desc: "You approve each draft (one revision). The reel goes live with the Paid Partnership label, and we verify its views for 7 days.",
  },
];

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <section className="page-hero split">
        <div>
          <span className="kicker">For brands</span>
          <h1>Get reels from creators who fit your brand. Pay mostly for real views.</h1>
          <p className="lede">
            Set your brief and budget. Only creators who match can apply, you pick the best fit, and you approve every reel. Your budget is held by Razorpay: creators get a fixed base per approved reel, and the rest is paid only for verified results, and unused budget comes back to you.
          </p>
          <div className="actions">
            <Link href="/signup?role=brand" className="btn btn-primary">
              Launch your first campaign
            </Link>
            <Link href="#calculator" className="btn btn-ghost">
              See pricing
            </Link>
          </div>
        </div>
        {/* Campaign cost calculator (moved from the homepage) */}
        <div id="calculator" className="anchor-target">
          <CupFill />
        </div>
      </section>

      <SectionReveal>
        <section id="how-it-works" className="section anchor-target">
          <div className="section-head">
            <h2>How it works</h2>
            <p className="lede">From brief to verified results in about 3 weeks</p>
          </div>
          <StepTimeline steps={STEPS} />
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="section two-up">
          <div className="card">
            <span className="side-card-icon" aria-hidden="true">
              <BadgeCheck size={24} strokeWidth={1.75} />
            </span>
            <span className="side-card-label">Clear costs</span>
            <h3>No surprise fees</h3>
            <p>You see the full cost, including GST, before you pay. Unused budget comes back to you.</p>
          </div>

          <div className="card">
            <span className="side-card-icon" aria-hidden="true">
              <Users size={24} strokeWidth={1.75} />
            </span>
            <span className="side-card-label">Smart shortlist</span>
            <h3>Best-fit creators first</h3>
            <p>We rank creators by fit and past results. If you don&apos;t choose in 48 hours, we pick the top matches so your campaign isn&apos;t delayed.</p>
          </div>
        </section>
      </SectionReveal>

      <StickyCta href="/signup?role=brand" label="Launch a campaign" />
    </MarketingShell>
  );
}
