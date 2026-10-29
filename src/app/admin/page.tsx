import Link from "next/link";
import { readDb, dbMode } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { StatBars } from "@/components/ui/StatBars";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = await readDb();
  const funding = db.ledger.filter((l) => l.type === "funding").reduce((a, l) => a + l.amountPaise, 0);
  return (
    <div>
      <h1>Admin</h1>
      <p className="muted" style={{ marginTop: 4 }}>
        Store mode: {dbMode()} · users {db.users.length} · campaigns {db.campaigns.length} · apps{" "}
        {db.applications.length}
      </p>
      <dl className="app-kpi">
        <div>
          <dt>Funded budget</dt>
          <dd>{formatINR(funding)}</dd>
        </div>
        <div>
          <dt>Users</dt>
          <dd>{db.users.length}</dd>
        </div>
        <div>
          <dt>Campaigns</dt>
          <dd>{db.campaigns.length}</dd>
        </div>
      </dl>
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ marginBottom: "0.5rem" }}>Queues</h3>
        <ul style={{ margin: 0, paddingLeft: "1.1rem", lineHeight: 1.7 }}>
          <li>
            <Link href="/admin/verification">KYC + reel verification</Link>
          </li>
          <li>
            <Link href="/admin/metrics">Manual metrics</Link>
          </li>
          <li>
            <Link href="/admin/payouts">Payouts</Link>
          </li>
        </ul>
      </div>
      <h2>Campaigns</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          {db.campaigns.map((c) => (
            <tr key={c.id}>
              <td>
                <Link href={"/admin/bounties/" + c.id}>{c.title}</Link>
              </td>
              <td>{c.status}</td>
              <td>{formatINR(c.budgetPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginBottom: "0.75rem" }}>Campaign status</h2>
        <StatBars
          items={Object.entries(
            db.campaigns.reduce<Record<string, number>>((acc, c) => {
              acc[c.status] = (acc[c.status] || 0) + 1;
              return acc;
            }, {}),
          ).map(([label, value]) => ({ label, value }))}
        />
      </div>
    </div>
  );
}
