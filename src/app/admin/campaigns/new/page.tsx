import Link from "next/link";
import { readDb } from "@/server/db/store";
import { CampaignForm } from "@/components/admin/AdminActions";
import { CRITERIA_PRESETS } from "@/server/eligibility/presets";

export const dynamic = "force-dynamic";

export default async function NewAdminCampaignPage() {
  const db = await readDb();
  const brands = db.brands
    .map((b) => ({ id: b.id, name: b.businessName, kyc: b.kycStatus }))
    .sort((a, b) => (a.kyc === "approved" ? 0 : 1) - (b.kyc === "approved" ? 0 : 1) || a.name.localeCompare(b.name));
  return (
    <div style={{ maxWidth: 760 }}>
      <Link href="/admin/campaigns" className="muted" style={{ fontSize: "0.85rem" }}>← Campaigns</Link>
      <h1 style={{ marginTop: 8 }}>New campaign for a brand</h1>
      <p className="adm-sub" style={{ maxWidth: "60ch" }}>
        Created campaigns are already approved by RedCup. They stay as a draft until the brand funds them from their dashboard, then go live.
      </p>
      <div className="adm-panel" style={{ marginTop: "1rem" }}>
        {brands.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>No brands yet.</p>
        ) : (
          <CampaignForm mode="create" brands={brands} presets={CRITERIA_PRESETS} />
        )}
      </div>
    </div>
  );
}
