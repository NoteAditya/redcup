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
                  marginTop: "0.85rem",
                  maxWidth: "32ch",
                  fontSize: "0.875rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.6,
                }}
              >
                Escrow-backed creator campaigns and verified view payouts for Instagram reels.
              </p>
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
            <div>&copy; {new Date().getFullYear()} RedCup Protocol. All rights reserved.</div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <span>100% Escrow Protection</span>
              <span>•</span>
              <span>Official Instagram Graph API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
