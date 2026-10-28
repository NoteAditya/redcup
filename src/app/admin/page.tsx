import Link from "next/link";
import { readDb, dbMode } from "@/server/db/store";
import { formatINR } from "@/lib/money";

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
      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Funded budget (ledger)</h3>
          <p style={{ fontSize: "1.4rem", marginTop: 8 }}>{formatINR(funding)}</p>
        </div>
        <div className="card">
          <h3>Queues</h3>
          <ul style={{ marginTop: 8, paddingLeft: "1.1rem", lineHeight: 1.7 }}>
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
      </div>
      <h2 style={{ marginTop: "1.5rem" }}>Campaigns</h2>
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
    </div>
  );
}
