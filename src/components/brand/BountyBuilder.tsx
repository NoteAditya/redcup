"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaignDraft, fundCampaign, previewEligibleCount } from "@/server/services/campaigns";
import { formatINR, brandCheckoutTotal, rupeesToPaise } from "@/lib/money";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { TestModeBanner } from "@/components/ui/TestModeBanner";
import type { CampaignCriteria } from "@/lib/types";
import { requiredText, positiveRupees } from "@/lib/validate";

const PRESETS: { id: string; label: string; criteria: CampaignCriteria }[] = [
  {
    id: "beauty_micro",
    label: "Beauty micro (10K–50K)",
    criteria: {
      followers: { mode: "must", min: 10000, max: 50000 },
      niches: { mode: "must", any_of: ["Beauty", "Skincare"] },
      audience_country: { mode: "must", country: "IN", min_pct: 60 },
      languages: { mode: "nice", any_of: ["Hindi", "English"] },
      avg_reel_views: { mode: "nice", min: 3000 },
    },
  },
  {
    id: "food_nano",
    label: "Food nano (1K–10K)",
    criteria: {
      followers: { mode: "must", min: 1000, max: 10000 },
      niches: { mode: "must", any_of: ["Food", "Cafe"] },
      audience_country: { mode: "must", country: "IN", min_pct: 70 },
      audience_cities: { mode: "nice", any_of: ["Mumbai", "Delhi", "Bengaluru"], min_pct: 15 },
    },
  },
  {
    id: "open_india",
    label: "Open India (1K+)",
    criteria: {
      followers: { mode: "must", min: 1000 },
      audience_country: { mode: "must", country: "IN", min_pct: 50 },
    },
  },
];

export function BountyBuilder() {
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [eligible, setEligible] = useState<number | null>(null);
  const [budgetRupees, setBudgetRupees] = useState(25000);
  const [baseRupees, setBaseRupees] = useState(1500);
  const [rateRupees, setRateRupees] = useState(800);
  const [capRupees, setCapRupees] = useState(15000);
  const [slots, setSlots] = useState(3);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [dosDonts, setDosDonts] = useState("");
  const [fieldErr, setFieldErr] = useState<Record<string, string | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [payMsg, setPayMsg] = useState<{ provider: string; message: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const criteria = useMemo(
    () => PRESETS.find((p) => p.id === presetId)?.criteria || PRESETS[0].criteria,
    [presetId],
  );
  const checkout = brandCheckoutTotal(rupeesToPaise(budgetRupees));

  return (
    <div className="axis axis-2">
      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          setPayMsg(null);
          const next = {
            title: requiredText(title, "Title"),
            brief: requiredText(brief, "Brief"),
            budget: positiveRupees(budgetRupees, "Budget", 5000),
            base: positiveRupees(baseRupees, "Base per creator", 100),
            rate: positiveRupees(rateRupees, "Rate per 1K views", 1),
            cap: positiveRupees(capRupees, "Cap per creator", 1000),
            slots: slots < 1 ? "Slots must be at least 1." : null,
          };
          setFieldErr(next);
          if (Object.values(next).some(Boolean)) return;
          start(async () => {
            const draft = await createCampaignDraft({
              title: title.trim(),
              brief: brief.trim(),
              dosDonts: dosDonts.trim(),
              ratePer1000Paise: rupeesToPaise(rateRupees),
              budgetPaise: rupeesToPaise(budgetRupees),
              basePaise: rupeesToPaise(baseRupees),
              capPerCreatorPaise: rupeesToPaise(capRupees),
              slots,
              criteria,
              presetId,
            });
            if (!draft.ok) {
              setError(draft.error);
              return;
            }
            const funded = await fundCampaign(draft.campaign.id);
            if (!funded.ok) {
              setError(funded.error);
              router.push("/brand/bounties/" + draft.campaign.id);
              return;
            }
            if (!funded.payment.ready && funded.payment.message) {
              setPayMsg({ provider: funded.payment.provider, message: funded.payment.message });
            }
            router.push("/brand/bounties/" + draft.campaign.id);
            router.refresh();
          });
        }}
      >
        <div className={`field ${fieldErr.title ? "is-invalid" : ""}`}>
          <label className="field-label" htmlFor="title">Title <span className="field-req" aria-hidden="true" /></label>
          <input id="title" name="title" className="field-control" value={title} onChange={(e) => { setTitle(e.target.value); setFieldErr((f) => ({ ...f, title: null })); }} placeholder="Weekend skincare reel" aria-invalid={fieldErr.title ? true : undefined} aria-describedby="title-help" />
          <p className="field-helper" id="title-help" role={fieldErr.title ? "alert" : undefined}>{fieldErr.title || "Shown on the open bounty list."}</p>
        </div>
        <div className={`field ${fieldErr.brief ? "is-invalid" : ""}`}>
          <label className="field-label" htmlFor="brief">Brief <span className="field-req" aria-hidden="true" /></label>
          <textarea id="brief" name="brief" className="field-control field-textarea" value={brief} onChange={(e) => { setBrief(e.target.value); setFieldErr((f) => ({ ...f, brief: null })); }} aria-invalid={fieldErr.brief ? true : undefined} aria-describedby="brief-help" />
          <p className="field-helper" id="brief-help" role={fieldErr.brief ? "alert" : undefined}>{fieldErr.brief || "What the reel should cover."}</p>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="dosDonts">Do and don't</label>
          <textarea id="dosDonts" name="dosDonts" className="field-control field-textarea" value={dosDonts} onChange={(e) => setDosDonts(e.target.value)} />
          <p className="field-helper">Optional creative guardrails.</p>
        </div>
        <div className="field">
          <label htmlFor="preset">Criteria preset</label>
          <select
            id="preset"
            value={presetId}
            onChange={async (e) => {
              const id = e.target.value;
              setPresetId(id);
              const c = PRESETS.find((p) => p.id === id)?.criteria;
              if (c) setEligible(await previewEligibleCount(c));
            }}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginBottom: "0.9rem" }}
          onClick={() =>
            start(async () => {
              setEligible(await previewEligibleCount(criteria));
            })
          }
        >
          Refresh eligible count{eligible != null ? `: ${eligible}` : ""}
        </button>
        <div className={`field ${fieldErr.budget ? "is-invalid" : ""}`}>
          <label className="field-label" htmlFor="budget">Budget (₹) <span className="field-req" aria-hidden="true" /></label>
          <input
            id="budget"
            type="number"
            min={5000}
            value={budgetRupees}
            className="field-control" onChange={(e) => { setBudgetRupees(Number(e.target.value)); setFieldErr((f) => ({ ...f, budget: null })); }}
            aria-invalid={fieldErr.budget ? true : undefined}
          />
          <p className="field-helper" role={fieldErr.budget ? "alert" : undefined}>{fieldErr.budget || "Minimum ₹5,000."}</p>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="base">Base per creator (₹)</label>
          <input id="base" type="number" value={baseRupees} className="field-control" onChange={(e) => { setBaseRupees(Number(e.target.value)); setFieldErr((f) => ({ ...f, base: null })); }} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="rate">₹ per 1K views</label>
          <input id="rate" type="number" value={rateRupees} className="field-control" onChange={(e) => { setRateRupees(Number(e.target.value)); setFieldErr((f) => ({ ...f, rate: null })); }} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="cap">Cap per creator (₹)</label>
          <input id="cap" type="number" value={capRupees} className="field-control" onChange={(e) => { setCapRupees(Number(e.target.value)); setFieldErr((f) => ({ ...f, cap: null })); }} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="slots">Slots</label>
          <input id="slots" type="number" min={1} value={slots} className="field-control" onChange={(e) => { setSlots(Number(e.target.value)); setFieldErr((f) => ({ ...f, slots: null })); }} />
        </div>
        {error && <p className="err">{error}</p>}
        {payMsg && (
          <div style={{ marginBottom: "0.75rem", display: "grid", gap: "0.5rem" }}>
            <TestModeBanner detail={payMsg.message} />
            <ConnectBanner provider={payMsg.provider} message={payMsg.message} />
          </div>
        )}
        {!payMsg && (
          <div style={{ marginBottom: "0.75rem" }}>
            <TestModeBanner />
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Funding…" : "Create and fund (TEST MODE if no payment keys)"}
        </button>
      </form>
      <div className="card">
        <h3>Checkout</h3>
        <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", lineHeight: 1.7 }}>
          <li>Budget {formatINR(checkout.budget)}</li>
          <li>Platform fee 15% {formatINR(checkout.fee)}</li>
          <li>GST on fee {formatINR(checkout.gst)}</li>
          <li>
            <strong>Total {formatINR(checkout.total)}</strong>
          </li>
        </ul>
        <p className="muted" style={{ marginTop: "0.75rem", fontSize: "0.85rem" }}>
          KYC must be approved before funding succeeds. Without Razorpay/Cashfree keys, RedCup records a TEST MODE
          capture (no real money) and marks the bounty live.
        </p>
      </div>
    </div>
  );
}
