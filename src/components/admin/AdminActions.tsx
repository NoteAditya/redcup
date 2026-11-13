"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createCampaignForBrand,
  enterManualViews,
  reviewApplications,
  reviewBrand,
  reviewCampaign,
  setCampaignStatus,
  setUserActive,
  shortlistOverride,
  updateCampaign,
  type CampaignEdit,
  type CampaignStatusAction,
} from "@/server/services/admin";
import type { CampaignCriteria, RuleMode } from "@/lib/types";
import { fetchViewsFromInstagram } from "@/server/services/instagram";
import { fromISTInput, toISTInput } from "@/lib/format";

type R = { ok: boolean; error?: string };

function useAction() {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const router = useRouter();
  const run = (fn: () => Promise<R>, okMsg?: string) => {
    setErr(null);
    setDone(null);
    start(async () => {
      try {
        const res = await fn();
        if (!res.ok) setErr(res.error || "Something went wrong.");
        else {
          if (okMsg) setDone(okMsg);
          router.refresh();
        }
      } catch {
        setErr("Something went wrong. Try again.");
      }
    });
  };
  return { pending, err, done, run };
}

function Feedback({ err, done }: { err: string | null; done: string | null }) {
  if (err) return <p className="err" role="alert" style={{ margin: "0.5rem 0 0" }}>{err}</p>;
  if (done) return <p className="muted" role="status" style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem" }}>{done}</p>;
  return null;
}

/* ----------------------------------------------------------- Brand review */

export function BrandReview({ brandId, compact }: { brandId: string; compact?: boolean }) {
  const [note, setNote] = useState("");
  const { pending, err, done, run } = useAction();
  return (
    <div>
      <label className="field" style={{ marginBottom: "0.5rem" }}>
        <span>Reason {compact ? "" : "(required to reject, shown to the brand)"}</span>
        <textarea className="input adm-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </label>
      <div className="adm-actions">
        <button className="btn btn-primary btn-compact" disabled={pending} onClick={() => run(() => reviewBrand(brandId, true, note), "Brand approved.")}>
          Approve brand
        </button>
        <button className="btn btn-ghost btn-compact" disabled={pending} onClick={() => run(() => reviewBrand(brandId, false, note), "Brand rejected.")}>
          Reject
        </button>
      </div>
      <Feedback err={err} done={done} />
    </div>
  );
}

/** Kept for the old verification import name. */
export const KycButtons = BrandReview;

/* -------------------------------------------------------- Campaign review */

export function CampaignReview({ campaignId }: { campaignId: string }) {
  const [note, setNote] = useState("");
  const { pending, err, done, run } = useAction();
  return (
    <div>
      <label className="field" style={{ marginBottom: "0.5rem" }}>
        <span>Note to the brand (required to reject or send back)</span>
        <textarea className="input adm-note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </label>
      <div className="adm-actions">
        <button className="btn btn-primary btn-compact" disabled={pending} onClick={() => run(() => reviewCampaign(campaignId, "approve", note), "Campaign approved.")}>
          Approve
        </button>
        <button className="btn btn-ghost btn-compact" disabled={pending} onClick={() => run(() => reviewCampaign(campaignId, "changes", note), "Sent back to the brand.")}>
          Send back for changes
        </button>
        <button className="btn btn-ghost btn-compact" disabled={pending} onClick={() => run(() => reviewCampaign(campaignId, "reject", note), "Campaign rejected.")}>
          Reject
        </button>
      </div>
      <Feedback err={err} done={done} />
    </div>
  );
}

const STATUS_BUTTONS: { action: CampaignStatusAction; label: string; from: string[] }[] = [
  { action: "pause", label: "Pause", from: ["live"] },
  { action: "resume", label: "Put live", from: ["paused"] },
  { action: "close_applications", label: "Close applications", from: ["live", "paused"] },
  { action: "reopen_applications", label: "Reopen applications", from: ["applications_closed"] },
  { action: "cancel", label: "Cancel campaign", from: ["draft", "verifying", "live", "paused", "applications_closed", "shortlisted"] },
];

export function CampaignStatusControls({ campaignId, status }: { campaignId: string; status: string }) {
  const [note, setNote] = useState("");
  const { pending, err, done, run } = useAction();
  const available = STATUS_BUTTONS.filter((b) => b.from.includes(status));
  if (available.length === 0) {
    return <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>No manual status changes from “{status.replace(/_/g, " ")}”.</p>;
  }
  return (
    <div>
      <label className="field" style={{ marginBottom: "0.5rem" }}>
        <span>Note (optional, saved in the activity log)</span>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className="adm-actions">
        {available.map((b) => (
          <button
            key={b.action}
            className={b.action === "resume" || b.action === "reopen_applications" ? "btn btn-primary btn-compact" : "btn btn-ghost btn-compact"}
            disabled={pending}
            onClick={() => {
              if (b.action === "cancel" && !window.confirm("Cancel this campaign? Creators will no longer see it.")) return;
              run(() => setCampaignStatus(campaignId, b.action, note), "Status updated.");
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <Feedback err={err} done={done} />
    </div>
  );
}

/* ------------------------------------------------------ Campaign edit form */

export type CampaignFormValue = {
  title: string;
  brief: string;
  dosDonts: string;
  budgetPaise: number;
  basePaise: number;
  ratePer1000Paise: number;
  capPerCreatorPaise: number;
  slots: number;
  applicationClosesAt: string | null;
  awardDeadlineAt: string | null;
  criteria: CampaignCriteria;
};

const list = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
const num = (s: string) => (s.trim() === "" ? undefined : Number(s));

export function CampaignForm({
  mode,
  campaignId,
  initial,
  brands,
  presets,
}: {
  mode: "edit" | "create";
  campaignId?: string;
  initial?: CampaignFormValue;
  brands?: { id: string; name: string; kyc: string }[];
  presets?: { id: string; name: string; criteria: CampaignCriteria }[];
}) {
  const router = useRouter();
  const base: CampaignFormValue = initial ?? {
    title: "",
    brief: "",
    dosDonts: "",
    budgetPaise: 2_500_000,
    basePaise: 150_000,
    ratePer1000Paise: 80_000,
    capPerCreatorPaise: 1_500_000,
    slots: 3,
    applicationClosesAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    awardDeadlineAt: null,
    criteria: presets?.[0]?.criteria ?? {},
  };
  const [brandId, setBrandId] = useState(brands?.find((b) => b.kyc === "approved")?.id ?? brands?.[0]?.id ?? "");
  const [presetId, setPresetId] = useState<string>(mode === "create" ? presets?.[0]?.id ?? "" : "");
  const [v, setV] = useState({
    title: base.title,
    brief: base.brief,
    dosDonts: base.dosDonts,
    budget: String(base.budgetPaise / 100),
    baseAmt: String(base.basePaise / 100),
    rate: String(base.ratePer1000Paise / 100),
    cap: String(base.capPerCreatorPaise / 100),
    slots: String(base.slots),
    closes: toISTInput(base.applicationClosesAt),
    award: toISTInput(base.awardDeadlineAt),
  });
  const [crit, setCrit] = useState(() => critToFields(base.criteria));
  const [critBase, setCritBase] = useState<CampaignCriteria>(base.criteria);
  const { pending, err, done, run } = useAction();

  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));
  const setC = (k: keyof ReturnType<typeof critToFields>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCrit((p) => ({ ...p, [k]: e.target.value }));

  const criteria = useMemo(() => fieldsToCrit(critBase, crit), [critBase, crit]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const payload: CampaignEdit = {
          title: v.title,
          brief: v.brief,
          dosDonts: v.dosDonts,
          budgetPaise: Math.round(Number(v.budget) * 100),
          basePaise: Math.round(Number(v.baseAmt) * 100),
          ratePer1000Paise: Math.round(Number(v.rate) * 100),
          capPerCreatorPaise: Math.round(Number(v.cap) * 100),
          slots: Number(v.slots),
          applicationClosesAt: fromISTInput(v.closes),
          awardDeadlineAt: fromISTInput(v.award),
          criteria,
        };
        if (mode === "edit" && campaignId) {
          run(() => updateCampaign(campaignId, payload), "Saved.");
        } else {
          if (!brandId) return;
          run(async () => {
            const res = await createCampaignForBrand(brandId, { ...payload, presetId: presetId || null });
            if (res.ok) router.push("/admin/bounties/" + res.id);
            return res;
          }, "Created.");
        }
      }}
    >
      {mode === "create" && brands && (
        <label className="field">
          <span>Brand</span>
          <select className="select" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.kyc.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="field">
        <span>Title</span>
        <input className="input" value={v.title} onChange={set("title")} required />
      </label>
      <label className="field">
        <span>Brief</span>
        <textarea className="input" rows={4} value={v.brief} onChange={set("brief")} required />
      </label>
      <label className="field">
        <span>Do and don&apos;t</span>
        <textarea className="input" rows={2} value={v.dosDonts} onChange={set("dosDonts")} />
      </label>
      <div className="adm-form-grid">
        <label className="field"><span>Budget (₹)</span><input className="input" type="number" min={5000} step="1" value={v.budget} onChange={set("budget")} required /></label>
        <label className="field"><span>Creator slots</span><input className="input" type="number" min={1} step="1" value={v.slots} onChange={set("slots")} required /></label>
        <label className="field"><span>Base per creator (₹)</span><input className="input" type="number" min={0} step="1" value={v.baseAmt} onChange={set("baseAmt")} required /></label>
        <label className="field"><span>Rate per 1K views (₹)</span><input className="input" type="number" min={0} step="1" value={v.rate} onChange={set("rate")} required /></label>
        <label className="field"><span>Cap per creator (₹)</span><input className="input" type="number" min={0} step="1" value={v.cap} onChange={set("cap")} required /></label>
        <label className="field"><span>Applications close (IST)</span><input className="input" type="datetime-local" value={v.closes} onChange={set("closes")} /></label>
        <label className="field"><span>Award deadline (IST)</span><input className="input" type="datetime-local" value={v.award} onChange={set("award")} /></label>
      </div>

      <h3 style={{ margin: "0.75rem 0 0.5rem", fontSize: "0.95rem" }}>Creator criteria</h3>
      {presets && presets.length > 0 && (
        <label className="field">
          <span>Start from a preset {mode === "edit" ? "(replaces the fields below)" : ""}</span>
          <select
            className="select"
            value={presetId}
            onChange={(e) => {
              setPresetId(e.target.value);
              const p = presets.find((x) => x.id === e.target.value);
              if (p) {
                setCritBase(p.criteria);
                setCrit(critToFields(p.criteria));
              }
            }}
          >
            <option value="">Keep current</option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      )}
      <div className="adm-form-grid">
        <label className="field"><span>Min followers</span><input className="input" type="number" min={0} value={crit.fMin} onChange={setC("fMin")} /></label>
        <label className="field"><span>Max followers</span><input className="input" type="number" min={0} value={crit.fMax} onChange={setC("fMax")} /></label>
        <label className="field"><span>Followers rule</span><ModeSelect value={crit.fMode} onChange={setC("fMode")} /></label>
        <label className="field"><span>Niches (comma separated)</span><input className="input" value={crit.niches} onChange={setC("niches")} /></label>
        <label className="field"><span>Niches rule</span><ModeSelect value={crit.nMode} onChange={setC("nMode")} /></label>
        <label className="field"><span>Languages (comma separated)</span><input className="input" value={crit.langs} onChange={setC("langs")} /></label>
        <label className="field"><span>Languages rule</span><ModeSelect value={crit.lMode} onChange={setC("lMode")} /></label>
        <label className="field"><span>Min India audience %</span><input className="input" type="number" min={0} max={100} value={crit.inPct} onChange={setC("inPct")} /></label>
        <label className="field"><span>Min avg reel views</span><input className="input" type="number" min={0} value={crit.views} onChange={setC("views")} /></label>
      </div>
      <p className="muted" style={{ fontSize: "0.75rem", margin: "0 0 1rem" }}>
        Empty fields remove that rule. Other rules on the campaign (cities, gender, engagement) are kept as they are.
      </p>
      <button className="btn btn-primary" type="submit" disabled={pending}>
        {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Create campaign"}
      </button>
      <Feedback err={err} done={done} />
    </form>
  );
}

function ModeSelect({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select className="select" value={value} onChange={onChange}>
      <option value="must">Must have</option>
      <option value="nice">Nice to have</option>
    </select>
  );
}

function critToFields(c: CampaignCriteria) {
  return {
    fMin: c.followers?.min != null ? String(c.followers.min) : "",
    fMax: c.followers?.max != null ? String(c.followers.max) : "",
    fMode: (c.followers?.mode ?? "must") as string,
    niches: (c.niches?.any_of ?? []).join(", "),
    nMode: (c.niches?.mode ?? "must") as string,
    langs: (c.languages?.any_of ?? []).join(", "),
    lMode: (c.languages?.mode ?? "nice") as string,
    inPct: c.audience_country?.min_pct != null ? String(c.audience_country.min_pct) : "",
    views: c.avg_reel_views?.min != null ? String(c.avg_reel_views.min) : "",
  };
}

function fieldsToCrit(base: CampaignCriteria, f: ReturnType<typeof critToFields>): CampaignCriteria {
  const out: CampaignCriteria = { ...base };
  const fMin = num(f.fMin);
  const fMax = num(f.fMax);
  if (fMin == null && fMax == null) delete out.followers;
  else out.followers = { mode: f.fMode as RuleMode, ...(fMin != null ? { min: fMin } : {}), ...(fMax != null ? { max: fMax } : {}) };
  const niches = list(f.niches);
  if (niches.length === 0) delete out.niches;
  else out.niches = { ...(base.niches ?? {}), mode: f.nMode as RuleMode, any_of: niches };
  const langs = list(f.langs);
  if (langs.length === 0) delete out.languages;
  else out.languages = { mode: f.lMode as RuleMode, any_of: langs };
  const inPct = num(f.inPct);
  if (inPct == null) delete out.audience_country;
  else out.audience_country = { mode: base.audience_country?.mode ?? "must", country: base.audience_country?.country ?? "IN", min_pct: inPct };
  const views = num(f.views);
  if (views == null) delete out.avg_reel_views;
  else out.avg_reel_views = { ...(base.avg_reel_views ?? { mode: "nice" }), min: views };
  return out;
}

/* ---------------------------------------------------- Application review */

export type AppRow = {
  id: string;
  creatorId: string;
  creatorName: string;
  handle: string;
  followers: number | null;
  niches: string;
  fit: number | null;
  status: string;
  review: string;
  reviewNote: string | null;
  campaignId: string;
  campaignTitle: string;
  appliedAt: string;
};

export function ApplicationReviewTable({
  rows,
  showCampaign,
  showOverrides,
}: {
  rows: AppRow[];
  showCampaign?: boolean;
  showOverrides?: boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const { pending, err, done, run } = useAction();
  const allIds = rows.map((r) => r.id);
  const allPicked = picked.length > 0 && picked.length === allIds.length;
  const act = (ids: string[], approve: boolean) =>
    run(async () => {
      const res = await reviewApplications(ids, approve, note);
      if (res.ok) setPicked((p) => p.filter((x) => !ids.includes(x)));
      return res;
    }, approve ? "Approved." : "Rejected.");

  return (
    <div>
      <div className="adm-toolbar" style={{ marginTop: 0 }}>
        <input
          className="input"
          placeholder="Optional note (saved with the decision)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ flex: 1, minWidth: "16rem" }}
        />
        <button className="btn btn-primary btn-compact" disabled={pending || picked.length === 0} onClick={() => act(picked, true)}>
          Approve selected ({picked.length})
        </button>
        <button className="btn btn-ghost btn-compact" disabled={pending || picked.length === 0} onClick={() => act(picked, false)}>
          Reject selected
        </button>
      </div>
      <Feedback err={err} done={done} />
      <div className="adm-table-wrap" style={{ marginTop: "0.5rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allPicked}
                  onChange={(e) => setPicked(e.target.checked ? allIds : [])}
                />
              </th>
              <th>Creator</th>
              {showCampaign && <th>Campaign</th>}
              <th>Followers</th>
              <th>Niche</th>
              <th>Fit</th>
              <th>Review</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={"Select " + r.creatorName}
                    checked={picked.includes(r.id)}
                    onChange={(e) => setPicked((p) => (e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id)))}
                  />
                </td>
                <td>
                  <a href={"/admin/creators/" + r.creatorId}>{r.creatorName}</a>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>@{r.handle}</div>
                </td>
                {showCampaign && (
                  <td>
                    <a href={"/admin/bounties/" + r.campaignId}>{r.campaignTitle}</a>
                  </td>
                )}
                <td className="adm-num">{r.followers != null ? r.followers.toLocaleString("en-IN") : "—"}</td>
                <td>{r.niches || "—"}</td>
                <td className="adm-num">{r.fit ?? "—"}</td>
                <td>
                  <ReviewChip review={r.review} />
                  {r.reviewNote && <div className="muted" style={{ fontSize: "0.75rem", maxWidth: "18ch" }}>{r.reviewNote}</div>}
                </td>
                <td style={{ fontSize: "0.8125rem" }}>{r.status.replace(/_/g, " ").toLowerCase()}</td>
                <td>
                  <div className="adm-actions" style={{ flexWrap: "nowrap" }}>
                    {r.review !== "approved" && (
                      <button className="btn btn-primary btn-compact" disabled={pending} onClick={() => act([r.id], true)}>
                        Approve
                      </button>
                    )}
                    {r.review !== "rejected" && (
                      <button className="btn btn-ghost btn-compact" disabled={pending} onClick={() => act([r.id], false)}>
                        Reject
                      </button>
                    )}
                    {showOverrides && r.review === "approved" && <OverrideButtons applicationId={r.id} />}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={showCampaign ? 9 : 8} className="muted">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReviewChip({ review }: { review: string }) {
  const cls = review === "approved" ? "chip chip-ok" : review === "rejected" ? "chip chip-bad" : "chip chip-warn";
  const label = review === "changes_requested" ? "changes requested" : review.replace(/_/g, " ");
  return <span className={cls}>{label}</span>;
}

/* ----------------------------------------------------------------- Users */

export function UserToggle({ userId, active }: { userId: string; active: boolean }) {
  const [note, setNote] = useState("");
  const { pending, err, done, run } = useAction();
  return (
    <div>
      {active && (
        <label className="field" style={{ marginBottom: "0.5rem" }}>
          <span>Reason (required to turn the account off)</span>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      )}
      <button
        className={active ? "btn btn-ghost btn-compact" : "btn btn-primary btn-compact"}
        disabled={pending}
        onClick={() => run(() => setUserActive(userId, !active, note), active ? "Account turned off." : "Account turned back on.")}
      >
        {active ? "Turn account off" : "Turn account back on"}
      </button>
      <Feedback err={err} done={done} />
    </div>
  );
}

/* ------------------------------------------------------- Existing tools */

export function ManualViewsForm({ applicationId, canFetch = false }: { applicationId: string; canFetch?: boolean }) {
  const { pending, err, done, run } = useAction();
  const [views, setViews] = useState("");
  const [fetching, startFetch] = useTransition();
  const [igMsg, setIgMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        run(() => enterManualViews(applicationId, Number(views || 0)), "Saved.");
      }}
      style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}
    >
      <label className="field" style={{ marginBottom: 0 }}>
        <span>Verified views</span>
        <input
          className="input"
          id={"views-" + applicationId}
          name="views"
          type="number"
          min={0}
          required
          value={views}
          onChange={(e) => setViews(e.target.value)}
        />
      </label>
      {canFetch && (
        <button
          type="button"
          className="btn btn-ghost"
          disabled={fetching || pending}
          onClick={() => {
            setIgMsg(null);
            startFetch(async () => {
              const res = await fetchViewsFromInstagram(applicationId);
              if (res.ok) {
                setViews(String(res.views));
                setIgMsg({ ok: true, text: "Filled from Instagram insights. Check it, then Save." });
              } else setIgMsg({ ok: false, text: res.error });
            });
          }}
        >
          {fetching ? "Asking Instagram…" : "Fetch from Instagram"}
        </button>
      )}
      <button className="btn btn-primary" type="submit" disabled={pending}>
        Save
      </button>
      <Feedback err={err} done={done} />
      {igMsg && (
        <p className={igMsg.ok ? "muted" : "err"} role="status" style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem", flexBasis: "100%" }}>
          {igMsg.text}
        </p>
      )}
    </form>
  );
}

export function OverrideButtons({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState<null | "pin" | "remove">(null);
  const [reason, setReason] = useState("");
  const { pending, err, run } = useAction();
  if (!open) {
    return (
      <span className="adm-actions" style={{ flexWrap: "nowrap" }}>
        <button className="btn btn-ghost btn-compact" onClick={() => setOpen("pin")}>Pin</button>
        <button className="btn btn-ghost btn-compact" onClick={() => setOpen("remove")}>Remove</button>
      </span>
    );
  }
  return (
    <span style={{ display: "inline-grid", gap: 4 }}>
      <input
        className="input"
        style={{ padding: "0.4rem 0.6rem", fontSize: "0.8125rem", minWidth: "12rem" }}
        placeholder={open === "pin" ? "Why pin to the shortlist?" : "Why remove from the shortlist?"}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        autoFocus
      />
      <span className="adm-actions" style={{ flexWrap: "nowrap" }}>
        <button
          className="btn btn-primary btn-compact"
          disabled={pending}
          onClick={() =>
            run(async () => {
              const res = await shortlistOverride(applicationId, open, reason);
              if (res.ok) {
                setOpen(null);
                setReason("");
              }
              return res;
            })
          }
        >
          {open === "pin" ? "Pin" : "Remove"}
        </button>
        <button className="btn btn-ghost btn-compact" onClick={() => setOpen(null)}>Cancel</button>
      </span>
      {err && <span className="err">{err}</span>}
    </span>
  );
}
