import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatIST, labelize } from "@/lib/format";
import { BrandReview } from "@/components/admin/AdminActions";
import { requirePageRole } from "@/server/auth/guard";
import { brandHasGst, brandOnboarded } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function BrandApprovalsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requirePageRole("admin");
  const { show = "submitted" } = await searchParams;
  const db = await readDb();
  // "GST missing": finished their profile but skipped GST, so still pending. "Profile not finished": never completed onboarding.
  const bucket = (b: (typeof db.brands)[number]) =>
    b.kycStatus === "not_submitted" ? (brandOnboarded(b) ? "gst_missing" : "not_submitted") : b.kycStatus;
  const tabs = [
    { key: "submitted", label: "Submitted" },
    { key: "gst_missing", label: "GST missing" },
    { key: "not_submitted", label: "Profile not finished" },
    { key: "rejected", label: "Rejected" },
  ];
  const list = db.brands
    .filter((b) => bucket(b) === show)
    .sort((a, b) => (a.gstSubmittedAt || a.createdAt).localeCompare(b.gstSubmittedAt || b.createdAt));
  const users = new Map(db.users.map((u) => [u.id, u]));

  return (
    <div>
      <h1>Brand approvals</h1>
      <p className="adm-sub">
        Brands can&apos;t use their dashboard, create or fund campaigns until you approve them. A brand joins the Submitted queue once it adds a GSTIN; approving a brand without GST needs an override with a reason. Creators don&apos;t need approval.
      </p>
      <div className="adm-toolbar">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={"/admin/verification?show=" + t.key}
            className={show === t.key ? "btn btn-primary btn-compact" : "btn btn-ghost btn-compact"}
          >
            {t.label} ({db.brands.filter((b) => bucket(b) === t.key).length})
          </Link>
        ))}
      </div>
      {list.length === 0 && <div className="adm-panel muted">Nothing here.</div>}
      {list.map((b) => {
        const u = users.get(b.userId);
        return (
          <div key={b.id} className="adm-panel">
            <div className="adm-head">
              <div>
                <h3 style={{ marginBottom: 4 }}>
                  <Link href={"/admin/users/" + b.userId}>{b.businessName}</Link>
                </h3>
                <div className="muted" style={{ fontSize: "0.8125rem" }}>
                  {u?.email || u?.phone || "no contact"} · signed up {formatIST(b.createdAt)}
                </div>
              </div>
              <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span className="chip">{labelize(b.kycStatus)}</span>
                {brandHasGst(b) ? (
                  <span className="chip chip-ok">GST submitted</span>
                ) : (
                  <span className="chip chip-warn">GST missing</span>
                )}
              </span>
            </div>
            <dl className="adm-dl" style={{ margin: "0.75rem 0 1rem" }}>
              <dt>Category</dt>
              <dd>{b.category || "—"}</dd>
              <dt>City</dt>
              <dd>{b.city || "—"}</dd>
              <dt>GSTIN</dt>
              <dd>
                {b.gstin ? (
                  <>
                    {b.gstin}
                    {b.gstSubmittedAt ? <span className="muted"> · added {formatIST(b.gstSubmittedAt)}</span> : null}
                  </>
                ) : (
                  "Not added. Approving needs an override with a reason."
                )}
              </dd>
              <dt>Website</dt>
              <dd>{b.website || "—"}</dd>
              {b.kycNote ? (
                <>
                  <dt>Last note</dt>
                  <dd>{b.kycNote}</dd>
                </>
              ) : null}
            </dl>
            <BrandReview brandId={b.id} gstMissing={!brandHasGst(b)} />
          </div>
        );
      })}
    </div>
  );
}
