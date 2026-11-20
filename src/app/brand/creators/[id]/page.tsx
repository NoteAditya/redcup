import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { requirePageRole } from "@/server/auth/guard";
import { BrandPendingScreen, getBrandAccess } from "@/components/brand/BrandGate";
import { exploreCreators } from "@/server/explore";
import { syncTopReels, topReelsStale } from "@/server/instagram-sync";
import { CreatorBento } from "@/components/creator/CreatorBento";

export const dynamic = "force-dynamic";

/** Brand-facing creator profile. Public-safe fields only: no contact details, PAN or UPI. */
export default async function BrandCreatorPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("brand");
  const { db, brand, approved } = await getBrandAccess();
  if (!approved) return <BrandPendingScreen brand={brand} />;
  const { id } = await params;
  const row = exploreCreators(db).find((r) => r.creator.id === id);
  if (!row) notFound();
  if (row.creator.instagram && topReelsStale(row.creator.instagram)) {
    after(() => syncTopReels(id).catch(() => null));
  }
  return (
    <div className="profile-page">
      <Link href="/brand/explore" className="muted" style={{ fontSize: "0.85rem" }}>
        ← Explore creators
      </Link>
      <CreatorBento creator={row.creator} metrics={row.metrics} />
      <p className="muted" style={{ fontSize: "0.8rem", marginTop: "1rem" }}>
        Want this creator on a campaign? Creators apply to your live campaigns, and you see them once RedCup approves their
        application.
      </p>
    </div>
  );
}
