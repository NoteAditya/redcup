import { BountyBuilder } from "@/components/brand/BountyBuilder";
import { BrandPendingScreen, getBrandAccess } from "@/components/brand/BrandGate";

export const dynamic = "force-dynamic";

export default async function NewBountyPage() {
  const { brand, approved } = await getBrandAccess();
  if (!approved) return <BrandPendingScreen brand={brand} />;
  return (
    <div>
      <h1>New bounty</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        Pick a criteria preset, set money, then fund. RedCup reviews every bounty before creators see it. TEST MODE capture is used until payment keys are connected — no real money moves.
      </p>
      <BountyBuilder />
    </div>
  );
}
