export function StatBars({
  items,
}: {
  items: { label: string; value: number; tone?: "cup" | "ok" | "warn" | "ink" }[];
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="stat-bars" role="img" aria-label="Status distribution">
      {items.map((i) => (
        <div key={i.label} className="stat-bar-row">
          <div className="stat-bar-meta">
            <span>{i.label}</span>
            <strong>{i.value}</strong>
          </div>
          <div className="stat-bar-track">
            <div
              className={`stat-bar-fill tone-${i.tone || "cup"}`}
              style={{ width: `${Math.round((i.value / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
