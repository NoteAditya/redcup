import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For creators" };

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <h1>Earn for approved reels and verified views</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem" }}>
        Connect Instagram, finish PAN and UPI, and apply only to bounties you are eligible for. RedCup shows
        Eligible / Almost / Not eligible on every card — no claim-first scramble.
      </p>
      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Base + performance</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Base pays when your draft is approved and the reel is live with a paid partnership label. Performance
            pays per verified 1,000 views, capped.
          </p>
        </div>
        <div className="card">
          <h3>Fit Score shortlist</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Matching niches, audience, and reliability raise your Fit Score. Brands award from the shortlist;
            if they miss the deadline, top Fit Scores auto-award.
          </p>
        </div>
      </div>
      <Link href="/signup?role=creator" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
        Create a creator account
      </Link>
    </MarketingShell>
  );
}
