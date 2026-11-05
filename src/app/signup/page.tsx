import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { RolePicker } from "@/components/onboarding/RolePicker";
import { ClaimRoleForm } from "@/components/auth/ClaimRoleForm";
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
            {role === "creator" ? "Creator Registration" : "Brand Registration"}
          </span>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>
            {role === "creator" ? "Create Creator Account" : "Create Brand Account"}
          </h1>
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
          <SignUpForm defaultRole={role} />
        </div>
      </div>
    </MarketingShell>
  );
}
