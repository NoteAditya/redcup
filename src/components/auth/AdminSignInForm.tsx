"use client";

import { useActionState } from "react";
import { adminSignInForm } from "@/server/auth/admin-login";

/**
 * Posts straight to a server action, so even before JavaScript loads the browser sends a POST:
 * credentials never end up in the URL.
 */
export function AdminSignInForm() {
  const [state, action, pending] = useActionState(adminSignInForm, null);
  return (
    <form className="admin-login-form" action={action} method="post">
      <label className="field">
        <span className="field-label">Email</span>
        <input className="field-control" type="email" name="email" autoComplete="username" required />
      </label>
      <label className="field">
        <span className="field-label">Password</span>
        <input className="field-control" type="password" name="password" autoComplete="current-password" required />
      </label>
      {state && !state.ok ? (
        <p className="err" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
