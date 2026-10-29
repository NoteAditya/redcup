import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: 440 }}>
        <h1>Sign in</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.15rem" }}>
          New here? <Link href="/signup">Create an account</Link>
        </p>
        <div>
          <SignInForm />
        </div>
      </div>
    </MarketingShell>
  );
}
