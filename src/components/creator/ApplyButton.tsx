"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyToCampaign } from "@/server/services/campaigns";

export function ApplyButton({ campaignId, disabled }: { campaignId: string; disabled?: boolean }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            const res = await applyToCampaign(campaignId);
            if (!res.ok) setErr(res.error);
            else router.refresh();
          })
        }
      >
        {pending ? "Applying…" : "Apply"}
      </button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}
