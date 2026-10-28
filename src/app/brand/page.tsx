import Link from "next/link";
import { formatINR } from "@/lib/money";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function BrandDashboard() {
  const session = await getSession();
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId);
  const campaigns = db.campaigns.filter((c) => c.brandId === brand?.id);

  return (
    <div>
      <h1>Brand dashboard</h1>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {brand?.businessName || "Your brand"} · KYC {brand?.kycStatus || "—"}
      </p>
      {brand?.kycStatus !== "approved" && (
        <div className="card" style={{ marginTop: "1rem" }}>
          Finish onboarding and wait for admin KYC approval before funding a bounty.{" "}
          <Link href="/brand/onboarding">Open profile</Link>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.25rem" }}>
        <h2>Bounties</h2>
        <Link href="/brand/bounties/new" className="btn btn-primary">
          New bounty
        </Link>
      </div>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        {campaigns.length === 0 && <div className="card muted">No bounties yet.</div>}
        {campaigns.map((c) => (
          <Link key={c.id} href={"/brand/bounties/" + c.id} className="card" style={{ display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <strong>{c.title}</strong>
              <span className="chip">{c.status}</span>
            </div>
            <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
              {formatINR(c.budgetPaise)} · {c.slots} slots
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
