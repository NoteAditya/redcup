import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const db = await readDb();
  return (
    <div>
      <h1>Users</h1>
      <table className="table" style={{ marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {db.users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td className="muted">{u.email || u.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
