"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/for-brands", label: "For brands" },
  { href: "/for-creators", label: "For creators" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="RedCup Home">
          <span className="logo-mark" aria-hidden="true" />
          <span className="logo-word">RedCup</span>
        </Link>

        <nav className="nav-links" aria-label="Main Navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={isActive(link.href) ? "is-active" : undefined}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="btn btn-ghost nav-login">
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary nav-start">
            Get started
          </Link>
          <button
            type="button"
            className="nav-burger"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={24} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={24} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          style={{
            position: "fixed",
            inset: "4.5rem 0 0 0",
            backgroundColor: "rgba(255, 255, 255, 0.98)",
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
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid var(--line)",
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ display: "grid", gap: "0.65rem", marginTop: "1.5rem" }}>
            <Link href="/login" className="btn btn-ghost" style={{ width: "100%" }}>
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary" style={{ width: "100%" }}>
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
