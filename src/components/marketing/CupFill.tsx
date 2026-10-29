"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/money";

/** Live interface fragment: drag budget → cup fills. Motif = cup rim. */
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
  const fill = useMemo(() => {
    const min = 10000;
    const max = 500000;
    const t = Math.min(1, Math.max(0, (budget - min) / (max - min)));
    return Math.round(18 + t * 78);
  }, [budget]);

  return (
    <div className="hero-panel" data-ui>
      <div className="hero-panel-inner">
        <p className="hero-panel-title">Fund a bounty</p>
        <div className="cup-fill">
          <div className="cup-fill-visual" aria-hidden>
            <div className="cup-fill-rim" />
            <div className="cup-fill-bowl">
              <div className="cup-fill-liquid" style={{ height: `${fill}%` }} />
            </div>
          </div>
          <label>
            Creator budget
            <input
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-valuetext={formatINR(budgetPaise)}
            />
          </label>
          <div className="cup-fill-meta">
            <div>
              <span>Creators get</span>
              <strong>{formatINR(budgetPaise)}</strong>
            </div>
            <div>
              <span>Platform fee (15%)</span>
              <strong>{formatINR(feePaise)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
