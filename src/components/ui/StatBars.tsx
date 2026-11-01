export function StatBars({
  items,
}: {
  items: { label: string; value: number; tone?: "cup" | "ok" | "warn" | "ink" }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div style={{ display: "grid", gap: "0.5rem" }} role="img" aria-label="Status distribution">
      {items.map((i) => {
        const toneColor =
          i.tone === "ok"
            ? "var(--ok)"
            : i.tone === "warn"
              ? "var(--warn)"
              : "var(--ink)";

        return (
          <div key={i.label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginBottom: "0.2rem",
              }}
            >
              <span>{i.label.replace(/_/g, " ")}</span>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--ink)" }}>{i.value}</strong>
            </div>
            <div
              style={{
                height: "3px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--frame)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: toneColor,
                  width: `${Math.round((i.value / max) * 100)}%`,
                  transition: "width 200ms ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
