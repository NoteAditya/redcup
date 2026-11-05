"use client";

import { useState, useTransition } from "react";
import { demoSignIn, demoSignUp, requestOtp } from "@/server/auth/actions";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { TextField } from "@/components/forms/Field";
import { emailOk, passwordOk, requiredText } from "@/lib/validate";

export function SignUpForm({ defaultRole = "brand" }: { defaultRole?: "brand" | "creator" }) {
  const [role, setRole] = useState<"brand" | "creator">(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<Record<string, string | null>>({});
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "" });
  const [pending, start] = useTransition();

  const set = (k: keyof typeof values, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setFieldErr((e) => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const next: Record<string, string | null> = {
      name: requiredText(values.name, role === "brand" ? "Business name" : "Display name"),
      email: values.email.trim() || values.phone.trim() ? (values.email.trim() ? emailOk(values.email) : null) : "Add an email or phone so we can reach you.",
      password: passwordOk(values.password),
    };
    setFieldErr(next);
    return !Object.values(next).some(Boolean);
  };

  return (
    <form
      className="card form-card"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (!validate()) return;
        start(async () => {
          const res = await demoSignUp({
            role,
            name: values.name,
            email: values.email.trim() || undefined,
            phone: values.phone.trim() || undefined,
            password: values.password,
          });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <div className="role-toggle" role="group" aria-label="Account type">
        <button type="button" className={`btn ${role === "brand" ? "btn-primary" : "btn-ghost"}`} onClick={() => setRole("brand")}>
          Brand
        </button>
        <button type="button" className={`btn ${role === "creator" ? "btn-primary" : "btn-ghost"}`} onClick={() => setRole("creator")}>
          Creator
        </button>
      </div>
      <GoogleButton mode="sign-up" role={role} />
      <AuthDivider />
      <TextField
        label={role === "brand" ? "Business name" : "Display name"}
        name="name"
        autoComplete="organization"
        required
        value={values.name}
        onChange={(e) => set("name", e.target.value)}
        onBlur={() => setFieldErr((e) => ({ ...e, name: requiredText(values.name, "Name") }))}
        error={fieldErr.name}
        hint="Shown on your profile and bounty cards."
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={values.email}
        onChange={(e) => set("email", e.target.value)}
        onBlur={() => values.email.trim() && setFieldErr((e) => ({ ...e, email: emailOk(values.email) }))}
        error={fieldErr.email}
        hint="Required unless you add a phone."
        placeholder="you@brand.com"
      />
      <TextField
        label="Phone"
        name="phone"
        autoComplete="tel"
        inputMode="tel"
        value={values.phone}
        onChange={(e) => set("phone", e.target.value)}
        hint="Optional when email is set."
        placeholder="+91…"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        value={values.password}
        onChange={(e) => set("password", e.target.value)}
        onBlur={() => setFieldErr((e) => ({ ...e, password: passwordOk(values.password) }))}
        error={fieldErr.password}
        hint="At least 6 characters."
      />
      {error && <p className="err" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}

export function SignInForm() {
  const [error, setError] = useState<string | null>(null);
  const [otpMsg, setOtpMsg] = useState<{ provider: string; message: string } | null>(null);
  const [values, setValues] = useState({ contact: "", password: "" });
  const [fieldErr, setFieldErr] = useState<Record<string, string | null>>({});
  const [pending, start] = useTransition();

  return (
    <div className="form-stack">
      <div className="card form-card" style={{ gap: "0.85rem" }}>
        <GoogleButton mode="sign-in" completeUrl="/auth/continue" />
        <AuthDivider label="or use password" />
      </div>
      <form
        className="card form-card"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const c = requiredText(values.contact, "Email or phone");
          const p = passwordOk(values.password);
          setFieldErr({ contact: c, password: p });
          if (c || p) return;
          start(async () => {
            const res = await demoSignIn({ contact: values.contact, password: values.password });
            if (res && !res.ok) setError(res.error);
          });
        }}
      >
        <TextField
          label="Email or phone"
          name="contact"
          autoComplete="username"
          required
          value={values.contact}
          onChange={(e) => setValues((s) => ({ ...s, contact: e.target.value }))}
          error={fieldErr.contact}
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={values.password}
          onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))}
          error={fieldErr.password}
        />
        {error && <p className="err" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={pending} type="submit">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <form
        className="card form-card"
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
        <p className="form-card-title">OTP sign-in</p>
        <p className="muted form-card-lede">Prefer a one-time code? Works when Resend is connected.</p>
        <TextField label="Email or phone" name="otpContact" required />
        {otpMsg && <ConnectBanner provider={otpMsg.provider} message={otpMsg.message} />}
        <button className="btn btn-ghost" type="submit" disabled={pending}>
          Send code
        </button>
      </form>
    </div>
  );
}
