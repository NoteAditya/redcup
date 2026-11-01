import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Refund Policy — RedCup" };

export default function RefundsPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "780px", margin: "2rem auto 4rem" }}>
        <p className="kicker">Escrow &amp; Payout Terms</p>
        <h1 style={{ marginBottom: "1rem" }}>Refund Policy</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>Last updated: November 2026</p>

        <div className="card" style={{ padding: "2.5rem", display: "grid", gap: "1.75rem", lineHeight: 1.7 }}>
          <div>
            <h3>1. Unallocated Campaign Budgets</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              If a campaign does not receive sufficient qualified creator applications within the application window, the unallocated portion of the creator budget is fully refundable to the brand&apos;s source account.
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>2. Creator Non-Delivery &amp; Breach</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              If an awarded creator fails to submit their draft within the stipulated deadline or refuses requested revisions within policy guidelines, the slot is cancelled and escrow funds return to the campaign balance.
            </p>
          </div>

          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h3>3. Processing Timeline</h3>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Approved escrow refunds are processed via our banking partners within 5 to 7 business days back to the original source bank account or corporate card.
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
