import Link from "next/link";
import { formatINR } from "@/lib/money";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { campaignApproval } from "@/server/access";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplyButton } from "@/components/creator/ApplyButton";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import { requirePageRole } from "@/server/auth/guard";
import { creatorOnboarded } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function CreatorDashboard() {
  await requirePageRole("creator");
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const metrics = db.creatorMetrics.find((m) => m.creatorId === creator?.id);
  const ig = creator?.instagram ?? null;
  const live = db.campaigns.filter((c) => c.status === "live" && campaignApproval(c) === "approved");
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const applied = new Set(
    db.applications.filter((a) => a.creatorId === creator?.id).map((a) => a.campaignId),
  );
  const myApps = db.applications.filter((a) => a.creatorId === creator?.id);
  const won = myApps.filter((a) => ["AWARDED", "DRAFT_SENT", "REVISION", "APPROVED", "POSTED", "TRACKING", "VERIFIED", "PAID"].includes(a.status)).length;

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
        <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
          {creator ? (
            <CreatorAvatar creatorId={creator.id} name={creator.displayName} hasInstagram={Boolean(ig?.profilePictureUrl)} size={56} />
          ) : null}
          <div>
            <h1>Creator dashboard</h1>
            <p className="muted" style={{ marginTop: "0.35rem" }}>
              {creator?.displayName || "Creator"} @{creator?.handle || "—"} · {creator?.level || "new"}
              {ig ? ` · Instagram ${ig.accountType === "PROFESSIONAL" ? "professional" : (ig.accountType || "").toLowerCase()} account` : ""}
            </p>
          </div>
        </div>
        <Link href={creatorOnboarded(creator) ? "/creator/profile" : "/creator/onboarding"} className="btn btn-ghost" prefetch>
          {creatorOnboarded(creator) ? "Edit profile" : "Finish setup"}
        </Link>
      </div>

      {ig && !ig.tokenValid && (
        <div className="card" role="status" style={{ marginTop: "1rem" }}>
          Your Instagram connection expired. <a href="/api/auth/instagram/start">Log in with Instagram again</a> so we can
          keep your numbers and reel views up to date.
        </div>
      )}

      {ig?.biography ? (
        <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "60ch", whiteSpace: "pre-line" }}>
          {ig.biography}
        </p>
      ) : null}

      {creator && creatorOnboarded(creator) && !creator.panMasked && won > 0 && (
        <div className="card" role="status" style={{ marginTop: "1rem" }}>
          You won a campaign. Add your PAN before your first payout.{" "}
          <Link href="/creator/profile#pan">Add PAN</Link>
        </div>
      )}

      {!creatorOnboarded(creator) && (
        <div className="card" style={{ marginTop: "1rem" }}>
          Complete onboarding to check your eligibility and apply for campaigns.{" "}
          <Link href="/creator/onboarding">Continue setup</Link>
        </div>
      )}

      <dl className="app-kpi">
        <div>
          <dt>Followers</dt>
          <dd>{metrics?.followers?.toLocaleString("en-IN") || "—"}</dd>
        </div>
        <div>
          <dt>Posts</dt>
          <dd>{ig?.mediaCount != null ? ig.mediaCount.toLocaleString("en-IN") : metrics?.mediaCount?.toLocaleString("en-IN") || "—"}</dd>
        </div>
        <div>
          <dt>Applications</dt>
          <dd>{myApps.length}</dd>
        </div>
        <div>
          <dt>Open campaigns</dt>
          <dd>{live.length}</dd>
        </div>
      </dl>

      <h2 style={{ marginTop: "0.5rem" }}>Open for you</h2>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
        {live.length === 0 && (
          <EmptyState
            title="No live campaigns"
            body="When brands fund campaigns, matching ones show up here with eligibility chips."
            actionHref="/bounties"
            actionLabel="Browse public list"
          />
        )}
        {live.map((c) => {
          const brand = brands.get(c.brandId);
          const already = applied.has(c.id);
          return (
            <div
              key={c.id}
              className="card"
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{c.title}</strong>
                <div className="muted" style={{ fontSize: "0.9rem", marginTop: 4 }}>
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
