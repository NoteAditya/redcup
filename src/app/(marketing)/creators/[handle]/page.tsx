import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatFollowers } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function CreatorPublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const db = await readDb();
  const creator = db.creators.find((c) => c.handle === handle);
  if (!creator) notFound();
  const m = db.creatorMetrics.find((x) => x.creatorId === creator.id);

  return (
    <MarketingShell>
      <h1>{creator.displayName}</h1>
      <p className="muted">@{creator.handle} · {creator.level} · {creator.city || "India"}</p>
      <div className="card" style={{ marginTop: "1rem" }}>
        <div>Categories: {creator.categories.join(", ") || "—"}</div>
        <div style={{ marginTop: 8 }}>Languages: {creator.languages.join(", ") || "—"}</div>
        {m && (
          <div style={{ marginTop: 8 }} className="muted">
            {formatFollowers(m.followers)} followers
            {m.avgReelViews10 != null ? " · avg reel views " + formatFollowers(m.avgReelViews10) : ""}
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
