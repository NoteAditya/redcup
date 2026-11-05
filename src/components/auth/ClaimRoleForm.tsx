"use client";

import { useState, useTransition } from "react";
import { claimClerkRole } from "@/server/auth/actions";

export function ClaimRoleForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const pick = (role: "brand" | "creator") => {
    setError(null);
    start(async () => {
      const res = await claimClerkRole(role);
      if (res && !res.ok) setError(res.error);
    });
  };

  return (
    <div
      style={{
        backgroundColor: "var(--sheet)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-card)",
        padding: "2rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <span className="chip" style={{ marginBottom: "0.5rem" }}>
        Almost there
      </span>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>How will you use RedCup?</h1>
      <p className="muted" style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>
        Your Google account is connected. Pick a role to finish setup.
      </p>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => pick("brand")}>
          Continue as Brand
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={pending}
          onClick={() => pick("creator")}
          style={{ border: "1px solid var(--line)" }}
        >
          Continue as Creator
        </button>
      </div>
      {error && (
        <p className="err" role="alert" style={{ marginTop: "0.85rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}
