"use client";

import { useState, useTransition } from "react";
import { adminSignIn } from "@/server/auth/admin-login";

export function AdminSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="admin-login-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!email.trim() || !password) {
          setError("Enter your admin email and password.");
          return;
        }
        start(async () => {
          const res = await adminSignIn({ email, password });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <label className="field">
        <span className="field-label">Email</span>
        <input
          className="field-control"
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="field">
        <span className="field-label">Password</span>
        <input
          className="field-control"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error ? (
        <p className="err" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
