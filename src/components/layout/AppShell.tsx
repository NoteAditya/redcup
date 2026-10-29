"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function AppShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  const pathname = usePathname();
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
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
              (item.href.match(/\/(brand|creator|admin)$/) && pathname === item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
                {item.label}
              </Link>
            );
          })}
          <div style={{ flex: 1 }} />
          <Link href="/" style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            ← Marketing site
          </Link>
        </aside>
        <div className="app-main">{children}</div>
      </div>
    </div>
  );
}
