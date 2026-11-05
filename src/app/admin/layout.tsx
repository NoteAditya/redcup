import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/metrics", label: "Metrics" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "admin") redirect("/");
  return <AppShell nav={nav}>{children}</AppShell>;
}
