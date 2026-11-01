"use client";

export function CupProgress({
  progress,
  label,
}: {
  progress: number; // 0..1
  label: string;
}) {
  const pct = Math.max(0, Math.min(1, progress));
  const rounded = Math.round(pct * 100);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={rounded}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.65rem 0.85rem",
        borderRadius: "var(--radius-card)",
        backgroundColor: "var(--sheet)",
        border: "1px solid var(--line)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "0.8125rem",
          color: "var(--ink)",
          flexShrink: 0,
        }}
      >
        {rounded}%
      </div>

      <div style={{ display: "grid", gap: "0.2rem", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
          <strong style={{ color: "var(--ink)" }}>{label}</strong>
          <span style={{ color: "var(--muted)" }}>Complete</span>
        </div>
        <div
          style={{
            height: "3px",
            backgroundColor: "var(--frame)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${rounded}%`,
              backgroundColor: "var(--ink)",
              transition: "width 200ms ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
