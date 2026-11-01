import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Contact — RedCup" };

export default function ContactPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "600px", margin: "1.5rem auto 3.5rem" }}>
        <h1 style={{ marginBottom: "0.75rem" }}>Get in Touch</h1>
        <p className="lede" style={{ marginBottom: "1.75rem" }}>
          Inquiries regarding campaign escrow, agency integration, or creator payments.
        </p>

        <div
          className="card"
          style={{
            padding: "1.75rem",
            display: "grid",
            gap: "1.25rem",
          }}
        >
          <div>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Direct Support
            </span>
            <div style={{ marginTop: "0.35rem", fontSize: "1.0625rem", fontWeight: 600, color: "var(--ink)" }}>
              <a href="mailto:thenoteaditya@gmail.com" style={{ textDecoration: "underline", textUnderlineOffset: "3px" }}>
                thenoteaditya@gmail.com
              </a>
            </div>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--muted)" }}>
              Brand onboarding, partner integrations, and creator escalation.
            </p>
          </div>

          <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
              Operating Hours
            </span>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "var(--ink-secondary)" }}>
              Monday &ndash; Saturday, 9:00 AM &ndash; 7:00 PM IST
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
