import { readDb } from "@/server/db/store";
import { ManualViewsForm } from "@/components/admin/AdminActions";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { instagramConnectState } from "@/server/integrations/instagram";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const db = await readDb();
  const ig = instagramConnectState();
  const posted = db.applications.filter((a) => a.status === "POSTED" || a.status === "TRACKING");
  const creators = new Map(db.creators.map((c) => [c.id, c]));
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <h1>Manual metrics</h1>
      {!ig.ready && ig.message && (
        <div style={{ margin: "1rem 0", maxWidth: 560 }}>
          <ConnectBanner provider="Meta / Instagram" message={ig.message} />
        </div>
      )}
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        {posted.length === 0 && <div className="card muted">No posted reels awaiting verification.</div>}
        {posted.map((a) => (
          <div key={a.id} className="card">
            <strong>{campaigns.get(a.campaignId)?.title}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", marginBottom: 8 }}>
              {creators.get(a.creatorId)?.displayName} · {a.status}
            </div>
            <ManualViewsForm applicationId={a.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
