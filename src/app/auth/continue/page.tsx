import { redirect } from "next/navigation";
import { getSession } from "@/server/auth/session";

export const metadata = { title: "Continuing — RedCup" };

export default async function AuthContinuePage() {
  const session = await getSession();
  if (session.needsRole) redirect("/signup?claim=1");
  if (!session.isLoggedIn || !session.role) redirect("/login");
  if (session.role === "brand") redirect("/brand");
  if (session.role === "creator") redirect("/creator");
  if (session.role === "admin") redirect("/admin");
  redirect("/");
}
