import Link from "next/link";
import { notFound } from "next/navigation";
import { readDb } from "@/server/db/store";
import { formatINR } from "@/lib/money";
import { formatIST, labelize } from "@/lib/format";
import { BrandReview, ReviewChip, UserToggle } from "@/components/admin/AdminActions";
import { campaignApproval } from "@/server/access";
import { getSession } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [db, session] = await Promise.all([readDb(), getSession()]);
  const user = db.users.find((u) => u.id === id);
  if (!user) notFound();
  const brand = db.brands.find((b) => b.userId === user.id);
  const creator = db.creators.find((c) => c.userId === user.id);
  const campaigns = brand ? db.campaigns.filter((c) => c.brandId === brand.id) : [];
  const log = db.adminActions
    .filter((a) => a.targetId === user.id || (brand && a.targetId === brand.id))
    .slice(-10)
    .reverse();

  return (
    <div>
      <Link href="/admin/users" className="muted" style={{ fontSize: "0.85rem" }}>← Users</Link>
      <div className="adm-head" style={{ marginTop: 8 }}>
        <div>
          <h1>{brand?.businessName || user.name}</h1>
          <p className="adm-sub">
            {user.role} · {user.email || user.phone || "no contact"} · joined {formatIST(user.createdAt)}
            {user.clerkId ? " · Google sign-in" : ""}
          </p>
        </div>
        <span className={user.status === "inactive" ? "chip chip-bad" : "chip chip-ok"}>
          {user.status === "inactive" ? "turned off" : "active"}
        </span>
      </div>

      <div className="adm-grid">
        <div className="adm-panel">
          <h3>Account</h3>
          {session.userId === user.id ? (
            <p className="muted" style={{ margin: 0, fontSize: "0.875rem" }}>This is your own account.</p>
          ) : (
            <>
              <p className="muted" style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem" }}>
                A turned-off account can&apos;t sign in or use RedCup. Its data stays.
              </p>
              <UserToggle userId={user.id} active={user.status !== "inactive"} />
            </>
          )}
        </div>

        {brand && (
          <div className="adm-panel">
            <h3>Brand approval</h3>
            <dl className="adm-dl" style={{ marginBottom: "1rem" }}>
              <dt>Status</dt>
              <dd>{labelize(brand.kycStatus)}</dd>
              <dt>Category</dt>
              <dd>{brand.category || "—"}</dd>
              <dt>City</dt>
              <dd>{brand.city || "—"}</dd>
              <dt>GSTIN</dt>
              <dd>{brand.gstin || "—"}</dd>
              <dt>Website</dt>
              <dd>{brand.website || "—"}</dd>
              {brand.kycNote ? (
                <>
                  <dt>Last note</dt>
                  <dd>{brand.kycNote}</dd>
                </>
              ) : null}
            </dl>
            <BrandReview brandId={brand.id} compact />
          </div>
        )}

        {creator && (
          <div className="adm-panel">
            <h3>Creator</h3>
            <p style={{ margin: "0 0 0.5rem" }}>
              @{creator.handle} · {creator.level}
            </p>
            <Link href={"/admin/creators/" + creator.id} className="btn btn-ghost btn-compact">
              Open creator profile
            </Link>
          </div>
        )}
      </div>

      {brand && (
        <>
          <h2 style={{ marginTop: "1.75rem" }}>Campaigns ({campaigns.length})</h2>
          <div className="adm-table-wrap" style={{ marginTop: "0.75rem" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Approval</th>
                  <th>Status</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td><Link href={"/admin/bounties/" + c.id}>{c.title}</Link></td>
                    <td><ReviewChip review={campaignApproval(c)} /></td>
                    <td>{labelize(c.status)}</td>
                    <td className="adm-num">{formatINR(c.budgetPaise)}</td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={4} className="muted">No campaigns.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 style={{ marginTop: "1.75rem" }}>Admin history</h2>
      <div className="adm-panel" style={{ marginTop: "0.75rem" }}>
        {log.length === 0 && <p className="muted" style={{ margin: 0 }}>No admin actions on this account.</p>}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.6rem", fontSize: "0.875rem" }}>
          {log.map((h) => (
            <li key={h.id}>
              <strong>{labelize(h.action)}</strong> <span className="muted">· {formatIST(h.createdAt)}</span>
              {h.reason && <div>“{h.reason}”</div>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
