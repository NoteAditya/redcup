import { BrandOnboardingForm } from "@/components/brand/OnboardingForm";

export default function BrandOnboardingPage() {
  return (
    <div>
      <h1>Brand onboarding</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1.25rem", maxWidth: "48ch" }}>
        One question at a time. Your first bounty card builds as you answer — draft resumes on this device.
      </p>
      <BrandOnboardingForm />
    </div>
  );
}
