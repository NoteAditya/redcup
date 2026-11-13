import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/money";
import { formatIST, labelize } from "@/lib/format";
import { readDb } from "@/server/db/store";
import {
  ApplicationReviewTable,
  CampaignForm,
  CampaignReview,
  CampaignStatusControls,
  ReviewChip,
} from "@/components/admin/AdminActions";
import { appRows, targetInfo, userName } from "@/server/admin-data";
import { campaignApproval } from "@/server/access";
import { CRITERIA_PRESETS } from "@/server/eligibility/presets";

export const dynamic = "force-dynamic";

export default async function AdminBountyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await readDb();
  const campaign = db.campaigns.find((c) => c.id === id);
  if (!campaign) notFound();
  const brand = db.brands.find((b) => b.id === campaign.brandId);
  const approval = campaignApproval(campaign);
  const apps = db.applications
    .filter((a) => a.campaignId === id)
    .sort((a, b) => (b.fitScore ?? -1) - (a.fitScore ?? -1) || a.appliedAt.localeCompare(b.appliedAt));
  const rows = appRows(db, apps);
  const history = db.adminActions
    .filter((a) => a.targetId === id || apps.some((x) => x.id === a.targetId))
    .slice(-15)
    .reverse();

  return (
    <div>
      <Link href="/admin/campaigns" className="muted" style={{ fontSize: "0.85rem" }}>
        ← Campaigns
      </Link>
      <div className="adm-head" style={{ marginTop: 8 }}>
        <div>
          <h1>{campaign.title}</h1>
          <p className="adm-sub">
            {brand ? <Link href={"/admin/users/" + brand.userId}>{brand.businessName}</Link> : "Unknown brand"} ·{" "}
            {labelize(campaign.status)} · {formatINR(campaign.budgetPaise)} · {campaign.slots} slots ·{" "}
            {campaign.fundedAt ? "funded " + formatIST(campaign.fundedAt) : "not funded"}
          </p>
        </div>
        <ReviewChip review={approval} />
      </div>

      <div className="adm-grid">
        <div className="adm-panel">
          <h3>RedCup approval</h3>
          <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem" }}>
            {approval === "approved"
              ? "Approved. " + (campaign.fundedAt ? "Visible to creators while live." : "Goes live once the brand funds it.")
              : approval === "pending"
                ? campaign.fundedAt
                  ? "Funded and waiting for you. Approving puts it live."
                  : "Not funded yet. Approve now and it goes live as soon as the brand funds it."
                : approval === "changes_requested"
                  ? "Sent back to the brand. It returns here when they resubmit."
                  : "Rejected."}
            {campaign.approvalNote ? ` Last note: “${campaign.approvalNote}”` : ""}
          </p>
          {approval !== "approved" && approval !== "rejected" && <CampaignReview campaignId={campaign.id} />}
        </div>
        <div className="adm-panel">
          <h3>Status</h3>
          <CampaignStatusControls campaignId={campaign.id} status={campaign.status} />
        </div>
      </div>

      <h2 style={{ marginTop: "1.75rem" }}>Applications ({apps.length})</h2>
      <p className="adm-sub" style={{ marginBottom: "0.75rem" }}>
        The brand sees only approved ones. Pin or remove adjusts the next shortlist run.
      </p>
      <ApplicationReviewTable rows={rows} showOverrides />

      <div className="adm-grid" style={{ gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", alignItems: "start" }}>
        <div className="adm-panel">
          <h3>Edit campaign</h3>
          <CampaignForm
            mode="edit"
            campaignId={campaign.id}
            presets={CRITERIA_PRESETS}
            initial={{
              title: campaign.title,
              brief: campaign.brief,
              dosDonts: campaign.dosDonts,
              budgetPaise: campaign.budgetPaise,
              basePaise: campaign.basePaise,
              ratePer1000Paise: campaign.ratePer1000Paise,
              capPerCreatorPaise: campaign.capPerCreatorPaise,
              slots: campaign.slots,
              applicationClosesAt: campaign.applicationClosesAt,
              awardDeadlineAt: campaign.awardDeadlineAt,
              criteria: campaign.criteria,
            }}
          />
        </div>
        <div className="adm-panel">
          <h3>Recent activity</h3>
          {history.length === 0 && <p className="muted" style={{ margin: 0, fontSize: "0.8125rem" }}>No admin actions yet.</p>}
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem", fontSize: "0.8125rem" }}>
            {history.map((h) => (
              <li key={h.id}>
                <strong>{labelize(h.action)}</strong> · {userName(db, h.adminId)}
                <div className="muted">{formatIST(h.createdAt)}</div>
                {h.targetType === "application" && <div>{targetInfo(db, h.targetType, h.targetId).label}</div>}
                {h.reason && <div>“{h.reason}”</div>}
              </li>
            ))}
          </ul>
          <Link href={"/admin/activity?q=" + campaign.id} className="muted" style={{ fontSize: "0.8125rem", display: "inline-block", marginTop: "0.75rem" }}>
            Full log →
          </Link>
        </div>
      </div>
    </div>
  );
}
