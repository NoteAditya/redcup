import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatIST, labelize } from "@/lib/format";
import { targetInfo, userName } from "@/server/admin-data";
import { requirePageRole } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

const PAGE = 100;

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; page?: string }>;
}) {
  await requirePageRole("admin");
  const { q = "", action = "", page = "1" } = await searchParams;
  const db = await readDb();
  const needle = q.trim().toLowerCase();
  const all = db.adminActions
    .map((a) => ({ ...a, actor: userName(db, a.adminId), target: targetInfo(db, a.targetType, a.targetId) }))
    .filter((a) => !action || a.action === action)
    .filter((a) => {
      if (!needle) return true;
      return [a.actor, a.action, a.targetType, a.targetId, a.target.label, a.reason, a.details]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const p = Math.max(1, Number(page) || 1);
  const rows = all.slice((p - 1) * PAGE, p * PAGE);
  const actions = Array.from(new Set(db.adminActions.map((a) => a.action))).sort();
  const qs = (n: number) => `/admin/activity?${new URLSearchParams({ q, action, page: String(n) }).toString()}`;

  return (
    <div>
      <h1>Activity log</h1>
      <p className="adm-sub">Every admin decision, edit and status change. {all.length} entries.</p>
      <form className="adm-toolbar" method="get">
        <input className="input" type="search" name="q" defaultValue={q} placeholder="Search admin, target, reason" aria-label="Search activity" />
        <select className="select" name="action" defaultValue={action} aria-label="Action">
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>{labelize(a)}</option>
          ))}
        </select>
        <button className="btn btn-ghost btn-compact" type="submit">Search</button>
        {(q || action) && (
          <Link href="/admin/activity" className="muted" style={{ fontSize: "0.8125rem", alignSelf: "center" }}>Clear</Link>
        )}
      </form>
      <div className="adm-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>When (IST)</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Reason / details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="muted" style={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatIST(a.createdAt).replace(" IST", "")}</td>
                <td>{a.actor}</td>
                <td><span className="chip">{labelize(a.action)}</span></td>
                <td>
                  <span className="muted" style={{ fontSize: "0.75rem" }}>{a.targetType}</span>
                  <div>{a.target.href ? <Link href={a.target.href}>{a.target.label}</Link> : a.target.label}</div>
                </td>
                <td style={{ fontSize: "0.8125rem", maxWidth: "40ch" }}>
                  {a.reason && <div>“{a.reason}”</div>}
                  {a.details && <div className="muted">{a.details}</div>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="muted">No matching entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {all.length > PAGE && (
        <div className="adm-toolbar">
          {p > 1 && <Link className="btn btn-ghost btn-compact" href={qs(p - 1)}>Newer</Link>}
          {p * PAGE < all.length && <Link className="btn btn-ghost btn-compact" href={qs(p + 1)}>Older</Link>}
        </div>
      )}
    </div>
  );
}
