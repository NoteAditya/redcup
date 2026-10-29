"use client";

import { useState, useTransition } from "react";
import { demoSignIn, demoSignUp, requestOtp } from "@/server/auth/actions";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export function SignUpForm({ defaultRole = "brand" }: { defaultRole?: "brand" | "creator" }) {
  const [role, setRole] = useState<"brand" | "creator">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const res = await demoSignUp({
            role,
            name: String(fd.get("name") || ""),
            email: String(fd.get("email") || "") || undefined,
            phone: String(fd.get("phone") || "") || undefined,
            password: String(fd.get("password") || ""),
          });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button type="button" className={`btn ${role === "brand" ? "btn-primary" : "btn-ghost"}`} onClick={() => setRole("brand")}>
          Brand
        </button>
        <button type="button" className={`btn ${role === "creator" ? "btn-primary" : "btn-ghost"}`} onClick={() => setRole("creator")}>
          Creator
        </button>
      </div>
      <div className="field">
        <label htmlFor="name">{role === "brand" ? "Business name" : "Display name"}</label>
        <input id="name" name="name" className="input" required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" className="input" type="email" autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="phone">Phone (optional)</label>
        <input id="phone" name="phone" className="input" autoComplete="tel" />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" className="input" type="password" required minLength={6} autoComplete="new-password" />
      </div>
      {error && <p className="err">{error}</p>}
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [otpMsg, setOtpMsg] = useState<{ provider: string; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setError(null);
          start(async () => {
            const res = await demoSignIn({
              contact: String(fd.get("contact") || ""),
              password: String(fd.get("password") || ""),
            });
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <div className="field">
          <label htmlFor="contact">Email or phone</label>
          <input id="contact" name="contact" className="input" required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" className="input" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="err">{error}</p>}
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setOtpMsg(null);
          start(async () => {
            const res = await requestOtp(String(fd.get("otpContact") || ""));
            if (!res.ok && "needsConnect" in res && res.needsConnect) {
              setOtpMsg({ provider: res.provider, message: res.message });
            }
          });
        }}
      >
        <p style={{ marginBottom: "0.5rem", fontWeight: 700 }}>OTP sign-in</p>
        <p className="muted" style={{ marginBottom: "0.75rem", fontSize: "0.85rem" }}>
          Prefer a code? Add a Resend or SMS key later. Until then this shows Connect.
        </p>
        <div className="field">
          <label htmlFor="otpContact">Email or phone</label>
          <input id="otpContact" name="otpContact" className="input" required />
        </div>
        <button className="btn btn-ghost" type="submit" disabled={pending}>
          Send code
        </button>
        {otpMsg && <div style={{ marginTop: "0.75rem" }}><ConnectBanner provider={otpMsg.provider} message={otpMsg.message} /></div>}
      </form>
    </div>
  );
}
