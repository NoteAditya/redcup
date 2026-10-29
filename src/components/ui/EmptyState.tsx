import Link from "next/link";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state card">
      <div className="empty-state-mark" aria-hidden />
      <h3>{title}</h3>
      <p className="muted" style={{ marginTop: "0.4rem", maxWidth: "42ch" }}>
        {body}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
