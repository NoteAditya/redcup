"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCampaignDraft, fundCampaign, previewEligibleCount } from "@/server/services/campaigns";
import { formatINR, brandCheckoutTotal, rupeesToPaise } from "@/lib/money";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { TestModeBanner } from "@/components/ui/TestModeBanner";
import type { CampaignCriteria } from "@/lib/types";

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
          const fd = new FormData(e.currentTarget);
          setError(null);
          setPayMsg(null);
          start(async () => {
            const draft = await createCampaignDraft({
              title: String(fd.get("title") || ""),
              brief: String(fd.get("brief") || ""),
              dosDonts: String(fd.get("dosDonts") || ""),
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
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required placeholder="Weekend skincare reel" />
        </div>
        <div className="field">
          <label htmlFor="brief">Brief</label>
          <textarea id="brief" name="brief" required />
        </div>
        <div className="field">
          <label htmlFor="dosDonts">Do / don't</label>
          <textarea id="dosDonts" name="dosDonts" />
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
        <div className="field">
          <label htmlFor="budget">Budget (₹)</label>
          <input
            id="budget"
            type="number"
            min={5000}
            value={budgetRupees}
            onChange={(e) => setBudgetRupees(Number(e.target.value))}
          />
        </div>
        <div className="field">
          <label htmlFor="base">Base per creator (₹)</label>
          <input id="base" type="number" value={baseRupees} onChange={(e) => setBaseRupees(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="rate">₹ per 1K views</label>
          <input id="rate" type="number" value={rateRupees} onChange={(e) => setRateRupees(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="cap">Cap per creator (₹)</label>
          <input id="cap" type="number" value={capRupees} onChange={(e) => setCapRupees(Number(e.target.value))} />
        </div>
        <div className="field">
          <label htmlFor="slots">Slots</label>
          <input id="slots" type="number" min={1} value={slots} onChange={(e) => setSlots(Number(e.target.value))} />
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
