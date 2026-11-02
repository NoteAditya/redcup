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
            style={{
              padding: "0.45rem",
              minHeight: "2.35rem",
              width: "2.35rem",
              borderRadius: "50%",
              display: "none",
            }}
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          style={{
            position: "fixed",
            inset: "4.5rem 0 0 0",
            backgroundColor: "rgba(244, 238, 233, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "2rem var(--page-margin)",
            display: "grid",
            gap: "0.85rem",
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
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "var(--ink)",
                padding: "0.6rem 0",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "1.5rem" }}>
            <Link href="/login" className="btn btn-ghost" style={{ width: "100%" }}>
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ width: "100%" }}>
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
