"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";

const PRESETS = [
  { label: "₹25K", value: 25000 },
  { label: "₹50K", value: 50000 },
  { label: "₹1 Lakh", value: 100000 },
  { label: "₹2.5 Lakh", value: 250000 },
];

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
  // GST at 18% applies to the platform fee.
  const gstPaise = Math.round(feePaise * 0.18);
  const totalPaise = budgetPaise + feePaise + gstPaise;

  const estimatedReach = useMemo(() => {
    if (budget < 25000) return { slots: 2, estViews: "25,000" };
    if (budget < 100000) return { slots: 5, estViews: "1.2 lakh" };
    if (budget < 250000) return { slots: 10, estViews: "3.5 lakh" };
    return { slots: 18, estViews: "8 lakh" };
  }, [budget]);

  return (
    <div
      className="calc-card"
      style={{
        padding: "clamp(1.5rem, 3vw, 2.25rem)",
      }}
    >
      {/* Header with Title and total cost */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingBottom: "1.25rem",
          borderBottom: "1px solid var(--line)",
          marginBottom: "1.35rem",
        }}
      >
        <div>
          <h3 style={{ marginTop: "0.55rem", fontSize: "1.2rem", color: "var(--ink)", letterSpacing: "-0.02em" }}>
            Campaign cost calculator
          </h3>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
            You pay
          </span>
          <span
            className="num"
            style={{
              fontSize: "2.1rem",
              fontWeight: 400,
              color: "var(--cta)",
              lineHeight: 1.1,
              display: "block",
              marginTop: "0.2rem",
            }}
          >
            {formatINR(totalPaise)}
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block", marginTop: "0.2rem" }}>
            ({formatINR(budgetPaise)} creator budget + {formatINR(feePaise)} fee + {formatINR(gstPaise)} GST)
          </span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--muted)", fontWeight: 500 }}>
            Quick Presets
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--ink)", fontWeight: 600 }}>
            {formatINR(budgetPaise)}
          </span>
        </div>

        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {PRESETS.map((p) => {
            const isSelected = budget === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setBudget(p.value)}
                style={{
                  flex: "1 1 0",
                  minWidth: "64px",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  borderRadius: "var(--radius-pill)",
                  border: isSelected ? "1px solid var(--ink)" : "1px solid var(--line)",
                  backgroundColor: isSelected ? "var(--ink)" : "var(--sheet)",
                  color: isSelected ? "var(--paper)" : "var(--ink)",
                  cursor: "pointer",
                  transition: "all 140ms ease",
                  textAlign: "center",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Range Slider */}
      <div style={{ marginBottom: "1.35rem" }}>
        <input
          type="range"
          min={10000}
          max={500000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          aria-label="Creator budget slider"
          aria-valuetext={formatINR(budgetPaise)}
          className="budget-slider"
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--muted)",
            marginTop: "0.45rem",
            
          }}
        >
          <span>₹10,000</span>
          <span>₹5,00,000</span>
        </div>
      </div>

      {/* Breakdown Matrix */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-inner)",
          overflow: "hidden",
          marginBottom: "1.35rem",
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
              Creator budget
            </span>
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--ink)" }}>
              {formatINR(budgetPaise)}
            </span>
          </div>

          <div style={{ padding: "0.75rem 1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Platform Fee (15%)
            </span>
            <span style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--ink)" }}>
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
          <div style={{ padding: "0.75rem 1rem", borderRight: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Creators
            </span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--ink)" }}>
              up to {estimatedReach.slots}
            </span>
          </div>

          <div style={{ padding: "0.75rem 1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
              Estimated reach
            </span>
            <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--cta)" }}>
              up to about {estimatedReach.estViews} views (not guaranteed)
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/signup?role=brand"
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        Plan this campaign
      </Link>
    </div>
  );
}
