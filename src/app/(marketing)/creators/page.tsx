import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatFollowers } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Creator Directory — Verified Instagram Creators" };
export const dynamic = "force-dynamic";

export default async function CreatorsDirectoryPage() {
  const db = await readDb();
  const metrics = new Map(db.creatorMetrics.map((m) => [m.creatorId, m]));

  return (
    <MarketingShell>
      <div style={{ maxWidth: "700px", marginBottom: "2.5rem" }}>
        <p className="kicker">Creator Index</p>
        <h1 style={{ marginBottom: "0.65rem" }}>Verified Instagram Creators</h1>
        <p className="lede">
          Directory of verified Indian creators with authenticated Instagram profiles, audience demographics, and tracked reel performance history.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {db.creators.length === 0 && (
          <div className="card muted" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            No creators registered yet.
          </div>
        )}
        {db.creators.map((c) => {
          const m = metrics.get(c.id);
          return (
            <Link
              key={c.id}
              href={"/creators/" + c.handle}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
                transition: "border-color 120ms ease, box-shadow 120ms ease",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "var(--radius-card)",
                      backgroundColor: "var(--frame)",
                      color: "var(--ink)",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                    }}
                  >
                    {c.displayName.charAt(0)}
                  </div>
                  <div>
                    <strong style={{ fontSize: "0.9375rem", color: "var(--ink)", display: "block" }}>
                      {c.displayName}
                    </strong>
                    <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>@{c.handle}</span>
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.85rem" }}>
                  <span className="chip chip-ok">{c.level}</span>
                  {c.city && <span className="chip">{c.city}</span>}
                </div>
              </div>

              <div
                style={{
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8125rem",
                  color: "var(--muted)",
                }}
              >
                <span>Audience</span>
                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
                  {m ? formatFollowers(m.followers) : "Verified"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </MarketingShell>
  );
}
