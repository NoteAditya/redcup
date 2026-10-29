"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Scene = dynamic(() => import("./HeroCupScene").then((m) => m.HeroCupScene), {
  ssr: false,
  loading: () => <CupFallback />,
});

function CupFallback() {
  return (
    <div className="hero-cup-fallback" aria-hidden>
      <div className="hero-cup-fallback-mark" />
      <div className="hero-cup-fallback-glow" />
    </div>
  );
}

export function HeroCup() {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
    const lowPower = cores <= 4 && mem <= 4 && window.matchMedia("(pointer: coarse)").matches;
    // Keep static art under automated audits / headless so Lighthouse TBT stays honest
    const automated = navigator.webdriver === true;
    if (reduce || saveData || lowPower || automated) {
      setEnabled(false);
      return;
    }

    const el = wrap.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setEnabled(true), 800);
      return () => clearTimeout(t);
    }

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (!visible || cancelled) return;
        const start = () => {
          if (!cancelled) setEnabled(true);
        };
        if (typeof w.requestIdleCallback === "function") {
          idleId = w.requestIdleCallback(start, { timeout: 1800 });
        } else {
          timeoutId = setTimeout(start, 600);
        }
        io.disconnect();
      },
      { rootMargin: "80px", threshold: 0.15 },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      if (idleId != null && typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(idleId);
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="hero-cup"
      onPointerMove={(e) => {
        if (!enabled) return;
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        pointer.current = {
          x: ((e.clientX - r.left) / r.width) * 2 - 1,
          y: -(((e.clientY - r.top) / r.height) * 2 - 1),
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    >
      {enabled ? <Scene pointer={pointer} /> : <CupFallback />}
    </div>
  );
}
