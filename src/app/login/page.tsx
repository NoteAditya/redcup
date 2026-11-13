import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { IG_ERRORS, InstagramButton, ProfessionalAccountHelp } from "@/components/auth/InstagramButton";

export const metadata = { title: "Sign In — RedCup" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ deactivated?: string; ig_error?: string; creator?: string }>;
}) {
  const { deactivated, ig_error, creator } = await searchParams;
  const igError = ig_error ? IG_ERRORS[ig_error] ?? IG_ERRORS.failed : null;
  return (
    <MarketingShell>
      <div
        style={{
          maxWidth: 420,
          margin: "2rem auto 4rem",
          backgroundColor: "var(--sheet)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ marginBottom: "1.25rem" }}>
          <span className="chip" style={{ marginBottom: "0.5rem" }}>
            Authentication
          </span>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Sign in to RedCup</h1>
          <p className="muted" style={{ fontSize: "0.875rem" }}>
            New to the platform?{" "}
            <Link href="/signup" style={{ color: "var(--ink)", fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>

        {deactivated ? (
          <p className="err" role="alert" style={{ marginBottom: "1rem" }}>
            This account has been turned off by RedCup. Contact support if you think this is a mistake.
          </p>
        ) : null}
        <section aria-labelledby="creator-login" style={{ marginBottom: "1.75rem" }}>
          <h2 id="creator-login" style={{ fontSize: "1rem", marginBottom: "0.35rem" }}>
            Creators
          </h2>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: "0.85rem" }}>
            Creators log in with their Instagram professional account. Your profile, followers and picture come from
            Instagram.
          </p>
          {creator === "instagram" && !igError ? (
            <p className="err" role="alert" style={{ marginBottom: "0.85rem" }}>
              Creator accounts now log in with Instagram only. Use the button below. Your existing RedCup profile is
              kept and links automatically when your Instagram username matches the handle on it.
            </p>
          ) : null}
          {igError ? (
            <div role="alert" style={{ marginBottom: "0.85rem" }}>
              <p className="err" style={{ marginBottom: "0.5rem" }}>
                {igError}
              </p>
              {ig_error === "personal" || ig_error === "no_accounts" ? <ProfessionalAccountHelp /> : null}
            </div>
          ) : null}
          <InstagramButton />
        </section>
        <section aria-labelledby="brand-login" style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
          <h2 id="brand-login" style={{ fontSize: "1rem", marginBottom: "0.85rem" }}>
            Brands and RedCup team
          </h2>
          <SignInForm />
        </section>
      </div>
    </MarketingShell>
  );
}
