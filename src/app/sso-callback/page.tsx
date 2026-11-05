import { SSOCallbackClient } from "@/components/auth/SSOCallbackClient";

export const metadata = { title: "Continuing sign-in — RedCup" };

export default function SSOCallbackPage() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
        color: "var(--muted)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "0.75rem", color: "var(--ink)", fontWeight: 600 }}>
          Finishing Google sign-in…
        </p>
        <SSOCallbackClient />
      </div>
    </main>
  );
}
