import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Bounties" };
export const dynamic = "force-dynamic";

export default async function BountiesPage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) => ["live", "shortlisted", "in_production", "tracking"].includes(c.status));
  const brands = new Map(db.brands.map((b) => [b.id, b]));

  return (
    <MarketingShell>
      <h1>Open bounties</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>
        Public list of live and active campaigns. Sign in as a creator to see your eligibility on each card.
      </p>
      <div style={{ display: "grid", gap: "0.85rem", marginTop: "1.25rem" }}>
        {live.length === 0 && (
          <div className="card muted">No live bounties yet. Brands can fund one from the dashboard after KYC.</div>
        )}
        {live.map((c) => {
          const brand = brands.get(c.brandId);
          return (
            <Link key={c.id} href={"/bounties/" + c.slug} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{c.title}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                    {brand?.businessName || "Brand"} · {c.slots} slots · {formatINR(c.budgetPaise)} budget
                  </div>
                </div>
                <span className="chip">{c.status}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </MarketingShell>
  );
}
