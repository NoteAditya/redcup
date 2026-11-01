import Link from "next/link";
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
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/creators"
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          &larr; Back to Creator Directory
        </Link>
      </div>

      <div
        className="card"
        style={{
          padding: "2.5rem",
          backgroundColor: "var(--sheet)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 8px 30px -4px rgba(25, 22, 20, 0.06)",
          maxWidth: "800px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div
            style={{
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "var(--radius-pill)",
              backgroundColor: "var(--accent-soft)",
              color: "var(--accent)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.75rem",
            }}
          >
            {creator.displayName.charAt(0)}
          </div>
          <div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <h1>{creator.displayName}</h1>
              <span className="chip chip-ok">{creator.level}</span>
            </div>
            <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "1rem" }}>
              @{creator.handle} &bull; {creator.city || "India"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
            padding: "1.5rem",
            backgroundColor: "var(--surface-tint)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Followers</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)" }}>
              {m ? formatFollowers(m.followers) : "Verified"}
            </div>
          </div>
          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>Avg Reel Views (Last 10)</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)" }}>
              {m?.avgReelViews10 != null ? formatFollowers(m.avgReelViews10) : "Calibrating"}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: "1rem", marginTop: "2rem" }}>
          <div>
            <strong style={{ fontSize: "0.875rem", color: "var(--muted)", display: "block" }}>
              Content Categories
            </strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
              {creator.categories.length > 0 ? (
                creator.categories.map((cat) => (
                  <span key={cat} className="chip">
                    {cat}
                  </span>
                ))
              ) : (
                <span className="muted">General Creator</span>
              )}
            </div>
          </div>

          <div>
            <strong style={{ fontSize: "0.875rem", color: "var(--muted)", display: "block" }}>
              Languages
            </strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.4rem" }}>
              {creator.languages.length > 0 ? (
                creator.languages.map((lang) => (
                  <span key={lang} className="chip">
                    {lang}
                  </span>
                ))
              ) : (
                <span className="muted">English, Hindi</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
