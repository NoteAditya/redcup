import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <SiteHeader />
      <main className="shell-main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-mark" aria-hidden>
            {"REDCUP.".split("").map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </div>
          <div className="footer-cols">
            <div>
              <Link href="/" className="logo" style={{ color: "#fff" }}>
                <span className="logo-mark" aria-hidden />
                <span>
                  <span style={{ color: "#f0a8a8" }}>Red</span>Cup
                </span>
              </Link>
              <p className="muted" style={{ marginTop: "0.85rem", maxWidth: "32ch", fontSize: "0.95rem" }}>
                Pay-for-results Instagram reel bounties. Brands fund upfront. Creators earn on approved posts and
                verified views.
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
                  <Link href="/bounties">Open bounties</Link>
                </li>
                <li>
                  <Link href="/creators">Creator directory</Link>
                </li>
              </ul>
            </div>
            <div>
              <p>Company</p>
              <ul>
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/signup">Create account</Link>
                </li>
                <li>
                  <Link href="/login">Sign in</Link>
                </li>
              </ul>
            </div>
            <div>
              <p>Legal</p>
              <ul>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/refunds">Refunds</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="site-footer-base">
          <span>© {new Date().getFullYear()} RedCup. Built for Indian brands and creators.</span>
          <p className="site-footer-credits">
            Photos: Electric Cinema film cans (CC0 / Openverse); film technician by Aldo Bidini (CC BY-SA 4.0).
          </p>
        </div>
      </footer>
    </div>
  );
}
