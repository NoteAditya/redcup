import { redirect } from "next/navigation";
import type { Role } from "@/lib/types";
import { getSession } from "./session";

/**
 * Role check for dashboard pages. Layout redirects are not enough: Next renders a layout and
 * its page in parallel, so a page that only relies on its layout can still stream its data to a
 * visitor who is being redirected. Every page under /admin, /brand and /creator calls this first.
 */
export async function requirePageRole(role: Role) {
  const session = await getSession();
  if (session.deactivated) redirect("/login?deactivated=1");
  if (session.creatorUseInstagram) redirect("/login?creator=instagram");
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn || !session.userId) redirect("/login");
  if (session.role !== role) redirect("/");
  return session as typeof session & { userId: string; role: Role };
}
