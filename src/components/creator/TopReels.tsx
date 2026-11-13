"use client";

import { useState } from "react";
import type { TopReel, TopReelsStatus } from "@/server/db/store";

const fmt = (n: number | null) =>
  n == null ? null : n >= 100000 ? `${(n / 100000).toFixed(n >= 1000000 ? 0 : 1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

const EMPTY: Record<TopReelsStatus | "none" | "pending", string> = {
  pending: "Fetching top reels from Instagram. Refresh in a minute.",
  ok: "No reels to show yet.",
  no_reels: "No reels on this Instagram account yet.",
  no_token: "Reels show up after logging in with Instagram. The Instagram connection is missing or expired.",
  no_insights: "Instagram didn't share view counts, so reels are ranked by likes and comments.",
  error: "Couldn't load reels from Instagram right now. They'll refresh automatically.",
  none: "Reels show up after logging in with Instagram.",
};

function Thumb({ creatorId, reel }: { creatorId: string; reel: TopReel }) {
  const [failed, setFailed] = useState(false);
  if (failed || !reel.thumbnailUrl) return <span className="reel-thumb reel-thumb-empty" aria-hidden>▶</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="reel-thumb"
      src={`/api/creators/${creatorId}/reels/${reel.mediaId}/thumb`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/**
 * Up to 5 top reels from the Instagram API (cached on the creator). Real numbers only:
 * anything Instagram didn't share is left out, and an empty state explains why there are none.
 */
export function TopReels({
  creatorId,
  reels,
  status,
  compact,
  limit = 5,
}: {
  creatorId: string;
  reels: TopReel[] | null | undefined;
  /** "pending" = connected to Instagram but reels not fetched yet. */
  status: TopReelsStatus | "pending" | null | undefined;
  compact?: boolean;
  limit?: number;
}) {
  const list = (reels ?? []).slice(0, limit);
  if (!list.length) {
    return (
      <p className="reel-empty muted" role="status">
        {EMPTY[!status ? "none" : status === "ok" || status === "no_insights" ? "no_reels" : status]}
      </p>
    );
  }
  return (
    <div>
      <ol className={compact ? "reel-grid reel-grid-compact" : "reel-grid"}>
        {list.map((r, i) => {
          const stats = [
            r.views != null ? `${fmt(r.views)} views` : null,
            r.likes != null ? `${fmt(r.likes)} likes` : null,
            !compact && r.comments != null ? `${fmt(r.comments)} comments` : null,
          ].filter(Boolean);
          return (
            <li key={r.mediaId} className="reel-card">
              <a href={r.permalink} target="_blank" rel="noreferrer" aria-label={`Open reel ${i + 1} on Instagram`}>
                <span className="reel-media">
                  <Thumb creatorId={creatorId} reel={r} />
                  <span className="reel-rank">#{i + 1}</span>
                </span>
                {!compact ? <span className="reel-caption">{r.caption || "No caption"}</span> : null}
                {stats.length ? <span className="reel-stats">{stats.join(" · ")}</span> : null}
              </a>
            </li>
          );
        })}
      </ol>
      {status === "no_insights" && !compact ? (
        <p className="muted" style={{ fontSize: "0.78rem", marginTop: "0.5rem" }}>{EMPTY.no_insights}</p>
      ) : null}
    </div>
  );
}
