"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { signOut as ironSignOut } from "@/server/auth/actions";

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
                <Link key={item.href} href={item.href} className={active ? "active" : undefined}>
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ padding: "0.65rem 0.5rem", borderTop: "1px solid var(--line)", display: "grid", gap: "0.65rem" }}>
            <SignedIn>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UserButton />
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Account</span>
              </div>
            </SignedIn>
            <form action={ironSignOut}>
              <button
                type="submit"
                className="btn btn-ghost btn-compact"
                style={{ width: "100%", justifyContent: "flex-start", color: "var(--muted)" }}
              >
                Sign out
              </button>
            </form>
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
