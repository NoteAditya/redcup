"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { awardCreators, generateShortlist } from "@/server/services/campaigns";
import { reviewDraft } from "@/server/services/brand";

export function ShortlistButton({ campaignId }: { campaignId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div>
      <button
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await generateShortlist(campaignId);
            if (!res.ok) setErr(res.error || "Failed");
            else {
              router.refresh();
            }
          })
        }
      >
        {pending ? "Scoring…" : "Generate shortlist"}
      </button>
      {err && <p className="err">{err}</p>}
    </div>
  );
}

export function AwardForm({
  campaignId,
  shortlisted,
  slots,
}: {
  campaignId: string;
  shortlisted: { id: string; label: string; fit: number | null }[];
  slots: number;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="card">
      <h3>Award up to {slots}</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0" }}>
        {shortlisted.map((s) => (
          <li key={s.id} style={{ marginBottom: 6 }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={picked.includes(s.id)}
                onChange={(e) => {
                  setPicked((prev) =>
                    e.target.checked ? [...prev, s.id].slice(0, slots) : prev.filter((x) => x !== s.id),
                  );
                }}
              />
              <span>
                {s.label} · Fit {s.fit ?? "—"}
              </span>
            </label>
          </li>
        ))}
      </ul>
      {err && <p className="err">{err}</p>}
      <button
        className="btn btn-primary"
        disabled={pending || picked.length === 0}
        onClick={() =>
          start(async () => {
            const res = await awardCreators(campaignId, picked);
            if (!res.ok) setErr(res.error || "Failed");
            else router.refresh();
          })
        }
      >
        {pending ? "Awarding…" : "Award selected"}
      </button>
    </div>
  );
}

export function DraftReviewButtons({ draftId }: { draftId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button
        className="btn btn-primary"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await reviewDraft(draftId, "approved");
            router.refresh();
          })
        }
      >
        Approve
      </button>
      <button
        className="btn btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await reviewDraft(draftId, "revision", "Please tighten the CTA and add paid partnership label in shot.");
            router.refresh();
          })
        }
      >
        Request revision
      </button>
      <button
        className="btn btn-ghost"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await reviewDraft(draftId, "rejected", "Does not match brief");
            router.refresh();
          })
        }
      >
        Reject
      </button>
    </div>
  );
}
