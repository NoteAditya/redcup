/** Tiny CSS bar chart for daily series. No chart library needed. */
export function DailyBars({ series, label }: { series: { day: string; value: number }[]; label: string }) {
  const max = Math.max(1, ...series.map((s) => s.value));
  const total = series.reduce((a, s) => a + s.value, 0);
  const fmt = (d: string) =>
    new Date(d + "T00:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  return (
    <figure style={{ margin: 0 }}>
      <figcaption style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span className="muted adm-num">{total} in 30 days</span>
      </figcaption>
      <div className="adm-spark" role="img" aria-label={`${label}: ${total} in the last 30 days`}>
        {series.map((s) => (
          <span
            key={s.day}
            data-zero={s.value === 0 ? "1" : undefined}
            title={`${fmt(s.day)}: ${s.value}`}
            style={{ height: s.value === 0 ? "2px" : `${Math.max(4, Math.round((s.value / max) * 100))}%` }}
          />
        ))}
      </div>
      <div className="adm-spark-axis">
        <span>{fmt(series[0].day)}</span>
        <span>{fmt(series[series.length - 1].day)}</span>
      </div>
    </figure>
  );
}
