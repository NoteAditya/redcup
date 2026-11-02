import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({
  children,
  fullWidth = false,
}: {
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell-main">
        {fullWidth ? children : <div className="shell-container">{children}</div>}
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-cols">
            <div>
              <Link href="/" className="logo">
                <span className="logo-mark" aria-hidden="true" />
                <span>RedCup</span>
              </Link>
              <p
                style={{
                  marginTop: "1rem",
                  maxWidth: "34ch",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                  lineHeight: 1.65,
                }}
              >
                The escrow protocol for performance creator reels. Zero retainer waste, verified Instagram views, and instant UPI settlements.
              </p>
              <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem" }}>
                <span className="chip" style={{ fontSize: "0.75rem", background: "var(--paper-subtle)" }}>
                  RBI-Compliant Escrow
                </span>
                <span className="chip" style={{ fontSize: "0.75rem", background: "var(--paper-subtle)" }}>
                  Meta Graph API
                </span>
              </div>
            </div>

            <div>
              <p>Platform</p>
              <ul>
                <li>
                  <Link href="/for-brands">For Brands</Link>
                </li>
                <li>
                  <Link href="/for-creators">For Creators</Link>
                </li>
                <li>
                  <Link href="/bounties">Open Bounties</Link>
                </li>
                <li>
                  <Link href="/creators">Creator Directory</Link>
                </li>
              </ul>
            </div>

            <div>
              <p>Architecture</p>
              <ul>
                <li>
                  <Link href="/about">About RedCup</Link>
                </li>
                <li>
                  <Link href="/for-brands#escrow">Escrow Mechanics</Link>
                </li>
                <li>
                  <Link href="/for-brands#pricing">Fee Structure (15%)</Link>
                </li>
                <li>
                  <Link href="/signup?role=brand">Brand Verification</Link>
                </li>
              </ul>
            </div>

            <div>
              <p>Legal &amp; Trust</p>
              <ul>
                <li>
                  <Link href="/terms">Terms of Service</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/refunds">Escrow &amp; Refund SLA</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Support</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="site-footer-base">
            <div>&copy; {new Date().getFullYear()} RedCup Protocol. Registered under Indian commercial guidelines.</div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span>100% Escrow Protection</span>
              <span aria-hidden="true">•</span>
              <span>Official Instagram Graph API</span>
              <span aria-hidden="true">•</span>
              <span>Direct UPI Settlement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
