import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

const nav = [
  { href: "/brand", label: "Dashboard" },
  { href: "/brand/bounties/new", label: "New bounty" },
  { href: "/brand/onboarding", label: "Profile / KYC" },
  { href: "/brand/settings", label: "Settings" },
];

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "brand") redirect("/");
  return <AppShell nav={nav}>{children}</AppShell>;
}
