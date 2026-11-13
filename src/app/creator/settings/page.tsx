import { whatsappConnectState } from "@/server/integrations/whatsapp";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { formatIST } from "@/lib/format";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import { DeleteInstagramDataButton } from "@/components/creator/DeleteInstagramData";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function CreatorSettingsPage() {
  await requirePageRole("creator");
  const wa = whatsappConnectState();
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const ig = creator?.instagram;
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: "1rem", maxWidth: 560, display: "grid", gap: "1rem" }}>
        <div className="card">
          <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Instagram</h2>
          {ig && creator ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <CreatorAvatar creatorId={creator.id} name={creator.displayName} hasInstagram={Boolean(ig.profilePictureUrl)} />
                <div>
                  <strong>@{ig.username}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {ig.name || "—"} · connected {formatIST(ig.connectedAt)}
                  </div>
                </div>
              </div>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                {ig.tokenValid ? "Connection active" : "Connection expired. Log in with Instagram again."}
                {ig.tokenExpiresAt ? ` · renews by ${formatIST(ig.tokenExpiresAt)}` : ""} · profile updated{" "}
                {formatIST(ig.profileRefreshedAt)}
              </div>
              <DeleteInstagramDataButton />
            </div>
          ) : (
            <p className="muted">Instagram is not connected.</p>
          )}
        </div>
        {!wa.ready && wa.message ? (
          <ConnectBanner provider="WhatsApp" message={wa.message} />
        ) : (
          <div className="card">WhatsApp alerts connected.</div>
        )}
      </div>
    </div>
  );
}
