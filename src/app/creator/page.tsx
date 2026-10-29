import Link from "next/link";
import { formatINR } from "@/lib/money";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplyButton } from "@/components/creator/ApplyButton";

export const dynamic = "force-dynamic";

export default async function CreatorDashboard() {
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const metrics = db.creatorMetrics.find((m) => m.creatorId === creator?.id);
  const live = db.campaigns.filter((c) => c.status === "live");
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const applied = new Set(
    db.applications.filter((a) => a.creatorId === creator?.id).map((a) => a.campaignId),
  );
  const myApps = db.applications.filter((a) => a.creatorId === creator?.id);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <h1>Creator dashboard</h1>
          <p className="muted" style={{ marginTop: "0.35rem" }}>
            {creator?.displayName || "Creator"} @{creator?.handle || "—"} · {creator?.level || "new"}
          </p>
        </div>
        <Link href="/creator/onboarding" className="btn btn-ghost" prefetch>
          Edit profile
        </Link>
      </div>

      {!creator?.handle && (
        <div className="card" style={{ marginTop: "1rem" }}>
          Finish onboarding so eligibility and applications unlock.{" "}
          <Link href="/creator/onboarding">Continue setup</Link>
        </div>
      )}

      <div className="axis axis-3" style={{ marginTop: "1.15rem" }}>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Followers</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>
            {metrics?.followers?.toLocaleString("en-IN") || "—"}
          </div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Applications</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{myApps.length}</div>
        </div>
        <div className="card">
          <div className="muted" style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Open bounties</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, marginTop: 4 }}>{live.length}</div>
        </div>
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Open for you</h2>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        {live.length === 0 && (
          <EmptyState
            title="No live bounties"
            body="When brands fund campaigns, matching ones show up here with eligibility chips."
            actionHref="/bounties"
            actionLabel="Browse public list"
          />
        )}
        {live.map((c) => {
          const brand = brands.get(c.brandId);
          const already = applied.has(c.id);
          return (
            <div key={c.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <strong>{c.title}</strong>
                <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                  {brand?.businessName || "Brand"} · {formatINR(c.budgetPaise)} · {c.slots} slots
                </div>
              </div>
              {already ? <span className="chip chip-ok">Applied</span> : <ApplyButton campaignId={c.id} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
