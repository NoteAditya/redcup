"use client";

import { useState, useTransition } from "react";
import { deleteMyInstagramData } from "@/server/services/instagram";

export function DeleteInstagramDataButton() {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  if (!confirm) {
    return (
      <button type="button" className="btn btn-ghost" style={{ justifySelf: "start" }} onClick={() => setConfirm(true)}>
        Disconnect and delete my Instagram data
      </button>
    );
  }
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
        This removes your Instagram token, profile details and picture from RedCup and signs you out. Your campaign
        history and payouts stay. You can log in with Instagram again any time.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => start(() => deleteMyInstagramData())}>
          {pending ? "Deleting…" : "Yes, delete it"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={pending}>
          Cancel
        </button>
      </div>
    </div>
  );
}
