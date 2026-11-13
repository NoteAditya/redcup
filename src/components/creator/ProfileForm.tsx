"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveCreatorProfile } from "@/server/services/creator";
import { CategoryMulti } from "@/components/forms/CategoryPicker";

export type CreatorProfileInitial = {
  displayName: string;
  handle: string;
  city: string;
  languages: string[];
  categories: string[];
  whatsapp: string;
  panMasked: string | null;
  panSkipped: boolean;
  upiMasked: string | null;
};

/** Normal editable profile (not the step-by-step wizard), prefilled from the saved profile. */
export function CreatorProfileForm({ initial }: { initial: CreatorProfileInitial }) {
  const router = useRouter();
  const [v, setV] = useState({
    displayName: initial.displayName,
    city: initial.city,
    languages: initial.languages.join(", "),
    categories: initial.categories,
    whatsapp: initial.whatsapp,
    pan: "",
    upi: "",
  });
  const [err, setErr] = useState<{ field?: string; msg: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setErr(null);
    setV((s) => ({ ...s, [k]: e.target.value }));
  };
  const fieldErr = (k: string) => (err?.field === k ? err.msg : null);

  return (
    <form
      className="profile-form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setErr(null);
        start(async () => {
          const res = await saveCreatorProfile({
            displayName: v.displayName,
            handle: initial.handle,
            city: v.city,
            languages: v.languages.split(",").map((s) => s.trim()).filter(Boolean),
            categories: v.categories,
            whatsapp: v.whatsapp,
            pan: v.pan,
            skipPan: false,
            upi: v.upi,
          }).catch(() => ({ ok: false as const, error: "Could not save. Log in with Instagram again if your session expired." }));
          if (!res.ok) {
            setErr({ field: "field" in res ? res.field : undefined, msg: res.error });
            return;
          }
          setSaved(true);
          setV((s) => ({ ...s, pan: "", upi: "" }));
          router.refresh();
        });
      }}
    >
      <div className="profile-form-grid">
        <Text label="Display name" name="displayName" value={v.displayName} onChange={set("displayName")} error={fieldErr("displayName")} required />
        <Text label="City" name="city" value={v.city} onChange={set("city")} error={fieldErr("city")} required />
        <div className={`field ${fieldErr("categories") ? "is-invalid" : ""}`}>
          <label className="field-label" htmlFor="categories">Categories</label>
          <CategoryMulti
            id="categories"
            value={v.categories}
            onChange={(c) => {
              setSaved(false);
              setErr(null);
              setV((s) => ({ ...s, categories: c }));
            }}
          />
          <p className="field-helper" role={fieldErr("categories") ? "alert" : undefined}>
            {fieldErr("categories") || "Up to 3. Brands filter creators by these."}
          </p>
        </div>
        <Text label="Languages" name="languages" value={v.languages} onChange={set("languages")} error={fieldErr("languages")} hint="Comma-separated, e.g. Hindi, English" required />
        <Text label="WhatsApp" name="whatsapp" value={v.whatsapp} onChange={set("whatsapp")} error={fieldErr("whatsapp")} hint="For campaign updates. Brands never see it." />
        <Text
          label="PAN"
          name="pan"
          value={v.pan}
          onChange={set("pan")}
          error={fieldErr("pan")}
          maxLength={10}
          placeholder={initial.panMasked ? `On file: ${initial.panMasked}` : "ABCDE1234F"}
          hint={
            initial.panMasked
              ? "Leave empty to keep the PAN on file."
              : initial.panSkipped
                ? "You skipped this. Add it before your first payout."
                : "Optional. Needed before your first payout."
          }
        />
        <Text
          label="UPI ID"
          name="upi"
          value={v.upi}
          onChange={set("upi")}
          error={fieldErr("upi")}
          placeholder={initial.upiMasked ? `On file: ${initial.upiMasked}` : "you@upi"}
          hint={initial.upiMasked ? "Leave empty to keep the UPI ID on file." : "Where your earnings go."}
        />
      </div>
      {err && !err.field ? <p className="err" role="alert">{err.msg}</p> : null}
      <div className="profile-form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </button>
        {saved ? <span className="muted" role="status">Saved.</span> : null}
      </div>
    </form>
  );
}

export function Text({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required,
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className={`field ${error ? "is-invalid" : ""}`}>
      <label className="field-label" htmlFor={name}>
        {label}
        {required ? <span className="field-req" aria-hidden="true" /> : null}
      </label>
      <input
        id={name}
        name={name}
        className="field-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${name}-help`}
      />
      <p className="field-helper" id={`${name}-help`} role={error ? "alert" : undefined}>
        {error || hint || " "}
      </p>
    </div>
  );
}
