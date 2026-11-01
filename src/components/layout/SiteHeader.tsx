"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const NAV_LINKS = [
  { href: "/for-brands", label: "For Brands" },
  { href: "/for-creators", label: "For Creators" },
  { href: "/bounties", label: "Open Bounties" },
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

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="RedCup Home">
          <span className="logo-mark" aria-hidden="true" />
          <span>RedCup</span>
        </Link>

        <nav className="nav-links" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost btn-compact">
            Sign In
          </Link>
          <Link href="/signup" className="btn btn-primary btn-compact">
            Get Started
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-compact sm:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
            style={{ padding: "0.35rem 0.65rem", display: "none" }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          style={{
            position: "fixed",
            inset: "3.75rem 0 0 0",
            backgroundColor: "var(--paper)",
            padding: "1.5rem var(--page-margin)",
            display: "grid",
            gap: "0.75rem",
            alignContent: "start",
            zIndex: 50,
            borderBottom: "1px solid var(--line)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "var(--ink)",
                padding: "0.4rem 0",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
            <Link href="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
