"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
        <p className="kicker">Account Type</p>
        <h1 style={{ marginBottom: "0.5rem" }}>Select your RedCup path</h1>
        <p className="lede" style={{ fontSize: "0.9375rem" }}>
          Choose your operating role to begin guided onboarding.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        <button
          type="button"
          onClick={() => choose("brand")}
          aria-label="I am a brand"
          style={{
            textAlign: "left",
            border: "1px solid",
            borderColor: selected === "brand" ? "var(--ink)" : "var(--line)",
            backgroundColor: "var(--sheet)",
            borderRadius: "var(--radius-card)",
            padding: "1.75rem",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px",
            transition: "border-color 120ms ease",
          }}
        >
          <div>
            <span className="chip chip-ok" style={{ marginBottom: "0.85rem" }}>
              Advertisers &amp; D2C
            </span>
            <strong style={{ display: "block", fontSize: "1.25rem", color: "var(--ink)", fontFamily: "var(--font-display)" }}>
              I am a Brand
            </strong>
            <p style={{ margin: "0.5rem 0 0", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Lock a reel budget, set your audience criteria, shortlist top creators with Fit Score, and pay exclusively for verified views.
            </p>
          </div>
          <div style={{ marginTop: "1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)" }}>
            Continue as Brand
          </div>
        </button>

        <button
          type="button"
          onClick={() => choose("creator")}
          aria-label="I am a creator"
          style={{
            textAlign: "left",
            border: "1px solid",
            borderColor: selected === "creator" ? "var(--ink)" : "var(--line)",
            backgroundColor: "var(--sheet)",
            borderRadius: "var(--radius-card)",
            padding: "1.75rem",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px",
            transition: "border-color 120ms ease",
          }}
        >
          <div>
            <span className="chip chip-cup" style={{ marginBottom: "0.85rem" }}>
              Content Creators
            </span>
            <strong style={{ display: "block", fontSize: "1.25rem", color: "var(--ink)", fontFamily: "var(--font-display)" }}>
              I am a Creator
            </strong>
            <p style={{ margin: "0.5rem 0 0", color: "var(--ink-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Connect your Instagram profile, view eligibility tags before applying, submit one draft revision, and receive guaranteed payouts.
            </p>
          </div>
          <div style={{ marginTop: "1.5rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--ink)" }}>
            Continue as Creator
          </div>
        </button>
      </div>
    </div>
  );
}
