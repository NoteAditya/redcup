import Link from "next/link";
import { Clock, ScanEye, Wallet } from "lucide-react";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "About RedCup — Performance Creator Platform" };

export default function AboutPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "760px", margin: "clamp(1.5rem, 4vw, 3rem) 0 clamp(2.5rem, 5vw, 4rem)" }}>
        <div className="kicker">
          <span>About RedCup</span>
        </div>
        <h1 style={{ marginBottom: "1.15rem", lineHeight: 1.08 }}>
          Built for brands and creators who want verified results.
        </h1>
        <p className="lede">
          Creator marketing in India runs on screenshots, upfront fees and hope. Brands can&apos;t tell what worked, and good creators with smaller audiences get skipped. RedCup changes that: brands pay creators a fixed base per approved reel and the rest only for verified results, and creators get paid fairly for real results.
        </p>

        <div style={{ display: "flex", gap: "0.85rem", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/signup" className="btn btn-primary">
            Get started
          </Link>
          <Link href="/#how-it-works" className="btn btn-ghost">
            See how it works
          </Link>
        </div>
      </div>

      <section className="card" style={{ maxWidth: "760px", margin: "0 0 var(--section-gap)" }}>
        <h2 style={{ fontSize: "1.35rem" }}>Who we are</h2>
        <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
          RedCup is built in India by Harsh Pratap Singh, Om and Aditya Maurya, and is a brand of Luvante Group LLP.
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          margin: "var(--section-gap) 0",
        }}
      >
        <div className="card">
          <span className="chip" style={{ marginBottom: "0.85rem" }}>
            For brands
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Predictable costs</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            See the full cost before you pay, approve every reel, and get unused budget back.
          </p>
        </div>

        <div className="card">
          <span className="chip" style={{ marginBottom: "0.85rem" }}>
            For creators
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Fair, clear pay</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            A fixed amount per approved reel, plus more for verified views, paid by UPI.
          </p>
        </div>

        <div className="card">
          <span className="chip" style={{ marginBottom: "0.85rem" }}>
            How we check
          </span>
          <h3 style={{ fontSize: "1.25rem" }}>Real views only</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", fontSize: "0.9375rem", lineHeight: 1.65 }}>
            We read views from Instagram and remove suspicious ones before anyone is paid.
          </p>
        </div>
      </div>

      {/* Platform Guarantees Section */}
      <section
        style={{
          backgroundColor: "var(--paper-subtle)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-card)",
          padding: "clamp(2.5rem, 5vw, 4rem)",
          margin: "var(--section-gap) 0 2rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ maxWidth: "600px", marginBottom: "2rem" }}>
          <h2>What we promise</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "2rem",
          }}
        >
          <div>
            <span className="side-card-icon" aria-hidden="true">
              <Wallet size={24} strokeWidth={1.75} />
            </span>
            <h4 style={{ marginBottom: "0.35rem" }}>Funded first</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              No campaign opens until the brand&apos;s budget is held safely by Razorpay.
            </p>
          </div>

          <div>
            <span className="side-card-icon" aria-hidden="true">
              <ScanEye size={24} strokeWidth={1.75} />
            </span>
            <h4 style={{ marginBottom: "0.35rem" }}>Checked views</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Suspicious views are removed before anyone is paid.
            </p>
          </div>

          <div>
            <span className="side-card-icon" aria-hidden="true">
              <Clock size={24} strokeWidth={1.75} />
            </span>
            <h4 style={{ marginBottom: "0.35rem" }}>On-time payouts</h4>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Creators are paid by UPI about a week after posting.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
