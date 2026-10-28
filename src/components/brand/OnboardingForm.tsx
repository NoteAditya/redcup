"use client";

import { useState, useTransition } from "react";
import { saveBrandOnboarding } from "@/server/services/brand";
import { useRouter } from "next/navigation";

export function BrandOnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          try {
            await saveBrandOnboarding({
              businessName: String(fd.get("businessName") || ""),
              category: String(fd.get("category") || ""),
              city: String(fd.get("city") || ""),
              website: String(fd.get("website") || "") || undefined,
              gstin: String(fd.get("gstin") || "") || undefined,
            });
            router.push("/brand");
            router.refresh();
          } catch {
            setError("Could not save. Sign in again if your session expired.");
          }
        });
      }}
    >
      <div className="field">
        <label htmlFor="businessName">Business name</label>
        <input id="businessName" name="businessName" required />
      </div>
      <div className="field">
        <label htmlFor="category">Category</label>
        <input id="category" name="category" placeholder="Beauty, D2C, Food…" required />
      </div>
      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" name="city" required />
      </div>
      <div className="field">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="url" placeholder="https://" />
      </div>
      <div className="field">
        <label htmlFor="gstin">GSTIN (for KYC)</label>
        <input id="gstin" name="gstin" maxLength={15} />
      </div>
      {error && <p className="err">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
