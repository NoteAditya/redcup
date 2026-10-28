import { readDb } from "@/server/db/store";
import { KycButtons } from "@/components/admin/AdminActions";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const db = await readDb();
  const pending = db.brands.filter((b) => b.kycStatus === "submitted" || b.kycStatus === "not_submitted");
  return (
    <div>
      <h1>Verification</h1>
      <p className="muted" style={{ marginTop: 4 }}>Brand KYC queue</p>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        {pending.length === 0 && <div className="card muted">No pending KYC.</div>}
        {pending.map((b) => (
          <div key={b.id} className="card">
            <strong>{b.businessName}</strong>
            <div className="muted" style={{ fontSize: "0.85rem", margin: "4px 0 10px" }}>
              {b.gstin || "No GSTIN"} · {b.city} · {b.kycStatus}
            </div>
            <KycButtons brandId={b.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
