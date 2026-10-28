"use client";

import { useState, useTransition } from "react";
import { saveCreatorOnboarding } from "@/server/services/creator";
import { useRouter } from "next/navigation";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export function CreatorOnboardingForm() {
  const [error, setError] = useState<string | null>(null);
  const [igMsg, setIgMsg] = useState<string | null>(null);
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
            const langs = String(fd.get("languages") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const cats = String(fd.get("categories") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            const res = await saveCreatorOnboarding({
              displayName: String(fd.get("displayName") || ""),
              handle: String(fd.get("handle") || ""),
              city: String(fd.get("city") || ""),
              languages: langs,
              categories: cats,
              whatsapp: String(fd.get("whatsapp") || ""),
              pan: String(fd.get("pan") || ""),
              upi: String(fd.get("upi") || ""),
              followers: Number(fd.get("followers") || 0) || undefined,
            });
            if (res.instagram && !res.instagram.ready && res.instagram.message) {
              setIgMsg(res.instagram.message);
            }
            router.push("/creator");
            router.refresh();
          } catch {
            setError("Could not save. Sign in again if your session expired.");
          }
        });
      }}
    >
      <div className="field">
        <label htmlFor="displayName">Display name</label>
        <input id="displayName" name="displayName" required />
      </div>
      <div className="field">
        <label htmlFor="handle">Instagram handle</label>
        <input id="handle" name="handle" required placeholder="without @" />
      </div>
      <div className="field">
        <label htmlFor="city">City</label>
        <input id="city" name="city" required />
      </div>
      <div className="field">
        <label htmlFor="languages">Languages (comma-separated)</label>
        <input id="languages" name="languages" placeholder="Hindi, English" required />
      </div>
      <div className="field">
        <label htmlFor="categories">Categories (comma-separated)</label>
        <input id="categories" name="categories" placeholder="Beauty, Lifestyle" required />
      </div>
      <div className="field">
        <label htmlFor="whatsapp">WhatsApp number</label>
        <input id="whatsapp" name="whatsapp" required />
      </div>
      <div className="field">
        <label htmlFor="pan">PAN</label>
        <input id="pan" name="pan" required maxLength={10} />
      </div>
      <div className="field">
        <label htmlFor="upi">UPI ID</label>
        <input id="upi" name="upi" required placeholder="name@upi" />
      </div>
      <div className="field">
        <label htmlFor="followers">Followers (self-reported until Instagram is connected)</label>
        <input id="followers" name="followers" type="number" min={0} defaultValue={12000} />
      </div>
      {igMsg && (
        <div style={{ marginBottom: "0.75rem" }}>
          <ConnectBanner provider="Meta / Instagram" message={igMsg} />
        </div>
      )}
      {error && <p className="err">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save and continue"}
      </button>
    </form>
  );
}
