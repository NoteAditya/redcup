/**
 * Auth page layout: a headline with a fan of bento tiles (what a RedCup profile is made of) and a
 * bottom-sheet style card for the form. Tiles describe features only: no sample people or numbers.
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
      <div className="auth-stage-head">
        <span className="chip">{eyebrow}</span>
        <h1>
          {title} {accent ? <em>{accent}</em> : null}
        </h1>
        <p>{sub}</p>
      </div>
      <div className="auth-fan" aria-hidden>
        <div className="auth-fan-tile t1">
          <span className="auth-fan-ico">◎</span>
          <b>Instagram profile</b>
          <small>Picture, bio and followers straight from Instagram</small>
        </div>
        <div className="auth-fan-tile t2 is-ink">
          <span className="auth-fan-ico">▶</span>
          <b>Your RedCup profile</b>
          <small>Your best reels and verified stats in one link</small>
        </div>
        <div className="auth-fan-tile t3 is-red">
          <span className="auth-fan-ico">₹</span>
          <b>Brand-funded campaigns</b>
          <small>A fixed base plus verified views</small>
        </div>
        <div className="auth-fan-tile t4">
          <span className="auth-fan-ico">✓</span>
          <b>Reviewed by RedCup</b>
          <small>Every brand and campaign is approved</small>
        </div>
        <div className="auth-fan-tile t5 is-blush">
          <span className="auth-fan-ico">#</span>
          <b>Niches</b>
          <small>Fashion · Beauty · Food · Tech…</small>
        </div>
      </div>
      <div className="auth-sheet">
        <span className="auth-sheet-handle" aria-hidden />
        {children}
      </div>
    </div>
  );
}
