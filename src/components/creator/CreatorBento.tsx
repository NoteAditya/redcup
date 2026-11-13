import type { CreatorMetrics } from "@/lib/types";
import type { Creator } from "@/server/db/store";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import { TopReels } from "@/components/creator/TopReels";

const n = (v: number | null | undefined) => (v == null ? "—" : v.toLocaleString("en-IN"));

/**
 * Bento-style creator profile: Instagram avatar, bio, stats, niche chips and the top 5 reels.
 * Public-safe: never shows contact details, PAN or UPI. Numbers are Instagram's or "—".
 */
export function CreatorBento({
  creator,
  metrics,
  actions,
}: {
  creator: Creator;
  metrics: CreatorMetrics | null | undefined;
  actions?: React.ReactNode;
}) {
  const ig = creator.instagram ?? null;
  const niches = creator.categories.length ? creator.categories : (metrics?.niches ?? []);
  const followers = ig?.followers ?? metrics?.followers ?? null;
  const posts = ig?.mediaCount ?? metrics?.mediaCount ?? null;
  const er = metrics?.engagementRate10;
  const avgViews = metrics?.avgReelViews10;
  return (
    <section className="bento" aria-label={`${creator.displayName} profile`}>
      <div className="bento-tile bento-hero">
        <div className="bento-hero-top">
          <CreatorAvatar creatorId={creator.id} name={creator.displayName} hasInstagram={Boolean(ig?.profilePictureUrl)} size={88} />
          {actions ? <div className="bento-actions">{actions}</div> : null}
        </div>
        <h2 className="bento-name">{creator.displayName || ig?.name || "Creator"}</h2>
        <p className="bento-handle">
          {ig ? (
            <a href={`https://www.instagram.com/${ig.username}/`} target="_blank" rel="noreferrer">
              @{ig.username}
            </a>
          ) : (
            <>@{creator.handle}</>
          )}
          {creator.city ? <> · {creator.city}</> : null}
        </p>
        {ig?.biography ? <p className="bento-bio">{ig.biography}</p> : null}
        {niches.length ? (
          <div className="bento-chips">
            {niches.map((c) => (
              <span key={c} className="chip chip-cup">
                {c}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="bento-tile bento-stat is-ink">
        <span className="bento-label">Followers</span>
        <strong>{n(followers)}</strong>
      </div>
      <div className="bento-tile bento-stat">
        <span className="bento-label">Posts</span>
        <strong>{n(posts)}</strong>
      </div>
      <div className="bento-tile bento-stat">
        <span className="bento-label">Following</span>
        <strong>{n(ig?.follows)}</strong>
      </div>
      <div className="bento-tile bento-stat is-blush">
        <span className="bento-label">{avgViews != null ? "Avg reel views" : er != null ? "Engagement" : "Languages"}</span>
        <strong>
          {avgViews != null
            ? n(avgViews)
            : er != null
              ? `${(er * 100).toFixed(1)}%`
              : (creator.languages.join(", ") || "—")}
        </strong>
      </div>

      <div className="bento-tile bento-reels">
        <div className="bento-reels-head">
          <span className="bento-label">Top reels</span>
          <span className="muted" style={{ fontSize: "0.78rem" }}>
            {ig?.topReelsFetchedAt ? "From Instagram" : ""}
          </span>
        </div>
        <TopReels creatorId={creator.id} reels={ig?.topReels} status={ig ? (ig.topReelsStatus ?? null) : null} />
      </div>
    </section>
  );
}
