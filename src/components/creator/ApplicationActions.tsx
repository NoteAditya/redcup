"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitReelLink, uploadDraft } from "@/server/services/creator";

export function DraftUploadForm({ applicationId }: { applicationId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setErr(null);
        start(async () => {
          const res = await uploadDraft(
            applicationId,
            String(fd.get("caption") || ""),
            String(fd.get("videoPath") || "uploads/demo-draft.mp4"),
          );
          if (!res.ok) setErr(res.error || "Failed");
          else router.refresh();
        });
      }}
    >
      <h3>Submit draft</h3>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="caption">Caption</label>
        <textarea id="caption" name="caption" required />
      </div>
      <div className="field">
        <label htmlFor="videoPath">Video path / URL (upload adapter later)</label>
        <input id="videoPath" name="videoPath" defaultValue="uploads/demo-draft.mp4" />
      </div>
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send draft"}
      </button>
    </form>
  );
}

export function ReelLinkForm({ applicationId }: { applicationId: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setErr(null);
        start(async () => {
          const res = await submitReelLink(applicationId, String(fd.get("permalink") || ""));
          if (!res.ok) setErr(res.error || "Failed");
          else router.refresh();
        });
      }}
    >
      <h3>Submit live reel link</h3>
      <div className="field" style={{ marginTop: 8 }}>
        <label htmlFor="permalink">Instagram permalink</label>
        <input id="permalink" name="permalink" required placeholder="https://www.instagram.com/reel/…" />
      </div>
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Mark as posted"}
      </button>
    </form>
  );
}
