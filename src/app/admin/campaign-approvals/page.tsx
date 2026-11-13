import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { formatIST, labelize } from "@/lib/format";
import { CampaignReview, ReviewChip } from "@/components/admin/AdminActions";
import { campaignApproval } from "@/server/access";

export const dynamic = "force-dynamic";

export default async function CampaignApprovalsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show = "pending" } = await searchParams;
  const db = await readDb();
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const list = db.campaigns
    .filter((c) => {
      const ap = campaignApproval(c);
      return show === "changes" ? ap === "changes_requested" : ap === "pending";
    })
    .sort((a, b) => Number(Boolean(b.fundedAt)) - Number(Boolean(a.fundedAt)) || a.createdAt.localeCompare(b.createdAt));
  const changesCount = db.campaigns.filter((c) => campaignApproval(c) === "changes_requested").length;

  return (
    <div>
      <h1>Campaign approvals</h1>
      <p className="adm-sub">
        Every campaign a brand creates waits here. It only becomes visible to creators after you approve it.
      </p>
      <div className="adm-toolbar">
        <Link href="/admin/campaign-approvals" className={show !== "changes" ? "btn btn-primary btn-compact" : "btn btn-ghost btn-compact"}>
          Pending
        </Link>
        <Link href="/admin/campaign-approvals?show=changes" className={show === "changes" ? "btn btn-primary btn-compact" : "btn btn-ghost btn-compact"}>
          Sent back ({changesCount})
        </Link>
      </div>
      {list.length === 0 && <div className="adm-panel muted">Nothing waiting.</div>}
      {list.map((c) => {
        const brand = brands.get(c.brandId);
        return (
          <div key={c.id} className="adm-panel">
            <div className="adm-head">
              <div>
                <h3 style={{ marginBottom: 4 }}>
                  <Link href={"/admin/bounties/" + c.id}>{c.title}</Link>
                </h3>
                <div className="muted" style={{ fontSize: "0.8125rem" }}>
                  {brand?.businessName ?? "Unknown brand"} ({labelize(brand?.kycStatus ?? "—")}) · {formatINR(c.budgetPaise)} ·{" "}
                  {c.slots} slots · {labelize(c.status)} · {c.fundedAt ? "funded" : "not funded"} · created {formatIST(c.createdAt)}
                </div>
              </div>
              <ReviewChip review={campaignApproval(c)} />
            </div>
            <p style={{ margin: "0.75rem 0", fontSize: "0.875rem", whiteSpace: "pre-wrap", maxWidth: "75ch" }}>{c.brief}</p>
            {c.dosDonts && (
              <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", whiteSpace: "pre-wrap" }}>
                Do/don&apos;t: {c.dosDonts}
              </p>
            )}
            {c.approvalNote && (
              <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem" }}>Last note: “{c.approvalNote}”</p>
            )}
            {show !== "changes" && <CampaignReview campaignId={c.id} />}
          </div>
        );
      })}
    </div>
  );
}
