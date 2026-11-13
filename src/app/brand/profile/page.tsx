import { redirect } from "next/navigation";
import { requirePageRole } from "@/server/auth/guard";
import { getBrandAccess } from "@/components/brand/BrandGate";
import { BrandProfileForm } from "@/components/brand/ProfileForm";
import { brandHasGst, brandOnboarded } from "@/lib/profile";
import { labelize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BrandProfilePage() {
  await requirePageRole("brand");
  const { brand, approved } = await getBrandAccess();
  if (!brand || !brandOnboarded(brand)) redirect("/brand/onboarding");
  const gst = brandHasGst(brand);
  const status = approved
    ? { chip: "chip chip-ok", label: "Approved", text: "Your brand is approved. You can create and fund campaigns." }
    : brand.kycStatus === "rejected"
      ? { chip: "chip chip-bad", label: "Not approved", text: brand.kycNote ? `Note from RedCup: ${brand.kycNote}` : "Update your profile and save to send it back for review." }
      : !gst
        ? { chip: "chip chip-warn", label: "GST missing", text: "Add your GST to get approved. Saving a GSTIN sends your brand to RedCup for review." }
        : { chip: "chip chip-warn", label: "Pending approval", text: "Your GST is in. A RedCup admin is reviewing your brand." };
  return (
    <div className="profile-page">
      <div className="profile-page-head">
        <span className="chip">Brand profile</span>
        <h1>{brand.businessName}</h1>
        <p className="muted">What creators see on your bounty cards.</p>
      </div>
      <section className="bento" aria-label="Brand overview">
        <div className="bento-tile bento-hero">
          <div className="brand-mark" aria-hidden>
            {(brand.businessName || "?").slice(0, 1).toUpperCase()}
          </div>
          <h2 className="bento-name">{brand.businessName}</h2>
          <p className="bento-handle">
            {brand.city || "City not set"}
            {brand.website ? (
              <>
                {" · "}
                <a href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`} target="_blank" rel="noreferrer">
                  {brand.website.replace(/^https?:\/\//, "")}
                </a>
              </>
            ) : null}
          </p>
          {brand.category ? (
            <div className="bento-chips">
              <span className="chip chip-cup">{brand.category}</span>
            </div>
          ) : null}
        </div>
        <div className={`bento-tile bento-status ${approved ? "is-ink" : "is-blush"}`}>
          <span className="bento-label">Approval</span>
          <span className={status.chip}>{status.label}</span>
          <p>{status.text}</p>
          {!approved && !gst ? (
            <a href="#gst" className="btn btn-primary btn-compact">
              Add your GST
            </a>
          ) : null}
        </div>
        <div className="bento-tile bento-stat">
          <span className="bento-label">GSTIN</span>
          <strong style={{ fontSize: "1rem" }}>{brand.gstin || "Not added"}</strong>
        </div>
        <div className="bento-tile bento-stat">
          <span className="bento-label">Status</span>
          <strong style={{ fontSize: "1rem" }}>{labelize(brand.kycStatus)}</strong>
        </div>
      </section>
      <section className="bento-tile profile-edit" aria-labelledby="edit-h">
        <h2 id="edit-h">Edit profile</h2>
        <BrandProfileForm
          initial={{
            businessName: brand.businessName,
            category: brand.category,
            city: brand.city,
            website: brand.website ?? "",
            gstin: brand.gstin,
            approved,
          }}
        />
      </section>
    </div>
  );
}
