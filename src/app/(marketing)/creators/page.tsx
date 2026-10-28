import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatFollowers } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Creators" };
export const dynamic = "force-dynamic";

export default async function CreatorsDirectoryPage() {
  const db = await readDb();
  const metrics = new Map(db.creatorMetrics.map((m) => [m.creatorId, m]));

  return (
    <MarketingShell>
      <h1>Creators</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>Directory of listed and verified creators on RedCup.</p>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.25rem" }}>
        {db.creators.length === 0 && <div className="card muted">No creators yet.</div>}
        {db.creators.map((c) => {
          const m = metrics.get(c.id);
          return (
            <Link key={c.id} href={"/creators/" + c.handle} className="card" style={{ display: "block" }}>
              <strong>{c.displayName}</strong>
              <span className="muted"> @{c.handle}</span>
              <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                {c.city || "India"} · {c.level}
                {m ? " · " + formatFollowers(m.followers) + " followers" : ""}
              </div>
            </Link>
          );
        })}
      </div>
    </MarketingShell>
  );
}
