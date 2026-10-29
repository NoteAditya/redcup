import Link from "next/link";

type NavItem = { href: string; label: string };

export function AppShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <div className="app-shell">
        <aside className="app-nav" aria-label="App">
          <Link href="/" className="logo" style={{ margin: "0.25rem 0.35rem 1rem" }}>
            <span className="logo-mark" aria-hidden />
            <span>
              <span style={{ color: "var(--cup)" }}>Red</span>Cup
            </span>
          </Link>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
            ← Marketing site
          </Link>
        </aside>
        <div className="app-main">{children}</div>
      </div>
    </div>
  );
}
