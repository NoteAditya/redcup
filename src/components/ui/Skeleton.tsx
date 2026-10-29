export function Skeleton({ height = 72, className = "" }: { height?: number; className?: string }) {
  return <div className={`skeleton ${className}`} style={{ height }} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div style={{ display: "grid", gap: "0.85rem" }}>
      <Skeleton height={36} />
      <Skeleton height={18} />
      <div className="axis axis-3">
        <Skeleton height={120} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
      <Skeleton height={160} />
    </div>
  );
}
