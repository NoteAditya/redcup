import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";
import { formatIST } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function BountyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const campaign = db.campaigns.find((c) => c.slug === slug);
  if (!campaign) notFound();
  const brand = db.brands.find((b) => b.id === campaign.brandId);

  return (
    <MarketingShell>
      <Link href="/bounties" className="muted" style={{ fontSize: "0.85rem" }}>
        ← All bounties
      </Link>
      <h1 style={{ marginTop: "0.75rem" }}>{campaign.title}</h1>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {brand?.businessName} · {campaign.status}
        {campaign.applicationClosesAt ? " · applies close " + formatIST(campaign.applicationClosesAt) : ""}
      </p>
      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Brief</h3>
          <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>{campaign.brief}</p>
          {campaign.dosDonts && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Do / don't</h3>
              <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }} className="muted">
                {campaign.dosDonts}
              </p>
            </>
          )}
        </div>
        <div className="card">
          <h3>Money</h3>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", lineHeight: 1.7 }}>
            <li>Budget {formatINR(campaign.budgetPaise)}</li>
            <li>Base {formatINR(campaign.basePaise)}</li>
            <li>Rate {formatINR(campaign.ratePer1000Paise)} / 1K views</li>
            <li>Cap per creator {formatINR(campaign.capPerCreatorPaise)}</li>
            <li>{campaign.slots} slots</li>
          </ul>
          <Link href="/signup?role=creator" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Apply as creator
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
