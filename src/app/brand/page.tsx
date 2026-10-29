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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
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
        <div className="card" style={{ marginTop: "1rem", borderColor: "color-mix(in srgb, var(--warn) 35%, var(--line))" }}>
          Finish onboarding and wait for admin KYC approval before funding a bounty.{" "}
          <Link href="/brand/onboarding">Open profile</Link>
        </div>
      )}

      <div className="axis axis-3" style={{ marginTop: "1.15rem" }}>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
            Bounties
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{campaigns.length}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
            Budget locked
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{formatINR(spent)}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
            By status
          </div>
          {byStatus.length ? <StatBars items={byStatus} /> : <p className="muted" style={{ fontSize: "0.85rem" }}>No data yet</p>}
        </div>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Your bounties</h2>
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
