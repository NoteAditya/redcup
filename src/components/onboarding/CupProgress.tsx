"use client";

export function CupProgress({
  progress,
  label,
}: {
  progress: number; // 0..1
  label: string;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const fillH = Math.round(pct * 72);
  return (
    <div className="cup-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct * 100)} aria-label={label}>
      <div className="cup-progress-visual" aria-hidden>
        <div className="cup-progress-bowl">
          <div className="cup-progress-fill" style={{ height: fillH }} />
        </div>
        <div className="cup-progress-rim" />
      </div>
      <div className="cup-progress-meta">
        <strong>{Math.round(pct * 100)}%</strong>
        <span className="muted">{label}</span>
      </div>
    </div>
  );
}
