/**
 * Auth page layout: a simple left panel with the logo and one line, the form on the right.
 */
export function AuthStage({
  eyebrow,
  title,
  accent,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-stage">
      <div className="auth-panel">
        <span className="auth-panel-logo">
          <span className="logo-mark" aria-hidden="true" />
          <span>RedCup</span>
        </span>
        <span className="auth-panel-eyebrow">{eyebrow}</span>
        <h1>
          {title} {accent ? <em>{accent}</em> : null}
        </h1>
        <p>{sub}</p>
      </div>
      <div className="auth-sheet">{children}</div>
    </div>
  );
}
