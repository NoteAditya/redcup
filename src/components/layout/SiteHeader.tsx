import Link from "next/link";
import { getSession } from "@/server/auth/session";
import { signOut } from "@/server/auth/actions";

export async function SiteHeader({ tone = "marketing" }: { tone?: "marketing" | "app" }) {
  const session = await getSession();
  const home = session.isLoggedIn
    ? session.role === "brand"
      ? "/brand"
      : session.role === "creator"
        ? "/creator"
        : "/admin"
    : "/";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        padding: tone === "marketing" ? "1.1rem 0" : "0.9rem 0",
        borderBottom: "1px solid var(--line)",
        marginBottom: "1.25rem",
      }}
    >
      <Link href={home} style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
        RedCup
      </Link>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", fontSize: "0.9rem" }}>
        {!session.isLoggedIn && (
          <>
            <Link href="/for-brands">Brands</Link>
            <Link href="/for-creators">Creators</Link>
            <Link href="/bounties">Bounties</Link>
            <Link href="/login" className="btn btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get started
            </Link>
          </>
        )}
        {session.isLoggedIn && (
          <>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              {session.name}
            </span>
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">
                Sign out
              </button>
            </form>
          </>
        )}
      </nav>
    </header>
  );
}
