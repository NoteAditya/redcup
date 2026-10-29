import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <MarketingShell>
      <p className="chip" style={{ marginBottom: "0.85rem" }}>
        Company
      </p>
      <h1>About RedCup</h1>
      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch", fontSize: "1.02rem" }}>
        RedCup is an India-focused creator marketing platform. Brands fund Instagram reel bounties; eligible
        creators apply; Fit Score shortlists; brands award; creators earn base plus pay per verified views.
      </p>
      <div className="axis axis-3" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3>For brands</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Fund once, award from a shortlist, pay on verified results.
          </p>
        </div>
        <div className="card">
          <h3>For creators</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Apply where you match. Earn base and capped performance.
          </p>
        </div>
        <div className="card">
          <h3>In between</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Draft review, paid labels, and view verification in one place.
          </p>
        </div>
      </div>
      <Link href="/signup" className="btn btn-primary" style={{ marginTop: "1.35rem" }}>
        Get started
      </Link>
    </MarketingShell>
  );
}
