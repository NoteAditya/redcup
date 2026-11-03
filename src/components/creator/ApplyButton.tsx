"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToCampaign } from "@/server/services/campaigns";

export function ApplyButton({ campaignId, disabled }: { campaignId: string; disabled?: boolean }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="apply-action">
      <button
        type="button"
        className="btn btn-primary"
        disabled={disabled || pending}
        aria-describedby={err ? "apply-err" : undefined}
        onClick={() =>
          start(async () => {
            setErr(null);
            const res = await applyToCampaign(campaignId);
            if (!res.ok) setErr(res.error);
            else router.refresh();
          })
        }
      >
        {pending ? "Applying…" : "Apply"}
      </button>
      {err ? (
        <p className="field-helper" id="apply-err" role="alert" style={{ color: "var(--color-error, var(--bad))" }}>
          {err}
        </p>
      ) : null}
    </div>
  );
}
