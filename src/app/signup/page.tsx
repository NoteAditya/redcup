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
      <div style={{ maxWidth: 440 }}>
        <p className="chip" style={{ marginBottom: "0.85rem" }}>
          {role === "creator" ? "Creator" : "Brand"}
        </p>
        <h1>Create account</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.15rem" }}>
          Already have one? <Link href="/login">Sign in</Link>
        </p>
        <div>
          <SignUpForm defaultRole={role} />
        </div>
      </div>
    </MarketingShell>
  );
}
