import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { formatIST, labelize } from "@/lib/format";
import { ReviewChip } from "@/components/admin/AdminActions";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";

export const dynamic = "force-dynamic";

export default async function AdminCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const creator = db.creators.find((c) => c.id === id);
  if (!creator) notFound();
  const user = db.users.find((u) => u.id === creator.userId);
  const m = db.creatorMetrics.find((x) => x.creatorId === creator.id);
  const ig = creator.instagram ?? null;
  const apps = db.applications
    .filter((a) => a.creatorId === creator.id)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const reels = new Map(db.reels.map((r) => [r.applicationId, r]));
  const earned = db.ledger
    .filter((l) => l.type === "earning" && l.creatorId === creator.id)
    .reduce((a, l) => a + l.amountPaise, 0);
  const won = apps.filter((a) => ["AWARDED", "DRAFT_SENT", "REVISION", "APPROVED", "POSTED", "TRACKING", "VERIFIED", "PAID"].includes(a.status)).length;

  return (
    <div>
      <Link href="/admin/applications?review=all" className="muted" style={{ fontSize: "0.85rem" }}>← Applications</Link>
      <div className="adm-head" style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: "0.9rem", alignItems: "center" }}>
          <CreatorAvatar creatorId={creator.id} name={creator.displayName} hasInstagram={Boolean(ig?.profilePictureUrl)} size={64} />
          <div>
          <h1>{creator.displayName}</h1>
          <p className="adm-sub">
            @{creator.handle} · {creator.level} · {creator.city || "city not set"}
            {user ? (
              <>
                {" · "}
                <Link href={"/admin/users/" + user.id}>account</Link>
              </>
            ) : null}
          </p>
          </div>
        </div>
        {user && (
          <span className={user.status === "inactive" ? "chip chip-bad" : "chip chip-ok"}>
            {user.status === "inactive" ? "turned off" : "active"}
          </span>
        )}
      </div>

      <dl className="app-kpi">
        <div><dt>Followers</dt><dd>{m ? m.followers.toLocaleString("en-IN") : "—"}</dd></div>
        <div><dt>Applications</dt><dd>{apps.length}</dd></div>
        <div><dt>Awarded</dt><dd>{won}</dd></div>
        <div><dt>Earned</dt><dd>{formatINR(earned)}</dd></div>
      </dl>

      <div className="adm-panel">
        <h3>Profile</h3>
        <dl className="adm-dl">
          <dt>Niches</dt>
          <dd>{(m?.niches?.length ? m.niches : creator.categories).join(", ") || "—"}</dd>
          <dt>Languages</dt>
          <dd>{(m?.languages?.length ? m.languages : creator.languages).join(", ") || "—"}</dd>
          <dt>Avg reel views</dt>
          <dd>{m?.avgReelViews10 != null ? m.avgReelViews10.toLocaleString("en-IN") : "—"}</dd>
          <dt>Engagement</dt>
          <dd>{m?.engagementRate10 != null ? (m.engagementRate10 * 100).toFixed(1) + "%" : "—"}</dd>
          <dt>Instagram</dt>
          <dd>
            {ig
              ? `logged in with Instagram · ${ig.tokenValid ? "connection active" : "connection expired"}`
              : m?.igConnected
                ? "self-reported (signed up before Instagram login; links on their first Instagram login)"
                : "not connected"}
          </dd>
          <dt>Payout details</dt>
          <dd>{creator.upiMasked ? "UPI on file" : "no UPI"} · {creator.panMasked ? "PAN on file" : "no PAN"}</dd>
        </dl>
      </div>

      {ig && (
        <div className="adm-panel">
          <h3>Instagram profile</h3>
          {ig.linkNote && (
            <p className="muted" role="note" style={{ fontSize: "0.85rem", margin: "0 0 0.75rem" }}>
              {ig.linkNote}
            </p>
          )}
          <dl className="adm-dl">
            <dt>Username</dt>
            <dd>
              <a href={`https://www.instagram.com/${ig.username}/`} target="_blank" rel="noreferrer">
                @{ig.username}
              </a>
            </dd>
            <dt>Name</dt>
            <dd>{ig.name || "—"}</dd>
            <dt>Account type</dt>
            <dd>{ig.accountType ? ig.accountType.toLowerCase() : "—"}</dd>
            <dt>Bio</dt>
            <dd style={{ whiteSpace: "pre-line" }}>{ig.biography || "—"}</dd>
            <dt>Website</dt>
            <dd>{ig.website || "—"}</dd>
            <dt>Followers · following · posts</dt>
            <dd>
              {[ig.followers, ig.follows, ig.mediaCount].map((n) => (n != null ? n.toLocaleString("en-IN") : "—")).join(" · ")}
            </dd>
            <dt>Instagram id</dt>
            <dd className="muted">{ig.igUserId}</dd>
            <dt>Connected</dt>
            <dd>
              {formatIST(ig.connectedAt)} · profile updated {formatIST(ig.profileRefreshedAt)}
              {ig.tokenExpiresAt ? ` · token until ${formatIST(ig.tokenExpiresAt)}` : ""}
            </dd>
          </dl>
        </div>
      )}

      <h2 style={{ marginTop: "1.75rem" }}>Applications and results</h2>
      <div className="adm-table-wrap" style={{ marginTop: "0.75rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Brand</th>
              <th>Applied</th>
              <th>Review</th>
              <th>Status</th>
              <th>Fit</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => {
              const c = campaigns.get(a.campaignId);
              const reel = reels.get(a.id);
              return (
                <tr key={a.id}>
                  <td>{c ? <Link href={"/admin/bounties/" + c.id}>{c.title}</Link> : a.campaignId}</td>
                  <td>{c ? brands.get(c.brandId)?.businessName ?? "—" : "—"}</td>
                  <td className="muted" style={{ fontSize: "0.8125rem" }}>{formatIST(a.appliedAt)}</td>
                  <td>
                    <ReviewChip review={a.reviewStatus ?? "pending"} />
                    {a.reviewNote && <div className="muted" style={{ fontSize: "0.75rem" }}>{a.reviewNote}</div>}
                  </td>
                  <td>{labelize(a.status.toLowerCase())}</td>
                  <td className="adm-num">{a.fitScore ?? "—"}</td>
                  <td className="adm-num">{reel?.finalViews != null ? reel.finalViews.toLocaleString("en-IN") : reel ? "posted" : "—"}</td>
                </tr>
              );
            })}
            {apps.length === 0 && (
              <tr><td colSpan={7} className="muted">No applications yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
