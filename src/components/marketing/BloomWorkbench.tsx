"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";

interface LaneItem {
  id: string;
  lane: number;
  label: string;
  tag: string;
  timecode: string;
  metric: string;
  protocol: string;
  summary: string;
  offsetPct: number;
  widthPct: number;
}

const LANES: LaneItem[] = [
  {
    id: "escrow",
    lane: 1,
    label: "Escrow Deposit Locked",
    tag: "100% Pre-funded",
    timecode: "00:00:00",
    metric: "0% Non-payment Risk",
    protocol: "RBI-Compliant Escrow Account",
    summary: "You deposit the creator payout pool plus a 15% platform fee into an RBI-compliant escrow account before any work begins.",
    offsetPct: 4,
    widthPct: 28,
  },
  {
    id: "matching",
    lane: 2,
    label: "Fit Score Algorithmic Match",
    tag: "Audience Scoring",
    timecode: "00:12:00",
    metric: "Instant Eligibility Check",
    protocol: "Audience Scoring",
    summary: "We score audience geography, engagement rates, and niche overlap against the campaign brief.",
    offsetPct: 24,
    widthPct: 32,
  },
  {
    id: "draft",
    lane: 3,
    label: "Single Draft Milestone",
    tag: "Max 1 Revision",
    timecode: "00:48:00",
    metric: "48h Review Turnaround",
    protocol: "Structured Contract Review",
    summary: "The creator submits their video draft through the dashboard. You get one review round with a 48-hour window so production moves quickly.",
    offsetPct: 48,
    widthPct: 26,
  },
  {
    id: "views",
    lane: 4,
    label: "Instagram Graph API Verification",
    tag: "Direct API Webhook",
    timecode: "07:00:00",
    metric: "Authenticated Milestone Views",
    protocol: "Official Meta Graph API",
    summary: "The reel goes live with Instagram's paid partnership tag. The Graph API reads views directly, and each verified milestone pays out straight to UPI.",
    offsetPct: 68,
    widthPct: 30,
  },
];

export function BloomWorkbench() {
  const [activeLaneId, setActiveLaneId] = useState<string>("views");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activeItem = LANES.find((l) => l.id === activeLaneId) || LANES[3];

  const handleSimulatePulse = () => {
    setIsPlaying(true);
    // Cycle through milestones
    const ids = ["escrow", "matching", "draft", "views"];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % ids.length;
      setActiveLaneId(ids[idx]);
      if (idx === ids.length - 1) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 450);
  };

  return (
    <div className="bloom-stage" aria-label="Campaign Protocol Workbench">
      {/* Top Console Controls: Rubber Bezel + Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {/* Physical Domed Rubber Button from Hallmark Bloom */}
          <button
            type="button"
            className="rec"
            onClick={handleSimulatePulse}
            aria-label="Simulate Protocol Sequence"
            title="Simulate Protocol Sequence"
          >
            <div className="rec__cap" />
          </button>
          <div>
            <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--color-muted)", textTransform: "uppercase" }}>
              {isPlaying ? "Simulating Sequence..." : "Campaign Lifecycle • Tap button to run"}
            </div>
            <strong style={{ fontSize: "1.0625rem", color: "var(--color-ink)", display: "block", marginTop: "0.1rem" }}>
              Performance Bounties Lifecycle
            </strong>
          </div>
        </div>

        <div className="pill-card" style={{ fontSize: "0.8125rem", color: "var(--color-ink)" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-accent)" }} />
          <span>Stage: {activeItem.tag}</span>
        </div>
      </div>

      {/* Hallmark Bloom Working Grid (Piano Roll / Timeline) */}
      <div className="roll" style={{ padding: "1.25rem 1rem", border: "1px solid var(--color-rule)" }}>
        {/* Fine-Numeral Timecode Ruler */}
        <div className="bloom-ruler">
          <span>00:00:00 · Escrow Deposit</span>
          <span>00:24:00 · Algorithmic Match</span>
          <span>00:48:00 · Single Draft Review</span>
          <span>07:00:00 · Meta Views API</span>
        </div>

        {/* Four Part Lanes with Tactile Clips */}
        <div className="bloom-timeline-track">
          {/* Hairline Playhead */}
          <div
            className="bloom-playhead"
            style={{
              left: `${activeItem.offsetPct + activeItem.widthPct / 2}%`,
            }}
          >
            <div className="bloom-playhead-thumb" />
          </div>

          {LANES.map((lane) => {
            const isSelected = lane.id === activeLaneId;
            const laneClass =
              lane.lane === 1
                ? "clip clip-lane-1"
                : lane.lane === 2
                  ? "clip clip-lane-2"
                  : lane.lane === 3
                    ? "clip clip-lane-3"
                    : "clip clip-lane-4";

            return (
              <div
                key={lane.id}
                style={{
                  position: "relative",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  className={laneClass}
                  onClick={() => setActiveLaneId(lane.id)}
                  style={{
                    position: "absolute",
                    left: `${lane.offsetPct}%`,
                    width: `${lane.widthPct}%`,
                    minWidth: "180px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                    outline: isSelected ? "2px solid var(--color-accent)" : "none",
                    outlineOffset: "1px",
                    zIndex: isSelected ? 5 : 1,
                  }}
                >
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lane.label}
                  </span>
                  <span style={{ fontSize: "0.6875rem", fontFamily: "var(--font-mono)", color: "var(--color-muted)", flexShrink: 0, marginLeft: "0.5rem" }}>
                    {lane.timecode}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Milestone Inspection Shelf */}
      <div
        style={{
          marginTop: "1.25rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
          alignItems: "center",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--color-rule)",
        }}
      >
        <div>
          <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Active Checkpoint Protocol
          </span>
          <h3 style={{ fontSize: "1.25rem", marginTop: "0.25rem", color: "var(--color-ink)" }}>
            {activeItem.label}
          </h3>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.875rem", color: "var(--color-ink-2)", lineHeight: 1.55 }}>
            {activeItem.summary}
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--color-paper-2)",
            border: "1px solid var(--color-rule)",
            borderRadius: "var(--radius-inner)",
            padding: "1rem 1.25rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", display: "block" }}>
            Guaranteed Verification Metric
          </span>
          <div className="serif-moment" style={{ fontSize: "1.5rem", color: "var(--color-accent)", marginTop: "0.2rem" }}>
            {activeItem.metric}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            Verified via {activeItem.protocol}
          </div>
        </div>
      </div>
    </div>
  );
}
