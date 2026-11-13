"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBrandProfile } from "@/server/services/brand";
import { CategorySelect } from "@/components/forms/CategoryPicker";
import { Text } from "@/components/creator/ProfileForm";

/** Normal editable brand profile (not the wizard), prefilled. Adding a GSTIN sends the brand for approval. */
export function BrandProfileForm({
  initial,
}: {
  initial: { businessName: string; category: string; city: string; website: string; gstin: string | null; approved: boolean };
}) {
  const router = useRouter();
  const [v, setV] = useState({
    businessName: initial.businessName,
    category: initial.category,
    city: initial.city,
    website: initial.website,
    gstin: "",
  });
  const [err, setErr] = useState<{ field?: string; msg: string } | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setDone(null);
    setErr(null);
    setV((s) => ({ ...s, [k]: e.target.value }));
  };
  const fe = (k: string) => (err?.field === k ? err.msg : null);
  return (
    <form
      className="profile-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await saveBrandProfile({ ...v, gstin: v.gstin || undefined }).catch(() => ({
            ok: false as const,
            error: "Could not save. Sign in again if your session expired.",
          }));
          if (!res.ok) {
            setErr({ field: "field" in res ? res.field : undefined, msg: res.error });
            return;
          }
          setV((s) => ({ ...s, gstin: "" }));
          setDone(
            res.status === "approved"
              ? "Saved."
              : res.gstMissing
                ? "Saved. Add your GSTIN to send your brand for approval."
                : "Saved. Your brand is now in RedCup's approval queue.",
          );
          router.refresh();
        });
      }}
    >
      <div className="profile-form-grid">
        <Text label="Business name" name="businessName" value={v.businessName} onChange={set("businessName")} error={fe("businessName")} required />
        <div className={`field ${fe("category") ? "is-invalid" : ""}`}>
          <label className="field-label" htmlFor="category">
            Category<span className="field-req" aria-hidden="true" />
          </label>
          <CategorySelect
            id="category"
            value={v.category}
            invalid={Boolean(fe("category"))}
            onChange={(c) => {
              setDone(null);
              setErr(null);
              setV((s) => ({ ...s, category: c }));
            }}
          />
          <p className="field-helper" role={fe("category") ? "alert" : undefined}>{fe("category") || "Shown on your bounty cards."}</p>
        </div>
        <Text label="City" name="city" value={v.city} onChange={set("city")} error={fe("city")} required />
        <Text label="Website" name="website" value={v.website} onChange={set("website")} error={fe("website")} placeholder="https://" />
        <div id="gst">
          <Text
            label="GSTIN"
            name="gstin"
            value={v.gstin}
            onChange={(e) => {
              setDone(null);
              setErr(null);
              setV((s) => ({ ...s, gstin: e.target.value.toUpperCase() }));
            }}
            error={fe("gstin")}
            maxLength={15}
            placeholder={initial.gstin ? `On file: ${initial.gstin}` : "15 characters"}
            hint={
              initial.gstin
                ? "Leave empty to keep the GSTIN on file."
                : initial.approved
                  ? "Add your GSTIN for invoices."
                  : "Needed for approval. Saving it sends your brand to RedCup for review."
            }
          />
        </div>
      </div>
      {err && !err.field ? <p className="err" role="alert">{err.msg}</p> : null}
      <div className="profile-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : !initial.gstin && !initial.approved ? "Save and submit for approval" : "Save profile"}
        </button>
        {done ? <span className="muted" role="status">{done}</span> : null}
      </div>
    </form>
  );
}
