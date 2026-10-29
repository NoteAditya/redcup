"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { saveBrandOnboarding } from "@/server/services/brand";
import { CupProgress } from "@/components/onboarding/CupProgress";
import { useDraft } from "@/components/onboarding/useDraft";

type Draft = {
  businessName: string;
  category: string;
  city: string;
  website: string;
  gstin: string;
  step: number;
};

const STEPS = [
  {
    key: "businessName" as const,
    label: "Business name",
    question: "What should creators call your brand?",
    hint: "This appears on bounty cards and shortlists.",
    placeholder: "e.g. Glow Lab",
    required: true,
  },
  {
    key: "category" as const,
    label: "Category",
    question: "Which category feels closest?",
    hint: "Beauty, D2C, Food, Fintech — keep it short.",
    placeholder: "Beauty",
    required: true,
  },
  {
    key: "city" as const,
    label: "City",
    question: "Where is the brand based?",
    hint: "Used for city-weighted eligibility later.",
    placeholder: "Mumbai",
    required: true,
  },
  {
    key: "website" as const,
    label: "Website",
    question: "Got a site we can link?",
    hint: "Optional — skip if you are still launching.",
    placeholder: "https://",
    required: false,
    type: "url",
  },
  {
    key: "gstin" as const,
    label: "GSTIN (for KYC)",
    question: "GSTIN for KYC?",
    hint: "Admin review before your first bounty goes live.",
    placeholder: "15 characters",
    required: false,
    maxLength: 15,
  },
];

export function BrandOnboardingForm() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [celebrate, setCelebrate] = useState(false);
  const { data, save, clear, hydrated } = useDraft<Draft>("redcup.brand.onboarding", {
    businessName: "",
    category: "",
    city: "",
    website: "",
    gstin: "",
    step: 0,
  });

  const step = Math.min(data.step, STEPS.length - 1);
  const current = STEPS[step];
  const progress = (step + (data[current.key] ? 0.55 : 0)) / STEPS.length;

  useEffect(() => {
    if (hydrated) inputRef.current?.focus();
  }, [step, hydrated]);

  const previewReady = useMemo(
    () => Boolean(data.businessName || data.category || data.city),
    [data.businessName, data.category, data.city],
  );

  const advance = () => {
    const val = data[current.key]?.trim() || "";
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
        await saveBrandOnboarding({
          businessName: data.businessName,
          category: data.category,
          city: data.city,
          website: data.website || undefined,
          gstin: data.gstin || undefined,
        });
        clear();
        setCelebrate(true);
        setTimeout(() => {
          router.push("/brand");
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

  if (!hydrated) {
    return <div className="card muted">Resuming your draft…</div>;
  }

  if (celebrate) {
    return (
      <div className="onboard-celebrate card" role="status">
        <div className="onboard-celebrate-mark" aria-hidden />
        <h2>Brand path unlocked</h2>
        <p className="muted">Taking you to the dashboard — KYC review comes next.</p>
      </div>
    );
  }

  return (
    <div className="onboard-flow onboard-flow-brand">
      <CupProgress progress={progress} label={`Brand setup · step ${step + 1} of ${STEPS.length}`} />
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
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={advance}
                  disabled={pending}
                >
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
          <h3 style={{ fontSize: "1rem", marginBottom: "0.65rem" }}>Live bounty preview</h3>
          <div className={`bounty-card card ${previewReady ? "is-alive" : "is-ghost"}`}>
            <div className="bounty-card-top">
              <div>
                <strong className="bounty-card-title">
                  {data.businessName ? `${data.businessName} reel bounty` : "Your first bounty"}
                </strong>
                <div className="muted bounty-card-sub">
                  {data.businessName || "Brand"} · {data.category || "Category"} · {data.city || "City"}
                </div>
              </div>
              <span className="chip">draft</span>
            </div>
            <div className="bounty-card-foot">
              <span className="bounty-card-budget">{data.website ? "Site linked" : "Budget TBD"}</span>
              <span className="bounty-card-cta muted">{data.gstin ? "KYC ready" : "KYC pending"}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
