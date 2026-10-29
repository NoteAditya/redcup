"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { saveCreatorOnboarding } from "@/server/services/creator";
import { CupProgress } from "@/components/onboarding/CupProgress";
import { useDraft } from "@/components/onboarding/useDraft";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

type Draft = {
  displayName: string;
  handle: string;
  city: string;
  languages: string;
  categories: string;
  whatsapp: string;
  pan: string;
  upi: string;
  followers: string;
  step: number;
};

const STEPS = [
  { key: "displayName" as const, label: "Display name", question: "What name should brands see?", hint: "Your creator face on RedCup.", placeholder: "Ananya", required: true },
  { key: "handle" as const, label: "Instagram handle", question: "Your Instagram handle?", hint: "Without the @.", placeholder: "ananya.creates", required: true },
  { key: "city" as const, label: "City", question: "Which city are you based in?", hint: "Helps city-weighted eligibility.", placeholder: "Mumbai", required: true },
  { key: "languages" as const, label: "Languages (comma-separated)", question: "Languages you create in?", hint: "Comma-separated is fine.", placeholder: "Hindi, English", required: true },
  { key: "categories" as const, label: "Categories (comma-separated)", question: "Your niches?", hint: "Beauty, Lifestyle, Food…", placeholder: "Beauty, Lifestyle", required: true },
  { key: "whatsapp" as const, label: "WhatsApp number", question: "WhatsApp for campaign pings?", hint: "Brands never see this raw — ops may.", placeholder: "+91…", required: true },
  { key: "pan" as const, label: "PAN", question: "PAN for payouts?", hint: "Stored masked after save.", placeholder: "ABCDE1234F", required: true, maxLength: 10 },
  { key: "upi" as const, label: "UPI ID", question: "UPI ID for earnings?", hint: "Stored masked after save.", placeholder: "you@upi", required: true },
  { key: "followers" as const, label: "Followers (self-reported until Instagram connects)", question: "About how many followers?", hint: "Self-reported until Meta connect is live.", placeholder: "15000", required: false, type: "number" },
];

export function CreatorOnboardingForm({ igMessage }: { igMessage?: string | null }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const { data, save, clear, hydrated } = useDraft<Draft>("redcup.creator.onboarding", {
    displayName: "",
    handle: "",
    city: "",
    languages: "",
    categories: "",
    whatsapp: "",
    pan: "",
    upi: "",
    followers: "",
    step: 0,
  });

  const step = Math.min(data.step, STEPS.length - 1);
  const current = STEPS[step];
  const progress = (step + (data[current.key] ? 0.45 : 0)) / STEPS.length;

  useEffect(() => {
    if (hydrated) inputRef.current?.focus();
  }, [step, hydrated]);

  const previewReady = useMemo(() => Boolean(data.displayName || data.handle), [data.displayName, data.handle]);

  const advance = () => {
    const val = String(data[current.key] || "").trim();
    if (current.required && !val) {
      setError("This one is required.");
      return;
    }
    setError(null);
    if (step < STEPS.length - 1) {
      save({ step: step + 1 });
      return;
    }
    start(async () => {
      try {
        const langs = data.languages.split(",").map((s) => s.trim()).filter(Boolean);
        const cats = data.categories.split(",").map((s) => s.trim()).filter(Boolean);
        await saveCreatorOnboarding({
          displayName: data.displayName,
          handle: data.handle,
          city: data.city,
          languages: langs,
          categories: cats,
          whatsapp: data.whatsapp,
          pan: data.pan,
          upi: data.upi,
          followers: Number(data.followers || 0) || undefined,
        });
        clear();
        setCelebrate(true);
        setTimeout(() => {
          router.push("/creator");
          router.refresh();
        }, reduce ? 0 : 900);
      } catch {
        setError("Could not save. Sign in again if your session expired.");
      }
    });
  };

  const back = () => {
    setError(null);
    if (step > 0) save({ step: step - 1 });
  };

  if (!hydrated) return <div className="card muted">Resuming your draft…</div>;

  if (celebrate) {
    return (
      <div className="onboard-celebrate card" role="status">
        <div className="onboard-celebrate-mark" aria-hidden />
        <h2>Creator path unlocked</h2>
        <p className="muted">Your profile card is ready — finding open bounties.</p>
      </div>
    );
  }

  return (
    <div className="onboard-flow onboard-flow-creator">
      {igMessage ? (
        <div style={{ marginBottom: "1rem" }}>
          <ConnectBanner provider="Meta / Instagram" message={igMessage} />
        </div>
      ) : null}
      <CupProgress progress={progress} label={`Creator setup · step ${step + 1} of ${STEPS.length}`} />
      <div className="onboard-grid">
        <div className="onboard-question card">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.key}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <h2 style={{ fontSize: "1.25rem" }}>{current.question}</h2>
              <p className="muted" style={{ marginTop: "0.4rem", fontSize: "0.88rem" }}>
                {current.hint}
              </p>
              <div className="field" style={{ marginTop: "1.1rem" }}>
                <label htmlFor={current.key}>{current.label}</label>
                <input
                  ref={inputRef}
                  id={current.key}
                  name={current.key}
                  className="input"
                  value={data[current.key]}
                  maxLength={"maxLength" in current ? current.maxLength : undefined}
                  type={"type" in current ? (current.type as string) : "text"}
                  placeholder={current.placeholder}
                  required={current.required}
                  onChange={(e) => save({ [current.key]: e.target.value, step } as Partial<Draft>)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      advance();
                    }
                  }}
                />
              </div>
              {error && <p className="err">{error}</p>}
              <div className="onboard-actions">
                <button type="button" className="btn btn-ghost" onClick={back} disabled={step === 0 || pending}>
                  Back
                </button>
                <button type="button" className="btn btn-primary" onClick={advance} disabled={pending}>
                  {pending ? "Saving…" : step === STEPS.length - 1 ? "Save and continue" : "Continue"}
                </button>
              </div>
              <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.78rem" }}>
                Autosaved on this device. Press Enter to continue.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="onboard-preview" aria-live="polite">
          <h3 style={{ fontSize: "1rem", marginBottom: "0.65rem" }}>Live profile card</h3>
          <div className={`creator-preview-card card ${previewReady ? "is-alive" : "is-ghost"}`}>
            <div className="creator-preview-avatar" aria-hidden>
              {(data.displayName || "?").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{data.displayName || "Your name"}</strong>
              <div className="muted" style={{ fontSize: "0.85rem" }}>
                @{data.handle || "handle"} · {data.city || "City"}
              </div>
              <div style={{ marginTop: "0.55rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                {(data.categories || "Niche")
                  .split(",")
                  .map((c) => c.trim())
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((c) => (
                    <span key={c} className="chip">
                      {c}
                    </span>
                  ))}
              </div>
              <div className="muted" style={{ marginTop: "0.65rem", fontSize: "0.82rem" }}>
                {data.followers ? `${Number(data.followers).toLocaleString("en-IN")} followers` : "Followers pending"} ·{" "}
                {data.languages || "Languages"}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
