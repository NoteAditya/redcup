import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

export function AppShell({
  children,
  nav,
}: {
  children: React.ReactNode;
  nav: { href: string; label: string }[];
}) {
  return (
    <div className="frame-sheet">
      <div className="sheet" style={{ padding: "0 1.25rem 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <SiteHeader tone="app" />
        <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          <aside style={{ minWidth: 160, flex: "0 0 160px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.9rem" }}>
              {nav.map((n) => (
                <Link key={n.href} href={n.href} className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </aside>
          <main style={{ flex: "1 1 480px", minWidth: 0 }}>{children}</main>
        </div>
      </div>
    </div>
  );
}
