import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About" };

export default function Page() {
  return (
    <MarketingShell>
      <h1>About RedCup</h1>
      <p style={{ marginTop: "0.75rem", maxWidth: "56ch", fontSize: "1.05rem" }}>
        RedCup is an India-focused creator marketing platform. Brands fund Instagram reel bounties; eligible creators
        apply; Fit Score shortlists; brands award; creators earn base plus pay per verified views.
      </p>
      <section className="how-band" style={{ marginTop: "2rem" }}>
        <div className="how-cols">
          <div>
            <h3>For brands</h3>
            <p>Fund once, award from a shortlist, pay on verified results.</p>
          </div>
          <div>
            <h3>For creators</h3>
            <p>Apply where you match. Earn base and capped performance.</p>
          </div>
          <div>
            <h3>In between</h3>
            <p>Draft review, paid labels, and view verification in one place.</p>
          </div>
        </div>
      </section>
      <Link href="/signup" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
        Get started
      </Link>
    </MarketingShell>
  );
}
