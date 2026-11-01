import { MarketingShell } from "@/components/layout/MarketingShell";
import { BountyCard } from "@/components/bounty/BountyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Open Bounties — Live Creator Campaigns" };
export const dynamic = "force-dynamic";

export default async function BountiesPage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) =>
    ["live", "shortlisted", "in_production", "tracking"].includes(c.status),
  );
  const brands = new Map(db.brands.map((b) => [b.id, b]));

  return (
    <MarketingShell>
      <div style={{ maxWidth: "700px", marginBottom: "2.5rem" }}>
        <p className="kicker">Live Directory</p>
        <h1 style={{ marginBottom: "0.65rem" }}>Open Reel Bounties</h1>
        <p className="lede">
          Funded Instagram reel campaigns currently accepting creator applications. Authenticate as a creator to view your personalized eligibility status.
        </p>
      </div>

      <div className="bounty-grid">
        {live.length === 0 && (
          <EmptyState
            title="No live bounties right now"
            body="When a brand funds a campaign after KYC approval, it appears here for eligible creators."
            actionHref="/signup?role=brand"
            actionLabel="Start as a Brand"
          />
        )}
        {live.map((c) => (
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
    </MarketingShell>
  );
}
