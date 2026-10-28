import Link from "next/link";
import { formatINR } from "@/lib/money";
import { EligibilityChip } from "@/components/ui/EligibilityChip";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { evaluate } from "@/server/eligibility/evaluate";
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

  return (
    <div>
      <h1>Creator dashboard</h1>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {creator?.displayName || "Creator"} · {creator?.level}
        {!metrics && (
          <>
            {" "}
            · <Link href="/creator/onboarding">Finish profile</Link>
          </>
        )}
      </p>
      <h2 style={{ marginTop: "1.25rem" }}>Live bounties</h2>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        {live.length === 0 && <div className="card muted">No live bounties right now.</div>}
        {live.map((c) => {
          const elig = metrics ? evaluate(metrics, c.criteria) : { status: "INCOMPLETE" as const, reasons: [] };
          return (
            <div key={c.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{c.title}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                    {brands.get(c.brandId)?.businessName} · {formatINR(c.basePaise)} base ·{" "}
                    {formatINR(c.ratePer1000Paise)}/1K · cap {formatINR(c.capPerCreatorPaise)}
                  </div>
                </div>
                <EligibilityChip status={elig.status} />
              </div>
              {elig.reasons[0] && (
                <p className="muted" style={{ fontSize: "0.85rem", marginTop: 8 }}>
                  {elig.reasons[0].message}
                </p>
              )}
              <div style={{ marginTop: 10 }}>
                {applied.has(c.id) ? (
                  <span className="chip">Applied</span>
                ) : (
                  <ApplyButton campaignId={c.id} disabled={elig.status !== "ELIGIBLE"} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
