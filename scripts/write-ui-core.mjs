import fs from 'fs';
import path from 'path';
const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

w('src/app/globals.css', `@import "tailwindcss";

:root {
  --paper: #f7f3eb;
  --ink: #1a1714;
  --muted: #6b635a;
  --line: #e4ddd2;
  --cup: #b91c1c;
  --cup-ink: #7f1d1d;
  --sheet: #ffffff;
  --ok: #166534;
  --warn: #a16207;
  --bad: #991b1b;
  --frame: #efe8dc;
}

@theme inline {
  --color-paper: var(--paper);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-cup: var(--cup);
  --color-cup-ink: var(--cup-ink);
  --color-sheet: var(--sheet);
  --color-ok: var(--ok);
  --color-warn: var(--warn);
  --color-bad: var(--bad);
  --color-frame: var(--frame);
  --font-sans: var(--font-plex);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-plex), "IBM Plex Sans", system-ui, sans-serif;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
a:hover { color: var(--cup); }

h1, h2, h3 {
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}

h1 { font-size: clamp(1.5rem, 2.5vw, 2.25rem); } /* ≤36px */
h2 { font-size: clamp(1.25rem, 2vw, 1.5rem); }
h3 { font-size: 1.05rem; }

.prose-tight p { margin: 0 0 0.75rem; color: var(--muted); }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.35rem;
  border: 1px solid transparent;
  font-weight: 550;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--cup); color: #fff; }
.btn-primary:hover { background: var(--cup-ink); color: #fff; }
.btn-ghost { background: transparent; border-color: var(--line); color: var(--ink); }
.btn-ghost:hover { border-color: var(--ink); }
.btn-sheet { background: var(--sheet); border-color: var(--line); }

.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.9rem; }
.field label { font-size: 0.8rem; font-weight: 550; color: var(--muted); }
.field input, .field select, .field textarea {
  min-height: 2.5rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--line);
  border-radius: 0.35rem;
  background: var(--sheet);
  color: var(--ink);
  font: inherit;
}
.field textarea { min-height: 6rem; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline: 2px solid color-mix(in srgb, var(--cup) 35%, transparent);
  border-color: var(--cup);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 550;
  border: 1px solid var(--line);
  background: var(--sheet);
}
.chip-ok { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 30%, var(--line)); }
.chip-almost { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 30%, var(--line)); }
.chip-no { color: var(--bad); border-color: color-mix(in srgb, var(--bad) 30%, var(--line)); }
.chip-cup { background: var(--cup); color: #fff; border-color: var(--cup); }

.card {
  background: var(--sheet);
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  padding: 1.1rem 1.2rem;
}

.frame-sheet {
  background: var(--frame);
  padding: 0.75rem;
  min-height: 100vh;
}
.frame-sheet > .sheet {
  background: var(--sheet);
  border: 1px solid var(--line);
  min-height: calc(100vh - 1.5rem);
  border-radius: 0.35rem;
}

.axis {
  display: grid;
  gap: 1.5rem;
}
@media (min-width: 900px) {
  .axis-2 { grid-template-columns: 1.1fr 0.9fr; }
  .axis-hero { grid-template-columns: 1.2fr 0.8fr; align-items: end; }
}

.solid-block {
  background: var(--cup);
  color: #fff;
  padding: 1.25rem 1.4rem;
  border-radius: 0.35rem;
}

.ui-fragment {
  background: var(--sheet);
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  padding: 0.9rem;
  box-shadow: 0 12px 28px -18px rgba(26, 23, 20, 0.35);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.table th, .table td {
  text-align: left;
  padding: 0.65rem 0.5rem;
  border-bottom: 1px solid var(--line);
  vertical-align: top;
}
.table th { color: var(--muted); font-weight: 550; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }

.muted { color: var(--muted); }
.err { color: var(--bad); font-size: 0.85rem; }
.connect-banner {
  border: 1px dashed color-mix(in srgb, var(--warn) 50%, var(--line));
  background: color-mix(in srgb, var(--warn) 8%, var(--sheet));
  color: var(--ink);
  padding: 0.75rem 0.9rem;
  border-radius: 0.4rem;
  font-size: 0.875rem;
}
`);

w('src/app/layout.tsx', `import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RedCup — Pay for verified Instagram views",
    template: "%s · RedCup",
  },
  description:
    "India's pay-for-results creator platform. Brands fund a reel bounty. Eligible creators apply. You pay for an approved live reel plus verified views.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={\`\${plex.variable} antialiased\`}>{children}</body>
    </html>
  );
}
`);

w('src/components/ui/ConnectBanner.tsx', `export function ConnectBanner({
  provider,
  message,
}: {
  provider: string;
  message: string;
}) {
  return (
    <div className="connect-banner" role="status">
      <strong>Connect {provider}</strong>
      <div className="muted" style={{ marginTop: 4 }}>
        {message}
      </div>
    </div>
  );
}
`);

w('src/components/ui/EligibilityChip.tsx', `import type { EligibilityStatus } from "@/lib/types";

const LABEL: Record<EligibilityStatus, string> = {
  ELIGIBLE: "Eligible",
  ALMOST: "Almost",
  NOT_ELIGIBLE: "Not eligible",
  INCOMPLETE: "Incomplete profile",
  NOT_VERIFIED: "Not verified",
};

export function EligibilityChip({ status }: { status: EligibilityStatus }) {
  const cls =
    status === "ELIGIBLE"
      ? "chip chip-ok"
      : status === "ALMOST"
        ? "chip chip-almost"
        : "chip chip-no";
  return <span className={cls}>{LABEL[status]}</span>;
}
`);

w('src/components/layout/SiteHeader.tsx', `import Link from "next/link";
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
`);

w('src/components/layout/AppShell.tsx', `import Link from "next/link";
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
`);

w('src/components/layout/MarketingShell.tsx', `import Link from "next/link";
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
`);

w('src/components/auth/AuthForms.tsx', `"use client";

import { useState, useTransition } from "react";
import { demoSignIn, demoSignUp, requestOtp } from "@/server/auth/actions";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export function SignUpForm({ defaultRole = "brand" }: { defaultRole?: "brand" | "creator" }) {
  const [role, setRole] = useState<"brand" | "creator">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await demoSignUp({
            role,
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || "") || undefined,
            phone: String(fd.get("phone") || "") || undefined,
            password: String(fd.get("password") || ""),
          });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button type="button" className={\`btn \${role === "brand" ? "btn-primary" : "btn-ghost"}\`} onClick={() => setRole("brand")}>
          Brand
        </button>
        <button type="button" className={\`btn \${role === "creator" ? "btn-primary" : "btn-ghost"}\`} onClick={() => setRole("creator")}>
          Creator
        </button>
      </div>
      <div className="field">
        <label htmlFor="name">{role === "brand" ? "Business name" : "Display name"}</label>
        <input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="password">Password (demo sign-in)</label>
        <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      {error && <p className="err">{error}</p>}
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [otpMsg, setOtpMsg] = useState<{ provider: string; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const res = await demoSignIn({
              contact: String(fd.get("contact") || ""),
              password: String(fd.get("password") || ""),
            });
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <div className="field">
          <label htmlFor="contact">Email or phone</label>
          <input id="contact" name="contact" required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setOtpMsg(null);
          start(async () => {
            const res = await requestOtp(String(fd.get("otpContact") || ""));
            if (!res.ok && "needsConnect" in res && res.needsConnect) {
              setOtpMsg({ provider: res.provider, message: res.message });
            }
          });
        }}
      >
        <h3 style={{ marginBottom: "0.5rem" }}>OTP sign-in</h3>
        <p className="muted" style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
          Prefer a code? Add a Resend or SMS key later. Until then this shows Connect.
        </p>
        <div className="field">
          <label htmlFor="otpContact">Email or phone</label>
          <input id="otpContact" name="otpContact" required />
        </div>
        <button className="btn btn-ghost" type="submit" disabled={pending}>
          Send code
        </button>
        {otpMsg && <div style={{ marginTop: "0.75rem" }}><ConnectBanner provider={otpMsg.provider} message={otpMsg.message} /></div>}
      </form>
    </div>
  );
}
`);

console.log('ui-core done');
