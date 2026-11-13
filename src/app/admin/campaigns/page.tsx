import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { formatIST, labelize } from "@/lib/format";
import { campaignApproval, isAdminApproved } from "@/server/access";
import { ReviewChip } from "@/components/admin/AdminActions";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; status?: string; brand?: string; approval?: string }>;

export default async function AdminCampaignsPage({ searchParams }: { searchParams: SP }) {
  await requirePageRole("admin");
  const { q = "", status = "", brand = "", approval = "" } = await searchParams;
  const db = await readDb();
  const brands = new Map(db.brands.map((b) => [b.id, b]));
  const needle = q.trim().toLowerCase();
  const rows = db.campaigns
    .filter((c) => !status || c.status === status)
    .filter((c) => !brand || c.brandId === brand)
    .filter((c) => !approval || campaignApproval(c) === approval)
    .filter(
      (c) =>
        !needle ||
        c.title.toLowerCase().includes(needle) ||
        (brands.get(c.brandId)?.businessName || "").toLowerCase().includes(needle) ||
        c.id.toLowerCase().includes(needle),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const statuses = Array.from(new Set(db.campaigns.map((c) => c.status))).sort();
  const brandOpts = Array.from(new Set(db.campaigns.map((c) => c.brandId)))
    .map((id) => ({ id, name: brands.get(id)?.businessName || id }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Campaigns</h1>
          <p className="adm-sub">
            {rows.length} of {db.campaigns.length} campaigns
          </p>
        </div>
        <Link href="/admin/campaigns/new" className="btn btn-primary">
          New campaign for a brand
        </Link>
      </div>

      <form className="adm-toolbar" method="get">
        <input className="input" type="search" name="q" defaultValue={q} placeholder="Search title or brand" aria-label="Search" />
        <select className="select" name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{labelize(s)}</option>
          ))}
        </select>
        <select className="select" name="approval" defaultValue={approval} aria-label="Approval">
          <option value="">Any approval</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="changes_requested">Changes requested</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="select" name="brand" defaultValue={brand} aria-label="Brand">
          <option value="">All brands</option>
          {brandOpts.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button className="btn btn-ghost btn-compact" type="submit">Filter</button>
        {(q || status || brand || approval) && (
          <Link href="/admin/campaigns" className="muted" style={{ fontSize: "0.8125rem", alignSelf: "center" }}>
            Clear
          </Link>
        )}
      </form>

      <div className="adm-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Brand</th>
              <th>Approval</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Slots</th>
              <th>Applications</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const apps = db.applications.filter((a) => a.campaignId === c.id);
              const pending = apps.filter((a) => (a.reviewStatus ?? "pending") === "pending").length;
              return (
                <tr key={c.id}>
                  <td>
                    <Link href={"/admin/bounties/" + c.id}>{c.title}</Link>
                  </td>
                  <td>{brands.get(c.brandId)?.businessName || "—"}</td>
                  <td><ReviewChip review={campaignApproval(c)} /></td>
                  <td>{labelize(c.status)}{c.fundedAt ? "" : " · unfunded"}</td>
                  <td className="adm-num">{formatINR(c.budgetPaise)}</td>
                  <td className="adm-num">{c.slots}</td>
                  <td className="adm-num">
                    {apps.filter(isAdminApproved).length}
                    {pending ? <span className="muted"> +{pending} pending</span> : null}
                  </td>
                  <td className="muted" style={{ fontSize: "0.8125rem" }}>{formatIST(c.createdAt)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">No campaigns match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
