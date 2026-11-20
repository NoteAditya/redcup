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
                Creator campaigns where brands pay for real results and creators get paid fairly.
              </p>
            </div>

            <div>
              <p>Product</p>
              <ul>
                <li>
                  <Link href="/for-brands">For brands</Link>
                </li>
                <li>
                  <Link href="/for-creators">For creators</Link>
                </li>
                <li>
                  <Link href="/bounties">Open Campaigns</Link>
                </li>
              </ul>
            </div>

            <div>
              <p>Company</p>
              <ul>
                <li>
                  <Link href="/about">About RedCup</Link>
                </li>
                <li>
                  <Link href="/for-brands#how-it-works">How payments work</Link>
                </li>
                <li>
                  <Link href="/for-brands#calculator">Pricing</Link>
                </li>
                <li>
                  <Link href="/signup?role=brand">Brand Verification</Link>
                </li>
              </ul>
            </div>

            <div>
              <p>Legal</p>
              <ul>
                <li>
                  <Link href="/terms">Terms of Use</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/data-deletion">Data Deletion</Link>
                </li>
                <li>
                  <Link href="/refunds">Refund and Cancellation Policy</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Support</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="site-footer-base">
            <div>&copy; {new Date().getFullYear()} RedCup is a brand of Luvante Group LLP · 455 Azadpura, Lalitpur, Uttar Pradesh 284403 · GSTIN 09AANFL1867F1ZZ · <a href="mailto:contact@redcup.in">contact@redcup.in</a> · <a href="tel:+919129620385">+91 9129620385</a></div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <span>Budget held by Razorpay</span>
              <span aria-hidden="true">•</span>
              <span>Views checked with Instagram data</span>
              <span aria-hidden="true">•</span>
              <span>Creators paid by UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
