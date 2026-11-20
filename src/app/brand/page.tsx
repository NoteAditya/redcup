import Link from "next/link";
import { formatINR } from "@/lib/money";
import { BrandPendingScreen, getBrandAccess } from "@/components/brand/BrandGate";
import { brandCampaignLabel } from "@/server/access";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatBars } from "@/components/ui/StatBars";
import { BountyCard } from "@/components/bounty/BountyCard";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function BrandDashboard() {
  await requirePageRole("brand");
  const { db, brand, approved } = await getBrandAccess();
  if (!approved) return <BrandPendingScreen brand={brand} />;
  const campaigns = db.campaigns.filter((c) => c.brandId === brand?.id);
  const byStatus = Object.entries(
    campaigns.reduce<Record<string, number>>((acc, c) => {
      const k = brandCampaignLabel(c);
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {}),
  ).map(([label, value]) => ({ label, value, tone: "cup" as const }));
  const spent = campaigns.reduce((a, c) => a + (c.budgetPaise || 0), 0);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "end",
        }}
      >
        <div>
          <h1>Brand dashboard</h1>
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            {brand?.businessName || "Your brand"} · approved by RedCup
          </p>
        </div>
        <Link href="/brand/bounties/new" className="btn btn-primary" prefetch>
          New campaign
        </Link>
      </div>

      <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
        New campaigns are reviewed by RedCup before creators can see them.
      </p>

      <dl className="app-kpi">
        <div>
          <dt>Campaigns</dt>
          <dd>{campaigns.length}</dd>
        </div>
        <div>
          <dt>Budget locked</dt>
          <dd>{formatINR(spent)}</dd>
        </div>
        <div>
          <dt>By status</dt>
          <dd style={{ fontSize: "1rem", fontWeight: 500 }}>
            {byStatus.length ? <StatBars items={byStatus} /> : <span className="muted">No data yet</span>}
          </dd>
        </div>
      </dl>

      <h2 style={{ marginTop: "0.5rem" }}>Your campaigns</h2>
      <div className="bounty-grid" style={{ marginTop: "0.75rem" }}>
        {campaigns.length === 0 && (
          <EmptyState
            title="No campaigns yet"
            body="Create and fund your first reel campaign. RedCup reviews it, then matching creators can apply."
            actionHref="/brand/bounties/new"
            actionLabel="Create campaign"
          />
        )}
        {campaigns.map((c) => (
          <BountyCard
            key={c.id}
            href={"/brand/bounties/" + c.id}
            title={c.title}
            brandName={brand?.businessName}
            status={brandCampaignLabel(c)}
            budgetPaise={c.budgetPaise}
            slots={c.slots}
          />
        ))}
      </div>
    </div>
  );
}
