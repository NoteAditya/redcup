import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignUpForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role === "creator" ? "creator" : "brand";
  return (
    <MarketingShell>
      <h1>Create account</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        Already have one? <Link href="/login">Sign in</Link>
      </p>
      <div style={{ maxWidth: 420 }}>
        <SignUpForm defaultRole={role} />
      </div>
    </MarketingShell>
  );
}
