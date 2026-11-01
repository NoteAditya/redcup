"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function AppShell({ nav, children }: { nav: NavItem[]; children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <div className="app-shell">
        <aside className="app-nav" aria-label="Application Navigation">
          <Link href="/" className="logo" style={{ padding: "0.25rem 0.5rem 1rem" }}>
            <span className="logo-mark" aria-hidden="true" />
            <span>RedCup</span>
          </Link>

          <div style={{ display: "grid", gap: "0.2rem" }}>
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/")) ||
                (item.href.match(/\/(brand|creator|admin)$/) && pathname === item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "active" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ padding: "0.65rem 0.5rem", borderTop: "1px solid var(--line)" }}>
            <Link
              href="/"
              style={{
                fontSize: "0.8125rem",
                color: "var(--muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              &larr; Marketing Site
            </Link>
          </div>
        </aside>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
