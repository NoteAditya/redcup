import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { StatBars } from "@/components/ui/StatBars";
import { DailyBars } from "@/components/admin/Charts";
import { countBy, dailySeries, pendingCounts } from "@/server/admin-data";
import { campaignApproval } from "@/server/access";

export const dynamic = "force-dynamic";

function rate(approved: number, rejected: number) {
  const n = approved + rejected;
  return n === 0 ? "—" : `${Math.round((approved / n) * 100)}%`;
}

export default async function AdminHome() {
  const db = await readDb();
  const sum = (type: string) => db.ledger.filter((l) => l.type === type).reduce((a, l) => a + l.amountPaise, 0);
  const counts = pendingCounts(db);

  const appReviews = db.applications.map((a) => a.reviewStatus ?? "pending");
  const appApproved = appReviews.filter((r) => r === "approved").length;
  const appRejected = appReviews.filter((r) => r === "rejected").length;
  const campApprovals = db.campaigns.map(campaignApproval);
  const campApproved = campApprovals.filter((r) => r === "approved").length;
  const campRejected = campApprovals.filter((r) => r === "rejected").length;
  const brandApproved = db.brands.filter((b) => b.kycStatus === "approved").length;
  const brandRejected = db.brands.filter((b) => b.kycStatus === "rejected").length;
  const inactive = db.users.filter((u) => u.status === "inactive").length;

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Admin</h1>
          <p className="adm-sub">Live numbers from the RedCup database.</p>
        </div>
        <Link href="/admin/campaigns/new" className="btn btn-primary">
          New campaign for a brand
        </Link>
      </div>

      <dl className="app-kpi">
        <div>
          <dt>Waiting on you</dt>
          <dd>{counts.applications + counts.campaigns + counts.brands}</dd>
        </div>
        <div>
          <dt>Funded budget</dt>
          <dd>{formatINR(sum("funding"))}</dd>
        </div>
        <div>
          <dt>Creator payouts</dt>
          <dd>{formatINR(sum("earning"))}</dd>
        </div>
        <div>
          <dt>Commission + fees</dt>
          <dd>{formatINR(sum("commission") + sum("fee"))}</dd>
        </div>
      </dl>

      <div className="adm-grid" style={{ marginTop: 0 }}>
        <Link href="/admin/applications" className="adm-panel" style={{ display: "block" }}>
          <h3>Applications to review</h3>
          <div className="adm-num" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts.applications}</div>
          <p className="muted" style={{ margin: 0, fontSize: "0.8125rem" }}>Brands only see creators you approve.</p>
        </Link>
        <Link href="/admin/campaign-approvals" className="adm-panel" style={{ display: "block" }}>
          <h3>Campaigns to approve</h3>
          <div className="adm-num" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts.campaigns}</div>
          <p className="muted" style={{ margin: 0, fontSize: "0.8125rem" }}>Nothing goes live without approval.</p>
        </Link>
        <Link href="/admin/verification" className="adm-panel" style={{ display: "block" }}>
          <h3>Brands to approve</h3>
          <div className="adm-num" style={{ fontSize: "1.5rem", fontWeight: 700 }}>{counts.brands}</div>
          <p className="muted" style={{ margin: 0, fontSize: "0.8125rem" }}>Submitted profiles waiting for a decision.</p>
        </Link>
      </div>

      <div className="adm-grid">
        <div className="adm-panel">
          <DailyBars label="Signups" series={dailySeries(db.users.map((u) => u.createdAt))} />
        </div>
        <div className="adm-panel">
          <DailyBars label="Applications" series={dailySeries(db.applications.map((a) => a.appliedAt))} />
        </div>
      </div>

      <div className="adm-grid">
        <div className="adm-panel">
          <h3>Users by role</h3>
          <StatBars items={countBy(db.users, (u) => u.role)} />
          <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.8125rem" }}>
            {db.users.length} total · {inactive} turned off
          </p>
        </div>
        <div className="adm-panel">
          <h3>Campaigns by status</h3>
          <StatBars items={countBy(db.campaigns, (c) => c.status)} />
        </div>
        <div className="adm-panel">
          <h3>Applications by status</h3>
          <StatBars items={countBy(db.applications, (a) => a.status.toLowerCase())} />
        </div>
        <div className="adm-panel">
          <h3>Approval rates</h3>
          <dl className="adm-dl">
            <dt>Applications</dt>
            <dd className="adm-num">
              {rate(appApproved, appRejected)} <span className="muted">({appApproved} approved / {appRejected} rejected)</span>
            </dd>
            <dt>Campaigns</dt>
            <dd className="adm-num">
              {rate(campApproved, campRejected)} <span className="muted">({campApproved} / {campRejected})</span>
            </dd>
            <dt>Brands</dt>
            <dd className="adm-num">
              {rate(brandApproved, brandRejected)} <span className="muted">({brandApproved} / {brandRejected})</span>
            </dd>
          </dl>
          <p className="muted" style={{ margin: "0.75rem 0 0", fontSize: "0.75rem" }}>
            Share of decided items that were approved. Older records count as approved where they were already accepted.
          </p>
        </div>
      </div>
    </div>
  );
}
