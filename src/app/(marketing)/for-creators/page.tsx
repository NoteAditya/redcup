import Link from "next/link";
import { BadgeCheck, CircleCheck, Clapperboard, IndianRupee, Send, Smartphone, Wallet } from "lucide-react";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CreatorJourneyPhone, ExampleTag, ProfilePhone, SectionReveal, StepTimeline, StickyCta } from "@/components/marketing/Visuals";

export const metadata = { title: "For Creators — Earn on Approved Reels" };

const STEPS = [
  {
    icon: <Smartphone size={24} strokeWidth={1.75} />,
    title: "Connect Instagram and add payout details",
    desc: "Your professional account, PAN and UPI.",
  },
  {
    icon: <BadgeCheck size={24} strokeWidth={1.75} />,
    title: "Check if you qualify",
    desc: "Every campaign shows Eligible, Almost or Not eligible before you apply.",
  },
  {
    icon: <CircleCheck size={24} strokeWidth={1.75} />,
    title: "Apply where you fit",
    desc: "No cold pitching. Brands pick creators within 48 hours.",
  },
  {
    icon: <Send size={24} strokeWidth={1.75} />,
    title: "Send your draft",
    desc: "The brand approves it or asks for one change.",
  },
  {
    icon: <IndianRupee size={24} strokeWidth={1.75} />,
    title: "Post and get paid",
    desc: "Post with the Paid Partnership label. Your base is paid once the reel has been live for 7 days, plus more for every 1,000 verified views.",
  },
];

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <section className="page-hero split">
        <div>
          <span className="kicker">For creators</span>
          <h1>Get paid by brands for your reels.</h1>
          <p className="lede">
            Join free with your Instagram professional account. See which brand campaigns you qualify for, make a reel, and earn a fixed amount for every approved reel, plus more for every 1,000 verified views. Paid by UPI.
          </p>
          <div className="actions">
            <Link href="/signup?role=creator" className="btn btn-primary">
              Join free
            </Link>
            <Link href="#how-you-get-paid" className="btn btn-ghost">
              See how payouts work
            </Link>
          </div>
        </div>
        <div className="split-visual">
          <CreatorJourneyPhone />
        </div>
      </section>

      {/* Payout example card */}
      <SectionReveal>
        <section className="payout-card" aria-label="Payout example">
          <div className="payout-card-head">
            <h3>Payout example</h3>
            <ExampleTag />
          </div>
          <p>
            Example: base ₹1,000 + 50,000 verified views at ₹40 per 1,000 = ₹3,000; after RedCup&apos;s 10%, you get ₹2,700
          </p>
          <p className="payout-card-note">RedCup keeps 10% of each payout. Joining is free.</p>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section id="how-you-get-paid" className="section anchor-target">
          <div className="section-head">
            <h2>How you get paid</h2>
            <p className="lede">From sign-up to UPI payout</p>
          </div>
          <StepTimeline steps={STEPS} />
        </section>
      </SectionReveal>

      {/* Creator Profiles */}
      <SectionReveal>
        <section className="section split">
          <div>
            <h2>Your RedCup profile, verified.</h2>
            <p className="lede">
              One link with your best reels and verified stats. Put it in your bio and share it with any brand. No more screenshots.
            </p>
            <div className="actions">
              <Link href="/signup?role=creator" className="btn btn-primary">
                Create my free profile
              </Link>
            </div>
          </div>
          <div className="split-visual">
            <ProfilePhone />
          </div>
        </section>
      </SectionReveal>

      <SectionReveal>
        <section className="section two-up">
          <div className="card">
            <span className="side-card-icon" aria-hidden="true">
              <Clapperboard size={24} strokeWidth={1.75} />
            </span>
            <span className="side-card-label">Zero Time Waste</span>
            <h3>Eligibility upfront</h3>
            <p>Our matching system checks your profile against campaign criteria before you write an application. You immediately know if you qualify for the campaign.</p>
          </div>

          <div className="card">
            <span className="side-card-icon" aria-hidden="true">
              <Wallet size={24} strokeWidth={1.75} />
            </span>
            <span className="side-card-label">Pre-funded</span>
            <h3>Money ready before you start</h3>
            <p>The brand funds every campaign before it opens, so your payment is waiting when your reel qualifies.</p>
          </div>
        </section>
      </SectionReveal>

      <StickyCta href="/signup?role=creator" label="Join free" />
    </MarketingShell>
  );
}
