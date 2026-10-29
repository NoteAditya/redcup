"use client";

import { useEffect } from "react";

/** Motion flag only — no Lenis. Honors prefers-reduced-motion; does not kill motion for automation. */
export function MotionProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.dataset.motion = reduce ? "reduce" : "ok";
  }, []);
  return <>{children}</>;
}
