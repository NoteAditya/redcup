"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { setPendingRole } from "@/server/auth/actions";

type Props = {
  mode: "sign-in" | "sign-up";
  role?: "brand" | "creator";
  completeUrl?: string;
};

export function GoogleButton({ mode, role, completeUrl }: Props) {
  const { signIn, fetchStatus: signInStatus } = useSignIn();
  const { signUp, fetchStatus: signUpStatus } = useSignUp();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const loaded = Boolean(signIn) && Boolean(signUp);
  const busy = pending || signInStatus === "fetching" || signUpStatus === "fetching";

  const fallbackComplete =
    completeUrl ||
    (role === "creator" ? "/creator/onboarding" : role === "brand" ? "/brand/onboarding" : "/auth/continue");

  const onClick = () => {
    setError(null);
    start(async () => {
      try {
        if (role) await setPendingRole(role);
        if (!loaded) {
          setError("Google sign-in is still loading. Try again in a moment.");
          return;
        }
        const redirectCallbackUrl = `${window.location.origin}/sso-callback`;
        const redirectUrl = `${window.location.origin}${fallbackComplete}`;
        const client = mode === "sign-up" ? signUp : signIn;
        if (!client || typeof client.sso !== "function") {
          setError("Google sign-in is unavailable in this build.");
          return;
        }
        const { error: ssoError } = await client.sso({
          strategy: "oauth_google",
          redirectUrl,
          redirectCallbackUrl,
        });
        if (ssoError) setError(ssoError.message || "Google sign-in failed.");
      } catch (err) {
        const message =
          err && typeof err === "object" && "errors" in err
            ? String((err as { errors?: { message?: string }[] }).errors?.[0]?.message || "")
            : err instanceof Error
              ? err.message
              : "Google sign-in failed.";
        setError(message || "Google sign-in failed.");
      }
    });
  };

  return (
    <div style={{ display: "grid", gap: "0.65rem" }}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onClick}
        disabled={busy || !loaded}
        style={{
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.65rem",
          border: "1px solid var(--line)",
          background: "var(--sheet)",
          color: "var(--ink)",
          fontWeight: 600,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.1 39.5 16 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.1 7.1l.1.1 6.2 5.2C37.3 39.1 44 34 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </svg>
        {busy ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && (
        <p className="err" role="alert" style={{ fontSize: "0.8125rem" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        gap: "0.75rem",
        alignItems: "center",
        margin: "0.35rem 0 0.85rem",
        color: "var(--muted)",
        fontSize: "0.75rem",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ height: 1, background: "var(--line)" }} />
      <span>{label}</span>
      <span style={{ height: 1, background: "var(--line)" }} />
    </div>
  );
}
