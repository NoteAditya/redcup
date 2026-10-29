import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For creators" };

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <p className="chip" style={{ marginBottom: "0.85rem" }}>
        Creators
      </p>
      <h1>Earn for approved reels and verified views</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem", fontSize: "1.02rem" }}>
        Connect Instagram, finish PAN and UPI, and apply only to bounties you are eligible for. RedCup shows
        Eligible / Almost / Not eligible on every card — no claim-first scramble.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem", marginTop: "1.25rem" }}>
        <Link href="/signup?role=creator" className="btn btn-primary">
          Create a creator account
        </Link>
        <Link href="/bounties" className="btn btn-ghost">
          Browse bounties
        </Link>
      </div>

      <div className="axis axis-2" style={{ marginTop: "1.75rem" }}>
        <div className="card">
          <div className="step-num">BASE</div>
          <h3>Base + performance</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Base pays when your draft is approved and the reel is live with a paid partnership label. Performance
            pays per verified 1,000 views, capped.
          </p>
        </div>
        <div className="card">
          <div className="step-num">FIT</div>
          <h3>Fit Score shortlist</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Matching niches, audience, and reliability raise your Fit Score. Brands award from the shortlist;
            if they miss the deadline, top Fit Scores auto-award.
          </p>
        </div>
      </div>

      <section className="band band-ink" style={{ marginTop: "1.75rem" }}>
        <h2 style={{ maxWidth: "20ch" }}>Apply where you already match.</h2>
        <p className="muted" style={{ marginTop: "0.7rem", maxWidth: "46ch" }}>
          Eligibility is computed before you apply, so your time goes to briefs you can win — not guesswork DMs.
        </p>
        <Link href="/signup?role=creator" className="btn btn-primary" style={{ marginTop: "1.1rem" }}>
          Join as a creator
        </Link>
      </section>
    </MarketingShell>
  );
}
