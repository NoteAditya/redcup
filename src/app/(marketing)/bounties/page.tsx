import { MarketingShell } from "@/components/layout/MarketingShell";
import { BountyCard } from "@/components/bounty/BountyCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/motion/Reveal";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Bounties" };
export const dynamic = "force-dynamic";

export default async function BountiesPage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) =>
    ["live", "shortlisted", "in_production", "tracking"].includes(c.status),
  );
  const brands = new Map(db.brands.map((b) => [b.id, b]));

  return (
    <MarketingShell>
      <Reveal>
        <h1>Open bounties</h1>
        <p className="muted" style={{ marginTop: "0.5rem", maxWidth: "52ch" }}>
          Public list of live and active campaigns. Sign in as a creator to see your eligibility on each card.
        </p>
      </Reveal>
      <div className="bounty-grid" style={{ marginTop: "1.25rem" }}>
        {live.length === 0 && (
          <EmptyState
            title="No live bounties yet"
            body="When a brand funds a campaign after KYC, it appears here for eligible creators."
            actionHref="/signup?role=brand"
            actionLabel="Start as a brand"
          />
        )}
        {live.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(i * 0.04, 0.2)}>
            <BountyCard
              href={"/bounties/" + c.slug}
              title={c.title}
              brandName={brands.get(c.brandId)?.businessName}
              status={c.status}
              budgetPaise={c.budgetPaise}
              slots={c.slots}
            />
          </Reveal>
        ))}
      </div>
    </MarketingShell>
  );
}
