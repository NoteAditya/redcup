import { BrandOnboardingForm } from "@/components/brand/OnboardingForm";

export default function BrandOnboardingPage() {
  return (
    <div>
      <h1>Brand profile & KYC</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem", maxWidth: "48ch" }}>
        Submit GSTIN for verification. An admin must approve before your first bounty can go live.
      </p>
      <div style={{ maxWidth: 480 }}>
        <BrandOnboardingForm />
      </div>
    </div>
  );
}
