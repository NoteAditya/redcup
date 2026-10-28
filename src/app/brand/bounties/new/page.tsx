import { BountyBuilder } from "@/components/brand/BountyBuilder";

export default function NewBountyPage() {
  return (
    <div>
      <h1>New bounty</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        Pick a criteria preset, set money, then fund. Demo capture is used until payment keys are connected.
      </p>
      <BountyBuilder />
    </div>
  );
}
