import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign In — RedCup" };

export default function LoginPage() {
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

        <div>
          <SignInForm />
        </div>
      </div>
    </MarketingShell>
  );
}
