import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="RedCup home">
          <span className="logo-mark" aria-hidden />
          <span>
            <span style={{ color: "var(--cup)" }}>Red</span>Cup
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/for-brands">For brands</Link>
          <Link href="/for-creators">For creators</Link>
          <Link href="/bounties">Bounties</Link>
          <Link href="/creators">Creators</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-cta">
          <Link href="/login" className="btn btn-ghost" style={{ minHeight: "2.4rem", padding: "0.45rem 1rem" }}>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary" style={{ minHeight: "2.4rem", padding: "0.45rem 1.1rem" }}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
