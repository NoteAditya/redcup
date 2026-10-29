import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { RolePicker } from "@/components/onboarding/RolePicker";

export const metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
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
      <div className="signup-stage">
        <p className="chip" style={{ marginBottom: "0.85rem" }}>
          {role === "creator" ? "Creator path" : "Brand path"}
        </p>
        <h1>{role === "creator" ? "Create your creator account" : "Create your brand account"}</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.15rem" }}>
          Already have one? <Link href="/login">Sign in</Link>
          {" · "}
          <Link href="/signup">Switch path</Link>
        </p>
        <div style={{ maxWidth: 440 }}>
          <SignUpForm defaultRole={role} />
        </div>
      </div>
    </MarketingShell>
  );
}
