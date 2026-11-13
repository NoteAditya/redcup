import Link from "next/link";
import { readDb } from "@/server/db/store";
import { ApplicationReviewTable } from "@/components/admin/AdminActions";
import { appRows } from "@/server/admin-data";

export const dynamic = "force-dynamic";

type SP = Promise<{ campaign?: string; review?: string; q?: string }>;

export default async function ApplicationsQueuePage({ searchParams }: { searchParams: SP }) {
  const { campaign = "", review = "pending", q = "" } = await searchParams;
  const db = await readDb();
  const needle = q.trim().toLowerCase();
  const filtered = db.applications
    .filter((a) => !campaign || a.campaignId === campaign)
    .filter((a) => review === "all" || (a.reviewStatus ?? "pending") === review)
    .sort((a, b) => a.appliedAt.localeCompare(b.appliedAt));
  const rows = appRows(db, filtered).filter(
    (r) => !needle || r.creatorName.toLowerCase().includes(needle) || r.handle.toLowerCase().includes(needle),
  );
  const campaignsWithApps = Array.from(new Set(db.applications.map((a) => a.campaignId)))
    .map((id) => db.campaigns.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .sort((a, b) => a.title.localeCompare(b.title));
  const pendingTotal = db.applications.filter((a) => (a.reviewStatus ?? "pending") === "pending").length;

  return (
    <div>
      <h1>Applications</h1>
      <p className="adm-sub">
        Every creator application lands here first. Brands only see a creator after you approve them. {pendingTotal} waiting.
      </p>

      <form className="adm-toolbar" method="get">
        <input className="input" type="search" name="q" defaultValue={q} placeholder="Search creator" aria-label="Search creator" />
        <select className="select" name="campaign" defaultValue={campaign} aria-label="Campaign">
          <option value="">All campaigns</option>
          {campaignsWithApps.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <select className="select" name="review" defaultValue={review} aria-label="Review state">
          <option value="pending">Pending review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
        <button className="btn btn-ghost btn-compact" type="submit">Filter</button>
        {(campaign || q || review !== "pending") && (
          <Link href="/admin/applications" className="muted" style={{ fontSize: "0.8125rem", alignSelf: "center" }}>
            Reset
          </Link>
        )}
      </form>

      <ApplicationReviewTable rows={rows} showCampaign />
    </div>
  );
}
