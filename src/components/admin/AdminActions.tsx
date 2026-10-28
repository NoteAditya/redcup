"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveBrandKyc, enterManualViews, shortlistOverride } from "@/server/services/admin";

export function KycButtons({ brandId }: { brandId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await approveBrandKyc(brandId, true, "Docs look fine");
            router.refresh();
          })
        }
      >
        Approve KYC
      </button>
      <button
        className="btn btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await approveBrandKyc(brandId, false, "GSTIN mismatch");
            router.refresh();
          })
        }
      >
        Reject
      </button>
    </div>
  );
}

export function ManualViewsForm({ applicationId }: { applicationId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setErr(null);
        start(async () => {
          const res = await enterManualViews(applicationId, Number(fd.get("views") || 0));
          if (!res.ok) setErr(res.error || "Failed");
          else router.refresh();
        });
      }}
      style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}
    >
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor={"views-" + applicationId}>Verified views</label>
        <input id={"views-" + applicationId} name="views" type="number" min={0} required />
      </div>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        Save
      </button>
      {err && <p className="err">{err}</p>}
    </form>
  );
}

export function OverrideButtons({ applicationId }: { applicationId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await shortlistOverride(applicationId, "pin", "Editorial fit");
            router.refresh();
          })
        }
      >
        Pin
      </button>
      <button
        className="btn btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await shortlistOverride(applicationId, "remove", "Brand conflict");
            router.refresh();
          })
        }
      >
        Remove
      </button>
    </div>
  );
}
