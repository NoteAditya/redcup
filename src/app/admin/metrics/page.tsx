import { readDb } from "@/server/db/store";
import { ManualViewsForm } from "@/components/admin/AdminActions";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { instagramConnectState } from "@/server/integrations/instagram";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const db = await readDb();
  const ig = instagramConnectState();
  const reels = new Map(db.reels.map((r) => [r.applicationId, r]));
  const posted = db.applications.filter((a) => a.status === "POSTED" || a.status === "TRACKING");
  const creators = new Map(db.creators.map((c) => [c.id, c]));
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <h1>Reel metrics</h1>
      <p className="muted" style={{ marginTop: "0.35rem", maxWidth: "60ch" }}>
        For creators who logged in with Instagram, fetch views straight from Instagram insights, check the number, then
        save. Manual entry from a screen recording still works for everyone else.
      </p>
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
              {reels.get(a.id)?.permalink ? (
                <>
                  {" · "}
                  <a href={reels.get(a.id)!.permalink} target="_blank" rel="noreferrer">
                    reel
                  </a>
                </>
              ) : null}
              {creators.get(a.creatorId)?.instagram ? "" : " · not on Instagram login, enter by hand"}
            </div>
            <ManualViewsForm
              applicationId={a.id}
              canFetch={ig.ready && Boolean(creators.get(a.creatorId)?.instagram?.tokenValid)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
