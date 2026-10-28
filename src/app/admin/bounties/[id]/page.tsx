import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";
import { OverrideButtons } from "@/components/admin/AdminActions";

export const dynamic = "force-dynamic";

export default async function AdminBountyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const campaign = db.campaigns.find((c) => c.id === id);
  if (!campaign) notFound();
  const apps = db.applications.filter((a) => a.campaignId === id);
  const creators = new Map(db.creators.map((c) => [c.id, c]));

  return (
    <div>
      <Link href="/admin" className="muted" style={{ fontSize: "0.85rem" }}>
        ← Overview
      </Link>
      <h1 style={{ marginTop: 8 }}>{campaign.title}</h1>
      <p className="muted">
        {campaign.status} · {formatINR(campaign.budgetPaise)}
      </p>
      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Creator</th>
            <th>Status</th>
            <th>Fit</th>
            <th>Override</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id}>
              <td>{creators.get(a.creatorId)?.displayName}</td>
              <td>{a.status}</td>
              <td>{a.fitScore ?? "—"}</td>
              <td>
                <OverrideButtons applicationId={a.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
