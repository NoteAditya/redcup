"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";

interface LaneItem {
  id: string;
  lane: number;
  label: string;
  timecode: string;
  summary: string;
  offsetPct: number;
  widthPct: number;
}

const LANES: LaneItem[] = [
  {
    id: "escrow",
    lane: 1,
    label: "Budget added",
    timecode: "Day 0",
    summary: "Fund your campaign: creator budget + 15% fee + GST, held safely by Razorpay.",
    offsetPct: 4,
    widthPct: 28,
  },
  {
    id: "matching",
    lane: 2,
    label: "Best-fit creators shortlisted",
    timecode: "Day 3",
    summary: "We rank applicants by fit and past results, and you choose within 48 hours.",
    offsetPct: 24,
    widthPct: 32,
  },
  {
    id: "draft",
    lane: 3,
    label: "You approve the reel",
    timecode: "Day 10",
    summary: "You approve each draft (one revision).",
    offsetPct: 48,
    widthPct: 26,
  },
  {
    id: "views",
    lane: 4,
    label: "Views verified, creators paid",
    timecode: "Day 7 after posting",
    summary: "The reel goes live with the Paid Partnership label, and we verify its views for 7 days. Creators paid by UPI, about a week after posting.",
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
    <div className="bloom-stage" aria-label="How a campaign works">
      {/* Top Console Controls: Rubber Bezel + Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          {/* Physical Domed Rubber Button from Hallmark Bloom */}
          <button
            type="button"
            className="rec"
            onClick={handleSimulatePulse}
            aria-label="Play the campaign steps"
            title="Play the campaign steps"
          >
            <div className="rec__cap" />
          </button>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase" }}>
              {isPlaying ? "Simulating Sequence..." : "Campaign Lifecycle • Tap button to run"}
            </div>
            <strong style={{ fontSize: "1.0625rem", color: "var(--color-ink)", display: "block", marginTop: "0.1rem" }}>
              Performance Campaigns Lifecycle
            </strong>
          </div>
        </div>

      </div>

      {/* Hallmark Bloom Working Grid (Piano Roll / Timeline) */}
      <div className="roll" style={{ padding: "1.25rem 1rem", border: "1px solid var(--color-rule)" }}>
        {/* Fine-Numeral Timecode Ruler */}
        <div className="bloom-ruler">
          <span>Day 0 · Budget added</span>
          <span>Day 3 · Best-fit creators shortlisted</span>
          <span>Day 10 · You approve the reel</span>
          <span>Day 7 after posting · Views verified, creators paid</span>
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
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-muted)", flexShrink: 0, marginLeft: "0.5rem" }}>
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
            Selected step
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
            What you pay for
          </span>
          <div className="num" style={{ fontSize: "1.5rem", color: "var(--color-accent)", marginTop: "0.2rem" }}>
            Views Instagram verifies
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.35rem" }}>
            Checked before anyone is paid
          </div>
        </div>
      </div>
    </div>
  );
}
