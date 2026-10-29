"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RolePicker() {
  const router = useRouter();
  const [leaving, setLeaving] = useState<"brand" | "creator" | null>(null);

  const choose = (role: "brand" | "creator") => {
    setLeaving(role);
    const go = () => router.push(`/signup?role=${role}`);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) go();
    else setTimeout(go, 280);
  };

  return (
    <div className={`role-picker ${leaving ? `is-leaving-${leaving}` : ""}`}>
      <div className="role-picker-intro">
        <h1>Who are you funding results for?</h1>
        <p>Pick a path. Brand and creator onboarding each have their own rhythm.</p>
      </div>
      <div className="role-split">
        <button
          type="button"
          className="role-panel role-panel-brand"
          onClick={() => choose("brand")}
          aria-label="I'm a brand"
        >
          <strong>I&apos;m a brand</strong>
          <p className="muted">Fund a reel bounty. Award eligible creators. Pay for verified views.</p>
          <span className="role-cta">Enter brand path →</span>
        </button>
        <button
          type="button"
          className="role-panel role-panel-creator"
          onClick={() => choose("creator")}
          aria-label="I'm a creator"
        >
          <strong>I&apos;m a creator</strong>
          <p className="muted">Apply where you match. Ship one draft. Earn on approved reels.</p>
          <span className="role-cta">Enter creator path →</span>
        </button>
      </div>
      <div className="role-picker-legacy">
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
