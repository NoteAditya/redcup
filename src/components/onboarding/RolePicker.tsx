"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Building2, Clapperboard } from "lucide-react";

export function RolePicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<"brand" | "creator" | null>(null);

  const choose = (role: "brand" | "creator") => {
    setSelected(role);
    const go = () => router.push(`/signup?role=${role}`);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) go();
    else setTimeout(go, 150);
  };

  return (
    <div className="role-picker" style={{ maxWidth: "780px", margin: "1.5rem auto 3.5rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p className="kicker">Join RedCup</p>
        <h1 style={{ marginBottom: "0.5rem" }}>Are you a brand or a creator?</h1>
        <p className="lede">
          Pick one to get started. It takes about 3 minutes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => choose("brand")}
          aria-label="I am a brand"
          className={`role-card${selected === "brand" ? " is-selected" : ""}`}
        >
          <div>
            <span className="role-card-icon" aria-hidden="true">
              <Building2 size={24} strokeWidth={1.75} />
            </span>
            <span className="chip" style={{ marginBottom: "0.85rem" }}>
              Advertisers &amp; D2C
            </span>
            <strong className="role-card-title">
              I am a Brand
            </strong>
            <p className="role-card-body">
              Set your brief and budget, choose from creators we shortlist for you, approve every reel, and pay creators a fixed base per reel, and the rest only for verified results.
            </p>
          </div>
          <span className="btn btn-primary role-card-cta">
            Continue as Brand <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => choose("creator")}
          aria-label="I am a creator"
          className={`role-card${selected === "creator" ? " is-selected" : ""}`}
        >
          <div>
            <span className="role-card-icon" aria-hidden="true">
              <Clapperboard size={24} strokeWidth={1.75} />
            </span>
            <span className="chip" style={{ marginBottom: "0.85rem" }}>
              Content Creators
            </span>
            <strong className="role-card-title">
              I am a Creator
            </strong>
            <p className="role-card-body">
              Connect Instagram, see which campaigns you qualify for, make reels for brands, and get paid by UPI. Free to join.
            </p>
          </div>
          <span className="btn btn-ghost role-card-cta">
            Continue as Creator <ArrowRight size={20} strokeWidth={2} aria-hidden="true" />
          </span>
        </button>
      </div>
    </div>
  );
}
