"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";

export function CupFill({
  defaultBudget = 50000,
  feePct = 0.15,
}: {
  defaultBudget?: number;
  feePct?: number;
}) {
  const [budget, setBudget] = useState(defaultBudget);
  const budgetPaise = budget * 100;
  const feePaise = Math.round(budgetPaise * feePct);
  const totalPaise = budgetPaise + feePaise;

  const estimatedReach = useMemo(() => {
    if (budget < 25000) return { slots: 2, estViews: "25,000+" };
    if (budget < 100000) return { slots: 5, estViews: "120,000+" };
    return { slots: 10, estViews: "350,000+" };
  }, [budget]);

  return (
    <div
      className="glass"
      style={{
        padding: "1.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: "1rem",
          borderBottom: "1px solid var(--line)",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <span
            className="pill-card"
            style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.65rem",
              background: "var(--blush)",
              color: "var(--wine)",
              border: "1px solid var(--blush-deep)",
            }}
          >
            Escrow Calculation
          </span>
          <h3 style={{ marginTop: "0.45rem", fontSize: "1.125rem", color: "var(--ink)" }}>
            Campaign Budget Simulator
          </h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
            Total Escrow Required
          </span>
          <span
            className="serif-moment"
            style={{
              fontSize: "1.85rem",
              fontWeight: 400,
              color: "var(--cta)",
              lineHeight: 1.1,
              display: "block",
              marginTop: "0.2rem",
            }}
          >
            {formatINR(totalPaise)}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.8125rem",
            color: "var(--muted)",
            marginBottom: "0.45rem",
          }}
        >
          <span>Creator Payout Pool</span>
          <strong style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
            {formatINR(budgetPaise)}
          </strong>
        </div>

        <input
          type="range"
          min={10000}
          max={500000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-valuetext={formatINR(budgetPaise)}
          style={{
            width: "100%",
            height: "6px",
            backgroundColor: "var(--frame)",
            accentColor: "var(--cta)",
            cursor: "pointer",
            borderRadius: "var(--radius-pill)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--muted)",
            marginTop: "0.35rem",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>₹10,000</span>
          <span>₹5,00,000</span>
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-inner)",
          overflow: "hidden",
          marginBottom: "1.25rem",
          background: "var(--paper-subtle)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ padding: "0.75rem 1rem", borderRight: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Creator Pool
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ink)" }}>
              {formatINR(budgetPaise)}
            </span>
          </div>

          <div style={{ padding: "0.75rem 1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Platform Fee (15%)
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--ink)" }}>
              {formatINR(feePaise)}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            backgroundColor: "var(--sheet)",
          }}
        >
          <div style={{ padding: "0.65rem 1rem", borderRight: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Allocated Slots
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)" }}>
              {estimatedReach.slots} Creators
            </span>
          </div>

          <div style={{ padding: "0.65rem 1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Verified View Target
            </span>
            <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--cta)" }}>
              {estimatedReach.estViews}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/signup?role=brand"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Lock Budget and Launch
      </Link>
    </div>
  );
}
