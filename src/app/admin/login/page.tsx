import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { AdminSignInForm } from "@/components/auth/AdminSignInForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign in — RedCup", robots: { index: false, follow: false } };

/** Minimal admin-only sign-in: email and password, nothing else. */
export default async function AdminLoginPage() {
  const session = await getSession();
  if (session.isLoggedIn && session.role === "admin") redirect("/admin");
  const otherRole = session.isLoggedIn && session.role !== "admin";
  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-mark" aria-hidden>
          RC
        </div>
        <h1>RedCup admin</h1>
        <p className="muted">Sign in with the admin account RedCup gave you.</p>
        {otherRole ? (
          <p className="err" role="alert">
            You&apos;re signed in with a non-admin account. Sign in with an admin account to continue.
          </p>
        ) : null}
        <AdminSignInForm />
      </div>
    </main>
  );
}
