import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <Link href="/" className="logo" style={{ color: "#fff" }}>
              <span className="logo-mark" aria-hidden />
              <span>
                <span style={{ color: "var(--cup)" }}>Red</span>Cup
              </span>
            </Link>
            <p className="muted" style={{ marginTop: "0.85rem", maxWidth: "32ch", fontSize: "0.88rem" }}>
              Pay-for-results Instagram reel bounties. Brands fund upfront. Creators earn on approved posts and
              verified views.
            </p>
          </div>
          <div>
            <p className="footer-heading">Product</p>
            <ul>
              <li><Link href="/for-brands">For brands</Link></li>
              <li><Link href="/for-creators">For creators</Link></li>
              <li><Link href="/bounties">Open bounties</Link></li>
              <li><Link href="/creators">Creator directory</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer-heading">Company</p>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/signup">Create account</Link></li>
              <li><Link href="/login">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="footer-heading">Legal</p>
            <ul>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/refunds">Refunds</Link></li>
            </ul>
          </div>
        </div>
        <div className="site-footer-base">© {new Date().getFullYear()} RedCup. Built for Indian brands and creators.</div>
      </footer>
    </div>
  );
}
