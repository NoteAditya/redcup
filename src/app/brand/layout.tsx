import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { redirect } from "next/navigation";

const fullNav = [
  { href: "/brand", label: "Dashboard" },
  { href: "/brand/bounties/new", label: "New bounty" },
  { href: "/brand/onboarding", label: "Profile" },
  { href: "/brand/settings", label: "Settings" },
];
const pendingNav = [
  { href: "/brand", label: "Approval status" },
  { href: "/brand/onboarding", label: "Profile" },
];

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.deactivated) redirect("/login?deactivated=1");
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "brand") redirect("/");
  const db = await readDb();
  const approved = db.brands.find((b) => b.userId === session.userId)?.kycStatus === "approved";
  return <AppShell nav={approved ? fullNav : pendingNav}>{children}</AppShell>;
}
