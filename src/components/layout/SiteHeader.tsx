"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const LINKS = [
  { href: "/for-brands", label: "For brands" },
  { href: "/for-creators", label: "For creators" },
  { href: "/bounties", label: "Bounties" },
  { href: "/creators", label: "Creators" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="RedCup home" prefetch>
          <span className="logo-mark" aria-hidden />
          <span>
            <span style={{ color: "var(--cup)" }}>Red</span>Cup
          </span>
        </Link>

        <nav className="nav-plain" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "is-active" : undefined}
                prefetch
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="nav-cta">
          <Link href="/login" className="btn btn-ghost nav-login" prefetch>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary" prefetch>
            Get started
          </Link>
          <button
            type="button"
            className="nav-burger"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {open ? (
        <div id={panelId} className="nav-fullscreen">
          <nav aria-label="Mobile">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="nav-fullscreen-link" prefetch>
                {l.label}
              </Link>
            ))}
            <div className="nav-fullscreen-actions">
              <Link href="/login" className="btn btn-ghost" prefetch>
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary" prefetch>
                Get started
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
