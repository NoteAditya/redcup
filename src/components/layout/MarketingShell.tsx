import Link from "next/link";
import { SiteHeader } from "./SiteHeader";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 1.25rem 3rem" }}>
      <SiteHeader />
      {children}
      <footer
        style={{
          marginTop: "3rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--line)",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          color: "var(--muted)",
          fontSize: "0.85rem",
        }}
      >
        <span>© {new Date().getFullYear()} RedCup</span>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/refunds">Refunds</Link>
      </footer>
    </div>
  );
}
