"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const LEFT = [
  { href: "/for-brands", label: "Experience" },
  { href: "/for-creators", label: "Creators" },
];
const RIGHT = [
  { href: "/bounties", label: "Collection" },
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

  const linkClass = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return active ? "is-active" : undefined;
  };

  return (
    <header className={`site-header ${open ? "is-open" : ""}`}>
      <div className="site-header-inner site-header-rail">
        <nav className="nav-rail nav-rail-left" aria-label="Primary left">
          {LEFT.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} prefetch>
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="logo logo-center" aria-label="RedCup home" prefetch>
          <span className="logo-mark" aria-hidden />
          <span className="logo-word">
            <span className="logo-red">Red</span>Cup
          </span>
        </Link>

        <div className="nav-rail nav-rail-right">
          <nav aria-label="Primary right">
            {RIGHT.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass(l.href)} prefetch>
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/login" className="nav-text-link" prefetch>
            Log in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-compact" prefetch>
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
            {[...LEFT, ...RIGHT, { href: "/login", label: "Log in" }, { href: "/signup", label: "Get started" }].map(
              (l) => (
                <Link key={l.href} href={l.href} prefetch>
                  {l.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
