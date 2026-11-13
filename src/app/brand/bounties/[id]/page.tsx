import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/money";
import { formatIST } from "@/lib/format";
import { AwardForm, DraftReviewButtons, FundButton, ResubmitForm, ShortlistButton } from "@/components/brand/CampaignActions";
import { BrandPendingScreen, getBrandAccess } from "@/components/brand/BrandGate";
import { brandCampaignLabel, brandVisibleApplications, campaignApproval } from "@/server/access";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export default async function BrandCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("brand");
  const { id } = await params;
  const { db, brand, approved } = await getBrandAccess();
  if (!approved) return <BrandPendingScreen brand={brand} />;
  const campaign = db.campaigns.find((c) => c.id === id);
  if (!brand || !campaign || campaign.brandId !== brand.id) notFound();
  const approval = campaignApproval(campaign);

  // Brands only ever see creators RedCup has approved for this campaign.
  const apps = brandVisibleApplications(db, campaign.id);
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
        {brandCampaignLabel(campaign)} · {formatINR(campaign.budgetPaise)}
        {campaign.awardDeadlineAt ? " · award by " + formatIST(campaign.awardDeadlineAt) : ""}
      </p>

      {approval !== "approved" && (
        <div className="adm-panel" style={{ marginTop: "1rem", maxWidth: 720 }}>
          <strong>
            {approval === "pending"
              ? "Waiting for RedCup approval"
              : approval === "changes_requested"
                ? "RedCup asked for changes"
                : "RedCup rejected this campaign"}
          </strong>
          <p className="muted" style={{ margin: "0.35rem 0 0", fontSize: "0.875rem" }}>
            {approval === "pending"
              ? "Creators can’t see this campaign until a RedCup admin approves it."
              : approval === "changes_requested"
                ? "Update the campaign and resubmit it for review."
                : "This campaign won’t go live."}
          </p>
          {campaign.approvalNote && (
            <p style={{ margin: "0.6rem 0 0", fontSize: "0.875rem" }}>Note from RedCup: “{campaign.approvalNote}”</p>
          )}
          {(approval === "pending" || approval === "changes_requested") && (
            <ResubmitForm
              campaignId={campaign.id}
              initial={{ title: campaign.title, brief: campaign.brief, dosDonts: campaign.dosDonts }}
              resubmit={approval === "changes_requested"}
            />
          )}
        </div>
      )}
      {campaign.status === "draft" && !campaign.fundedAt && approval !== "rejected" && (
        <div className="adm-panel" style={{ marginTop: "1rem", maxWidth: 720 }}>
          <strong>Not funded yet</strong>
          <p className="muted" style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.875rem" }}>
            {approval === "approved"
              ? "RedCup approved this campaign. Fund it to put it live."
              : "You can fund now. It goes live once RedCup approves it."}
          </p>
          <FundButton campaignId={campaign.id} />
        </div>
      )}

      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Applications ({apps.length})</h3>
          <p className="muted" style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem" }}>
            Creators appear here once RedCup approves them.
          </p>
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
                    No approved creators yet.
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
