import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <MarketingShell>
      <h1>Sign in</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
      <div style={{ maxWidth: 420 }}>
        <SignInForm />
      </div>
    </MarketingShell>
  );
}
