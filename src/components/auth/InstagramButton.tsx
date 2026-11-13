/** Creator login. A plain link so it works without JS; the route sets state and redirects to Meta. */
export function InstagramButton({ label = "Continue with Instagram" }: { label?: string }) {
  return (
    <a
      href="/api/auth/instagram/start"
      className="btn btn-primary"
      data-testid="instagram-login"
      style={{
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.65rem",
        fontWeight: 600,
        textDecoration: "none",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
      {label}
    </a>
  );
}

/** Steps to switch a personal Instagram account to a professional one. */
export function ProfessionalAccountHelp() {
  return (
    <div className="muted" style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
      <p style={{ margin: 0 }}>
        RedCup works with Instagram <strong>Creator</strong> or <strong>Business</strong> accounts. Switching is free and
        keeps your posts and followers:
      </p>
      <ol style={{ margin: "0.5rem 0 0", paddingLeft: "1.2rem" }}>
        <li>In Instagram, open your profile and tap the menu (☰).</li>
        <li>Go to <strong>Settings and activity</strong> → <strong>Account type and tools</strong>.</li>
        <li>Tap <strong>Switch to professional account</strong> and pick <strong>Creator</strong>.</li>
        <li>Come back here and tap Continue with Instagram again.</li>
      </ol>
    </div>
  );
}

export const IG_ERRORS: Record<string, string> = {
  cancelled: "Instagram login was cancelled. Try again when you're ready.",
  state: "That login link expired. Start again with Continue with Instagram.",
  personal: "That Instagram account is a personal account. RedCup needs a Creator or Business account.",
  no_accounts:
    "No Instagram professional account was shared with RedCup. Make sure your account is a Creator or Business account and select it when Instagram asks.",
  multiple_accounts: "More than one Instagram account was shared. Log in again and share only your own account.",
  not_creator: "That Instagram account is linked to a brand or admin login. Use the brand sign-in below.",
  exchange: "Instagram didn't complete the login. Please try again.",
  config: "Instagram login isn't set up on this site yet. Please try again later.",
  failed: "Something went wrong talking to Instagram. Please try again.",
};
