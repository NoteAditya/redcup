import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

const nav = [
  { href: "/creator", label: "Dashboard" },
  { href: "/creator/applications", label: "Applications" },
  { href: "/creator/profile", label: "Profile" },
  { href: "/creator/settings", label: "Settings" },
];

export default async function CreatorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session.deactivated) redirect("/login?deactivated=1");
  if (session.creatorUseInstagram) redirect("/login?creator=instagram");
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn) redirect("/login");
  if (session.role !== "creator") redirect("/");
  return <AppShell nav={nav}>{children}</AppShell>;
}
