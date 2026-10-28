import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/money";
import { formatIST } from "@/lib/format";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { AwardForm, DraftReviewButtons, ShortlistButton } from "@/components/brand/CampaignActions";

export const dynamic = "force-dynamic";

export default async function BrandCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId);
  const campaign = db.campaigns.find((c) => c.id === id);
  if (!brand || !campaign || campaign.brandId !== brand.id) notFound();

  const apps = db.applications.filter((a) => a.campaignId === campaign.id);
  const creators = new Map(db.creators.map((c) => [c.id, c]));
  const shortlisted = apps
    .filter((a) => a.status === "SHORTLISTED")
    .map((a) => ({
      id: a.id,
      label: creators.get(a.creatorId)?.displayName || a.creatorId,
      fit: a.fitScore,
    }));
  const drafts = db.drafts.filter((d) => apps.some((a) => a.id === d.applicationId));

  return (
    <div>
      <Link href="/brand" className="muted" style={{ fontSize: "0.85rem" }}>
        ← Dashboard
      </Link>
      <h1 style={{ marginTop: "0.5rem" }}>{campaign.title}</h1>
      <p className="muted">
        {campaign.status} · {formatINR(campaign.budgetPaise)}
        {campaign.awardDeadlineAt ? " · award by " + formatIST(campaign.awardDeadlineAt) : ""}
      </p>

      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Applications ({apps.length})</h3>
          <table className="table" style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Status</th>
                <th>Fit</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td>{creators.get(a.creatorId)?.displayName || a.creatorId}</td>
                  <td>{a.status}</td>
                  <td>{a.fitScore ?? "—"}</td>
                </tr>
              ))}
              {apps.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    Waiting for creators to apply.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {(campaign.status === "live" || campaign.status === "applications_closed") && apps.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <ShortlistButton campaignId={campaign.id} />
            </div>
          )}
        </div>
        <div>
          {campaign.status === "shortlisted" && (
            <AwardForm campaignId={campaign.id} shortlisted={shortlisted} slots={campaign.slots} />
          )}
          <div className="card" style={{ marginTop: campaign.status === "shortlisted" ? "1rem" : 0 }}>
            <h3>Drafts</h3>
            {drafts.length === 0 && <p className="muted" style={{ marginTop: 8 }}>No drafts yet.</p>}
            {drafts.map((d) => (
              <div key={d.id} style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
                <div>
                  v{d.version} · {d.reviewStatus}
                </div>
                <p className="muted" style={{ fontSize: "0.85rem" }}>
                  {d.caption}
                </p>
                {d.reviewStatus === "pending" && <DraftReviewButtons draftId={d.id} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
