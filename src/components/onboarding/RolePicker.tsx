"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function RolePicker() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [leaving, setLeaving] = useState<"brand" | "creator" | null>(null);

  const choose = (role: "brand" | "creator") => {
    setLeaving(role);
    const go = () => router.push(`/signup?role=${role}`);
    if (reduce) go();
    else setTimeout(go, 420);
  };

  return (
    <div className={`role-picker ${leaving ? `is-leaving-${leaving}` : ""}`}>
      <div className="role-picker-intro">
        <p className="chip">Join RedCup</p>
        <h1>Who are you funding results for?</h1>
        <p className="muted" style={{ marginTop: "0.65rem", maxWidth: "40ch" }}>
          Pick a path. Brand and creator onboarding each have their own rhythm — same red cup, different pour.
        </p>
      </div>
      <div className="role-split">
        <motion.button
          type="button"
          className="role-panel role-panel-brand"
          onClick={() => choose("brand")}
          whileHover={reduce ? undefined : { y: -4 }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          aria-label="I'm a brand"
        >
          <span className="role-kicker">Brand</span>
          <strong>I&apos;m a brand</strong>
          <p className="muted">Fund a reel bounty. Award eligible creators. Pay for verified views.</p>
          <span className="role-cta">Enter brand path →</span>
        </motion.button>
        <motion.button
          type="button"
          className="role-panel role-panel-creator"
          onClick={() => choose("creator")}
          whileHover={reduce ? undefined : { y: -4 }}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          aria-label="I'm a creator"
        >
          <span className="role-kicker">Creator</span>
          <strong>I&apos;m a creator</strong>
          <p className="muted">Apply where you match. Ship one draft. Earn on approved reels.</p>
          <span className="role-cta">Enter creator path →</span>
        </motion.button>
      </div>
      {/* Keep e2e-compatible Brand / Creator buttons available but visually integrated */}
      <div className="role-picker-legacy" aria-hidden={false}>
        <button type="button" className="btn btn-ghost" onClick={() => choose("brand")}>
          Brand
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => choose("creator")}>
          Creator
        </button>
      </div>
    </div>
  );
}
