import Link from "next/link";
import { formatINR } from "@/lib/money";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatBars } from "@/components/ui/StatBars";
import { BountyCard } from "@/components/bounty/BountyCard";

export const dynamic = "force-dynamic";

export default async function BrandDashboard() {
  const session = await getSession();
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId);
  const campaigns = db.campaigns.filter((c) => c.brandId === brand?.id);
  const byStatus = Object.entries(
    campaigns.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
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
            {brand?.businessName || "Your brand"} · KYC {brand?.kycStatus || "—"}
          </p>
        </div>
        <Link href="/brand/bounties/new" className="btn btn-primary" prefetch>
          New bounty
        </Link>
      </div>

      {brand?.kycStatus !== "approved" && (
        <div className="card" style={{ marginTop: "1rem", background: "color-mix(in srgb, var(--warn) 10%, var(--sheet))" }}>
          Finish onboarding and wait for admin KYC approval before funding a bounty.{" "}
          <Link href="/brand/onboarding">Open profile</Link>
        </div>
      )}

      <dl className="app-kpi">
        <div>
          <dt>Bounties</dt>
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

      <h2 style={{ marginTop: "0.5rem" }}>Your bounties</h2>
      <div className="bounty-grid" style={{ marginTop: "0.75rem" }}>
        {campaigns.length === 0 && (
          <EmptyState
            title="No bounties yet"
            body="Fund your first reel bounty after KYC. Creators apply only where they match."
            actionHref="/brand/bounties/new"
            actionLabel="Create bounty"
          />
        )}
        {campaigns.map((c) => (
          <BountyCard
            key={c.id}
            href={"/brand/bounties/" + c.id}
            title={c.title}
            brandName={brand?.businessName}
            status={c.status}
            budgetPaise={c.budgetPaise}
            slots={c.slots}
          />
        ))}
      </div>
    </div>
  );
}
