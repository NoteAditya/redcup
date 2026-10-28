import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "Contact" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>Contact</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>Email thenoteaditya@gmail.com for brand onboarding, creator support, or partnerships.</p>
    </MarketingShell>
  );
}
