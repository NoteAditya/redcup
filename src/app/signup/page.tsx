import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { RolePicker } from "@/components/onboarding/RolePicker";
import { ClaimRoleForm } from "@/components/auth/ClaimRoleForm";
import { InstagramButton, ProfessionalAccountHelp } from "@/components/auth/InstagramButton";
import { getSession } from "@/server/auth/session";

export const metadata = { title: "Sign Up — RedCup" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; claim?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const claiming = sp.claim === "1" || session.needsRole;

  if (claiming) {
    return (
      <MarketingShell>
        <div style={{ maxWidth: 440, margin: "2rem auto 4rem" }}>
          <ClaimRoleForm />
        </div>
      </MarketingShell>
    );
  }

  const hasRole = sp.role === "brand" || sp.role === "creator";
  const role = sp.role === "creator" ? "creator" : "brand";

  if (!hasRole) {
    return (
      <MarketingShell>
        <RolePicker />
      </MarketingShell>
    );
  }

  if (role === "creator") {
    return (
      <MarketingShell>
        <div
          style={{
            maxWidth: 440,
            margin: "2rem auto 4rem",
            backgroundColor: "var(--sheet)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-card)",
            padding: "2rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <span className="chip" style={{ marginBottom: "0.5rem" }}>
            Creator Registration
          </span>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.35rem" }}>Join RedCup with Instagram</h1>
          <p className="muted" style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Creators sign up and log in with Instagram only. We read your username, name, bio, profile picture,
            follower and post counts, and later the views on reels you post for a campaign. We never post for you.{" "}
            <Link href="/privacy" style={{ color: "var(--ink)" }}>
              Privacy
            </Link>
          </p>
          <InstagramButton />
          <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
            <ProfessionalAccountHelp />
          </div>
          <p className="muted" style={{ fontSize: "0.85rem", marginTop: "1rem" }}>
            Already joined?{" "}
            <Link href="/login" style={{ color: "var(--ink)", fontWeight: 600 }}>
              Log in
            </Link>
            {" • "}
            <Link href="/signup" style={{ color: "var(--muted)" }}>
              Switch role
            </Link>
          </p>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <div
        style={{
          maxWidth: 440,
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
            Brand Registration
          </span>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Create Brand Account</h1>
          <p className="muted" style={{ fontSize: "0.875rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--ink)", fontWeight: 600 }}>
              Sign in
            </Link>
            {" • "}
            <Link href="/signup" style={{ color: "var(--muted)" }}>
              Switch role
            </Link>
          </p>
        </div>
        <div>
          <SignUpForm />
        </div>
      </div>
    </MarketingShell>
  );
}
