import Link from "next/link";
import { readDb } from "@/server/db/store";
import { formatIST, labelize } from "@/lib/format";

export const dynamic = "force-dynamic";

type SP = Promise<{ q?: string; role?: string; state?: string }>;

export default async function UsersPage({ searchParams }: { searchParams: SP }) {
  const { q = "", role = "", state = "" } = await searchParams;
  const db = await readDb();
  const brands = new Map(db.brands.map((b) => [b.userId, b]));
  const creators = new Map(db.creators.map((c) => [c.userId, c]));
  const needle = q.trim().toLowerCase();
  const rows = db.users
    .filter((u) => !role || u.role === role)
    .filter((u) => !state || u.status === state)
    .filter((u) => {
      if (!needle) return true;
      const hay = [u.name, u.email, u.phone, brands.get(u.id)?.businessName, creators.get(u.id)?.handle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(needle);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <h1>Users</h1>
      <p className="adm-sub">
        {rows.length} of {db.users.length}
      </p>
      <form className="adm-toolbar" method="get">
        <input className="input" type="search" name="q" defaultValue={q} placeholder="Name, email, phone, brand or handle" aria-label="Search users" />
        <select className="select" name="role" defaultValue={role} aria-label="Role">
          <option value="">All roles</option>
          <option value="brand">Brands</option>
          <option value="creator">Creators</option>
          <option value="admin">Admins</option>
        </select>
        <select className="select" name="state" defaultValue={state} aria-label="Account state">
          <option value="">Active and off</option>
          <option value="active">Active</option>
          <option value="inactive">Turned off</option>
        </select>
        <button className="btn btn-ghost btn-compact" type="submit">Filter</button>
        {(q || role || state) && (
          <Link href="/admin/users" className="muted" style={{ fontSize: "0.8125rem", alignSelf: "center" }}>
            Clear
          </Link>
        )}
      </form>
      <div className="adm-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Approval</th>
              <th>Account</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const b = brands.get(u.id);
              const c = creators.get(u.id);
              return (
                <tr key={u.id}>
                  <td>
                    <Link href={"/admin/users/" + u.id}>{b?.businessName || u.name}</Link>
                    {c && <div className="muted" style={{ fontSize: "0.75rem" }}>@{c.handle}</div>}
                  </td>
                  <td>{u.role}</td>
                  <td className="muted">{u.email || u.phone || "—"}</td>
                  <td>{b ? labelize(b.kycStatus) : u.role === "creator" ? "not needed" : "—"}</td>
                  <td>
                    <span className={u.status === "inactive" ? "chip chip-bad" : "chip chip-ok"}>
                      {u.status === "inactive" ? "off" : "active"}
                    </span>
                  </td>
                  <td className="muted" style={{ fontSize: "0.8125rem" }}>{formatIST(u.createdAt)}</td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">No users match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
