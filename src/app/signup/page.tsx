import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { AuthStage } from "@/components/auth/AuthStage";
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
        <AuthStage
          eyebrow="Creator sign up"
          title="Your Instagram,"
          accent="ready for brands."
          sub="Sign up with your Instagram professional account. Your profile and top reels fill in for you."
        >
          <h2 className="auth-sheet-title">Join RedCup with Instagram</h2>
          <p className="muted" style={{ fontSize: "0.875rem", marginBottom: "1.25rem" }}>
            Creators sign up and log in with Instagram only. We read your username, name, bio, profile picture,
            follower and post counts, and the views on your reels. We never post for you.{" "}
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
        </AuthStage>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <AuthStage
        eyebrow="Brand sign up"
        title="Find creators who"
        accent="actually deliver."
        sub="Create a brand account, add your GST, and RedCup approves you before your first campaign."
      >
        <h2 className="auth-sheet-title">Create a brand account</h2>
        <p className="muted" style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--ink)", fontWeight: 600 }}>
            Sign in
          </Link>
          {" • "}
          <Link href="/signup" style={{ color: "var(--muted)" }}>
            Switch role
          </Link>
        </p>
        <SignUpForm />
      </AuthStage>
    </MarketingShell>
  );
}
