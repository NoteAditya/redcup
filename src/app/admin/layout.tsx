import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { pendingCounts } from "@/server/admin-data";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.deactivated) redirect("/login?deactivated=1");
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "admin") redirect("/");
  const counts = pendingCounts(await readDb());
  const nav = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/applications", label: "Applications", count: counts.applications },
    { href: "/admin/campaign-approvals", label: "Campaign approvals", count: counts.campaigns },
    { href: "/admin/verification", label: "Brand approvals", count: counts.brands },
    { href: "/admin/campaigns", label: "Campaigns" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/activity", label: "Activity log" },
    { href: "/admin/metrics", label: "Metrics" },
    { href: "/admin/payouts", label: "Payouts" },
  ];
  return <AppShell nav={nav}>{children}</AppShell>;
}
