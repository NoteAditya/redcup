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
      <div style={{ marginBottom: "1.5rem" }}>
        <Link
          href="/bounties"
          style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
          }}
        >
          &larr; Back to all bounties
        </Link>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
            <span className="chip chip-ok">{campaign.status.toUpperCase()}</span>
            <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
              {brand?.businessName || "Verified Brand"}
            </span>
          </div>
          <h1>{campaign.title}</h1>
          {campaign.applicationClosesAt && (
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
              Applications close {formatIST(campaign.applicationClosesAt)}
            </p>
          )}
        </div>

        <Link href="/signup?role=creator" className="btn btn-accent">
          Apply to this Bounty
        </Link>
      </div>

      <div className="axis axis-2" style={{ gap: "1.75rem", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.75rem" }}>
            <h3>Campaign Brief</h3>
            <p style={{ whiteSpace: "pre-wrap", marginTop: "0.75rem", color: "var(--ink-secondary)", lineHeight: 1.6 }}>
              {campaign.brief}
            </p>

            {campaign.dosDonts && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--line)" }}>
                <h3>Creative Guidelines (Do &amp; Don&apos;t)</h3>
                <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem", color: "var(--muted)", lineHeight: 1.6 }}>
                  {campaign.dosDonts}
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div
            className="card"
            style={{
              padding: "1.75rem",
              backgroundColor: "var(--sheet)",
              boxShadow: "0 8px 24px -4px rgba(25, 22, 20, 0.06)",
            }}
          >
            <span className="chip chip-cup" style={{ marginBottom: "0.75rem" }}>
              Financial Terms
            </span>
            <h3 style={{ fontSize: "1.35rem" }}>Compensation &amp; Slots</h3>

            <div style={{ display: "grid", gap: "0.85rem", margin: "1.25rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--frame)" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Total Creator Pool</span>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--accent)" }}>
                  {formatINR(campaign.budgetPaise)}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--frame)" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Base Approved Reel Payout</span>
                <strong style={{ color: "var(--ink)" }}>{formatINR(campaign.basePaise)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--frame)" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Rate per 1,000 Views</span>
                <strong style={{ color: "var(--ink)" }}>{formatINR(campaign.ratePer1000Paise)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem", borderBottom: "1px solid var(--frame)" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Max Payout per Creator</span>
                <strong style={{ color: "var(--ink)" }}>{formatINR(campaign.capPerCreatorPaise)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--muted)", fontSize: "0.875rem" }}>Available Creator Slots</span>
                <strong style={{ color: "var(--ink)" }}>{campaign.slots} slots</strong>
              </div>
            </div>

            <Link href="/signup?role=creator" className="btn btn-accent" style={{ width: "100%", marginTop: "1rem" }}>
              Apply Now as Creator
            </Link>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
