import { redirect } from "next/navigation";
import { BrandOnboardingForm } from "@/components/brand/OnboardingForm";
import { requirePageRole } from "@/server/auth/guard";
import { readDb } from "@/server/db/store";
import { brandOnboarded } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function BrandOnboardingPage() {
  const session = await requirePageRole("brand");
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId);
  // The step-by-step setup is only for brands that haven't finished it; everyone else edits their profile.
  if (brandOnboarded(brand)) redirect("/brand/profile");
  return (
    <div>
      <h1>Brand onboarding</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1.25rem", maxWidth: "48ch" }}>
        One question at a time. Your first campaign card builds as you answer — draft resumes on this device.
      </p>
      <BrandOnboardingForm
        initial={{ businessName: brand?.businessName ?? "", city: brand?.city ?? "", website: brand?.website ?? "" }}
      />
    </div>
  );
}
