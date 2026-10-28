import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const db = await readDb();
  const rows = db.ledger.filter((l) => l.type === "earning" || l.type === "commission");
  return (
    <div>
      <h1>Payouts</h1>
      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Amount</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.type}</td>
              <td>{formatINR(r.amountPaise)}</td>
              <td className="muted">{r.note}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="muted">
                No earnings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
