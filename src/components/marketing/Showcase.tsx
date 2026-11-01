"use client";

import { useState } from "react";

const STAGES = [
  {
    id: "escrow",
    title: "Escrow Deposit",
    protocol: "Escrow Secured",
    summary: "You deposit the creator payout pool and platform fee into an RBI-compliant escrow account before any work begins.",
    metric: "0% Non-payment Risk",
  },
  {
    id: "matching",
    lane: 2,
    title: "Audience Matching",
    protocol: "Creator Fit Check",
    summary: "Our scoring checks creator engagement, niche relevance, and follower audience quality in seconds.",
    metric: "Instant Eligibility Check",
  },
  {
    id: "shortlist",
    title: "Fit Score Award",
    protocol: "Top Shortlist",
    summary: "Fit Score ranks creators by relevance. You award slots within 48 hours, or the system auto-confirms top matches.",
    metric: "48h Award SLA",
  },
  {
    id: "verification",
    title: "Graph API Verification",
    protocol: "Verified Payout",
    summary: "Creators post with Instagram's paid partnership tag. The Graph API tracks verified views and triggers payouts to UPI.",
    metric: "Direct UPI Payout",
  },
];

export function Showcase() {
  const [active, setActive] = useState(0);

  return (
    <section
      aria-label="Transaction Protocol"
      style={{
        margin: "var(--section-gap) 0",
      }}
    >
      <div style={{ marginBottom: "1.75rem" }}>
        <h2>From funding to verified view payouts</h2>
        <p className="lede" style={{ marginTop: "0.35rem", fontSize: "1rem" }}>
          Four automated checkpoints enforcing zero-retainer waste and verified view performance.
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          overflow: "hidden",
          backgroundColor: "var(--sheet)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            borderBottom: "1px solid var(--line)",
            backgroundColor: "var(--paper-subtle)",
          }}
          role="tablist"
        >
          {STAGES.map((s, i) => {
            const isSelected = i === active;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActive(i)}
                style={{
                  textAlign: "left",
                  padding: "1rem 1.25rem",
                  border: "none",
                  borderRight: i < STAGES.length - 1 ? "1px solid var(--line)" : "none",
                  borderBottom: isSelected ? "2px solid var(--ink)" : "2px solid transparent",
                  backgroundColor: isSelected ? "var(--sheet)" : "transparent",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.8125rem", color: "var(--muted)" }}>
                    Step {i + 1}
                  </span>
                  <span className="chip" style={{ fontSize: "0.6875rem" }}>
                    {s.protocol}
                  </span>
                </div>
                <strong
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                    fontSize: "0.9375rem",
                    color: "var(--ink)",
                  }}
                >
                  {s.title}
                </strong>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "2rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                Checkpoint {active + 1} • {STAGES[active].protocol}
              </span>
              <h3 style={{ fontSize: "1.35rem", marginTop: "0.35rem" }}>
                {STAGES[active].title}
              </h3>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  color: "var(--ink-secondary)",
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                }}
              >
                {STAGES[active].summary}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "var(--paper-subtle)",
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-card)",
                padding: "1.5rem",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  Guaranteed Parameter
                </span>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    marginTop: "0.2rem",
                  }}
                >
                  {STAGES[active].metric}
                </div>
              </div>
              <div style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--line)", fontSize: "0.8125rem", color: "var(--muted)" }}>
                Verified via automated platform webhooks and direct API handshakes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
