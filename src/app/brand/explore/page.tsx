import Link from "next/link";
import { after } from "next/server";
import { syncTopReels, topReelsStale } from "@/server/instagram-sync";
import { requirePageRole } from "@/server/auth/guard";
import { BrandPendingScreen, getBrandAccess } from "@/components/brand/BrandGate";
import { CATEGORIES } from "@/lib/categories";
import { exploreCreators, type ExploreSort } from "@/server/explore";
import { CreatorAvatar } from "@/components/creator/CreatorAvatar";
import { TopReels } from "@/components/creator/TopReels";

export const dynamic = "force-dynamic";

const SORTS: { key: ExploreSort; label: string }[] = [
  { key: "followers", label: "Most followers" },
  { key: "engagement", label: "Engagement" },
  { key: "views", label: "Top reel views" },
];

const n = (v: number | null | undefined) =>
  v == null ? "—" : v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : String(v);

export default async function BrandExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string; sort?: string }>;
}) {
  await requirePageRole("brand");
  const { db, brand, approved } = await getBrandAccess();
  if (!approved) return <BrandPendingScreen brand={brand} />;
  const sp = await searchParams;
  const niche = sp.niche && (CATEGORIES as readonly string[]).includes(sp.niche) ? sp.niche : null;
  const sort: ExploreSort = SORTS.some((s) => s.key === sp.sort) ? (sp.sort as ExploreSort) : "followers";
  const rows = exploreCreators(db, { niche, sort });
  // Keep the reels cache warm for the first few cards (a few at a time to respect Instagram's limits).
  const stale = rows.slice(0, 12).filter((r) => topReelsStale(r.creator.instagram)).slice(0, 3).map((r) => r.creator.id);
  if (stale.length) after(async () => {
    for (const cid of stale) await syncTopReels(cid).catch(() => null);
  });
  const href = (p: { niche?: string | null; sort?: string }) => {
    const q = new URLSearchParams();
    const nn = p.niche === undefined ? niche : p.niche;
    const ss = p.sort ?? sort;
    if (nn) q.set("niche", nn);
    if (ss !== "followers") q.set("sort", ss);
    const s = q.toString();
    return "/brand/explore" + (s ? `?${s}` : "");
  };

  return (
    <div className="explore">
      <div className="profile-page-head">
        <span className="chip">Explore</span>
        <h1>Find creators by niche</h1>
        <p className="muted">
          Real Instagram numbers from creators on RedCup. Explore is for discovery: creators reach you by applying to your
          campaigns, and you see applicants once RedCup approves them.
        </p>
      </div>

      <form className="explore-filters" action="/brand/explore">
        <label className="field">
          <span className="field-label">Niche</span>
          <select name="niche" className="field-control" defaultValue={niche ?? ""}>
            <option value="">All niches</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Sort by</span>
          <select name="sort" className="field-control" defaultValue={sort}>
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary btn-compact">
          Apply
        </button>
      </form>

      <nav className="explore-tabs" aria-label="Niches">
        <Link href={href({ niche: null })} className={!niche ? "is-on" : undefined} aria-current={!niche ? "page" : undefined}>
          All
        </Link>
        {CATEGORIES.filter((c) => c !== "Other").map((c) => (
          <Link key={c} href={href({ niche: c })} className={niche === c ? "is-on" : undefined} aria-current={niche === c ? "page" : undefined}>
            {c}
          </Link>
        ))}
      </nav>

      <p className="muted" style={{ fontSize: "0.85rem", margin: "0.75rem 0" }}>
        {rows.length} creator{rows.length === 1 ? "" : "s"}
        {niche ? ` in ${niche}` : ""} · sorted by {SORTS.find((s) => s.key === sort)!.label.toLowerCase()}
      </p>

      {rows.length === 0 ? (
        <div className="bento-tile muted">No creators{niche ? ` in ${niche}` : ""} yet. Try another niche.</div>
      ) : (
        <ul className="explore-grid">
          {rows.map(({ creator: c, metrics: m }, i) => {
            const ig = c.instagram!;
            return (
              <li key={c.id} className="creator-card">
                <Link href={`/brand/creators/${c.id}`} className="creator-card-link" aria-label={`Open ${c.displayName}'s profile`} />
                <div className="creator-card-head">
                  <CreatorAvatar creatorId={c.id} name={c.displayName} hasInstagram={Boolean(ig.profilePictureUrl)} size={52} />
                  <div style={{ minWidth: 0 }}>
                    <strong className="creator-card-name">{c.displayName}</strong>
                    <div className="muted creator-card-handle">@{ig.username}</div>
                  </div>
                  {i < 3 ? <span className="creator-card-rank">#{i + 1}</span> : null}
                </div>
                <div className="bento-chips">
                  {c.categories.slice(0, 3).map((x) => (
                    <span key={x} className={x === niche ? "chip chip-cup" : "chip"}>
                      {x}
                    </span>
                  ))}
                </div>
                <dl className="creator-card-stats">
                  <div>
                    <dt>Followers</dt>
                    <dd>{n(ig.followers ?? m?.followers)}</dd>
                  </div>
                  <div>
                    <dt>Engagement</dt>
                    <dd>{m?.engagementRate10 != null ? `${(m.engagementRate10 * 100).toFixed(1)}%` : "—"}</dd>
                  </div>
                  <div>
                    <dt>City</dt>
                    <dd>{c.city || "—"}</dd>
                  </div>
                </dl>
                <TopReels creatorId={c.id} reels={ig.topReels} status={ig.topReelsStatus ?? (ig.tokenSealed ? "pending" : "no_token")} compact limit={3} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
