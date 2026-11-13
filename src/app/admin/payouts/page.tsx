import Link from "next/link";
import { formatINR } from "@/lib/money";
import { formatIST } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const db = await readDb();
  const rows = db.ledger
    .filter((l) => l.type === "earning" || l.type === "commission")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const creators = new Map(db.creators.map((c) => [c.id, c]));
  const campaigns = new Map(db.campaigns.map((c) => [c.id, c]));
  const total = (t: string) => rows.filter((r) => r.type === t).reduce((a, r) => a + r.amountPaise, 0);
  return (
    <div>
      <h1>Payouts</h1>
      <p className="adm-sub">Read-only ledger of creator earnings and RedCup commission.</p>
      <dl className="app-kpi">
        <div><dt>Creator earnings</dt><dd>{formatINR(total("earning"))}</dd></div>
        <div><dt>Commission</dt><dd>{formatINR(total("commission"))}</dd></div>
        <div><dt>Entries</dt><dd>{rows.length}</dd></div>
      </dl>
      <div className="adm-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>When (IST)</th>
              <th>Type</th>
              <th>Creator</th>
              <th>Campaign</th>
              <th>Amount</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cr = r.creatorId ? creators.get(r.creatorId) : null;
              const c = r.campaignId ? campaigns.get(r.campaignId) : null;
              return (
                <tr key={r.id}>
                  <td className="muted" style={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{formatIST(r.createdAt).replace(" IST", "")}</td>
                  <td>{r.type}</td>
                  <td>{cr ? <Link href={"/admin/creators/" + cr.id}>{cr.displayName}</Link> : "—"}</td>
                  <td>{c ? <Link href={"/admin/bounties/" + c.id}>{c.title}</Link> : "—"}</td>
                  <td className="adm-num">{formatINR(r.amountPaise)}</td>
                  <td className="muted">{r.note}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={6} className="muted">No earnings yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
