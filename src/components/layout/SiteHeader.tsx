"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Magnetic } from "@/components/motion/Magnetic";

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
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="RedCup home" prefetch>
          <span className="logo-mark" aria-hidden />
          <span>
            <span style={{ color: "var(--cup)" }}>Red</span>Cup
          </span>
        </Link>

        <nav className="nav-pill" aria-label="Primary">
          <div className="nav-pill-track">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-pill-link ${active ? "is-active" : ""}`}
                  prefetch
                >
                  {active && !reduce ? (
                    <motion.span
                      layoutId="nav-pill-active"
                      className="nav-pill-active"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  ) : active ? (
                    <span className="nav-pill-active" />
                  ) : null}
                  <span className="nav-pill-label">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="nav-cta">
          <Link href="/login" className="btn btn-ghost nav-login" prefetch>
            Log in
          </Link>
          <Magnetic>
            <Link href="/signup" className="btn btn-primary" prefetch>
              Get started
            </Link>
          </Magnetic>
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

      <AnimatePresence>
        {open ? (
          <motion.div
            id={panelId}
            className="nav-fullscreen"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <nav aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.28 }}
                >
                  <Link href={l.href} className="nav-fullscreen-link" prefetch>
                    {l.label}
                  </Link>
                </motion.div>
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
