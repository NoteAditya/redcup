import Link from "next/link";
import type { Brand } from "@/server/db/store";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { brandHasGst, brandOnboarded } from "@/lib/profile";

/** Server helper: the signed-in brand and whether RedCup has approved it. */
export async function getBrandAccess() {
  const session = await getSession();
  const db = await readDb();
  const brand = db.brands.find((b) => b.userId === session.userId) ?? null;
  return { session, db, brand, approved: brand?.kycStatus === "approved" };
}

export function BrandPendingScreen({ brand }: { brand: Brand | null }) {
  const status = brand?.kycStatus ?? "not_submitted";
  const onboarded = brandOnboarded(brand);
  const gstMissing = onboarded && !brandHasGst(brand);
  const title =
    status === "rejected"
      ? "RedCup couldn’t approve your brand yet"
      : status === "submitted"
        ? "Your brand is waiting for RedCup approval"
        : gstMissing
          ? "Add your GST to get approved"
          : "Finish your brand profile to get approved";
  const body =
    status === "rejected"
      ? "Update your profile with the details below and save it to send it back for review."
      : status === "submitted"
        ? "We review every brand before it can create or fund campaigns. You’ll get full access as soon as an admin approves your account."
        : gstMissing
          ? "Your profile is saved. RedCup approves brands once a GSTIN is on file. Add it from your profile and it goes straight to our review queue."
          : "Tell us about your business. Once your profile and GSTIN are in, a RedCup admin reviews it and unlocks your dashboard.";
  const href = !onboarded ? "/brand/onboarding" : gstMissing ? "/brand/profile#gst" : "/brand/profile";
  const cta =
    !onboarded ? "Finish brand profile" : gstMissing ? "Add your GST" : status === "submitted" ? "Review your profile" : "Open brand profile";
  return (
    <div className="adm-gate">
      <span className={status === "rejected" ? "chip chip-bad" : "chip chip-warn"}>
        {status === "rejected" ? "Not approved" : gstMissing ? "Pending · GST missing" : "Pending approval"}
      </span>
      <h1 style={{ marginTop: "0.75rem" }}>{title}</h1>
      <p className="lede" style={{ marginTop: "0.5rem" }}>{body}</p>
      {status === "rejected" && brand?.kycNote && (
        <div className="adm-panel" style={{ marginTop: "1rem" }}>
          <strong style={{ fontSize: "0.875rem" }}>Note from RedCup</strong>
          <p style={{ margin: "0.35rem 0 0" }}>{brand.kycNote}</p>
        </div>
      )}
      <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Link href={href} className="btn btn-primary">
          {cta}
        </Link>
      </div>
    </div>
  );
}
