import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function CreatorApplicationsPage() {
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const apps = db.applications.filter((a) => a.creatorId === creator?.id);
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));

  return (
    <div>
      <h1>Applications</h1>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        {apps.length === 0 && <div className="card muted">No applications yet.</div>}
        {apps.map((a) => (
          <Link key={a.id} href={"/creator/applications/" + a.id} className="card" style={{ display: "block" }}>
            <strong>{campaigns.get(a.campaignId)?.title || a.campaignId}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
              {a.status}
              {a.fitScore != null ? " · Fit " + a.fitScore : ""}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
