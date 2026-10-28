import fs from 'fs';
import path from 'path';
const root = process.cwd();
function w(rel, content) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  console.log('wrote', rel);
}

w('src/app/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="axis axis-hero" style={{ padding: "1.5rem 0 2rem" }}>
        <div>
          <p className="chip chip-cup" style={{ marginBottom: "1rem" }}>
            Pay for verified views
          </p>
          <h1 style={{ maxWidth: "18ch" }}>Fund a reel bounty. Pay creators for results.</h1>
          <p className="prose-tight" style={{ marginTop: "1rem", maxWidth: "42ch", fontSize: "1rem" }}>
            RedCup is for Indian brands that want Instagram reels with an upfront budget, a shortlist of
            eligible creators, and payouts tied to an approved live reel plus verified views — not vanity
            follower counts.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            <Link href="/signup?role=brand" className="btn btn-primary">
              Start as a brand
            </Link>
            <Link href="/signup?role=creator" className="btn btn-ghost">
              Join as a creator
            </Link>
          </div>
        </div>
        <div className="ui-fragment" aria-hidden>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Product preview · bounty card
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "baseline" }}>
            <strong>Weekend skincare reel</strong>
            <span className="chip">Live</span>
          </div>
          <p className="muted" style={{ margin: "0.5rem 0 0.75rem", fontSize: "0.85rem" }}>
            Base + {formatINR(80000)} / 1K views · cap {formatINR(1500000)}
          </p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <span className="chip">Beauty</span>
            <span className="chip">Hindi / English</span>
            <span className="chip chip-ok">Eligible</span>
          </div>
          <div className="solid-block" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
            Apply → shortlist by Fit Score → brand awards → draft → live reel → verified views
          </div>
        </div>
      </section>

      <section className="axis axis-2" style={{ marginTop: "1rem" }}>
        <div className="card">
          <h2>For brands</h2>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            Set criteria, fund the bounty once, shortlist from Fit Score, award up to your slots, review drafts,
            and settle against verified views.
          </p>
          <Link href="/for-brands" className="btn btn-ghost" style={{ marginTop: "0.9rem" }}>
            How brands use RedCup
          </Link>
        </div>
        <div className="card">
          <h2>For creators</h2>
          <p className="muted" style={{ marginTop: "0.5rem" }}>
            See eligibility on every card. Apply only when you match. Earn a base for an approved live reel, then
            pay per verified 1,000 views up to the cap.
          </p>
          <Link href="/for-creators" className="btn btn-ghost" style={{ marginTop: "0.9rem" }}>
            How creators earn
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/for-brands/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For brands" };

export default function ForBrandsPage() {
  return (
    <MarketingShell>
      <h1>Run a pay-for-results bounty</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem" }}>
        You fund the creator budget upfront. RedCup takes a 15% fee (+ GST). Creators apply, we shortlist by Fit
        Score, you award, review drafts, and pay against verified views.
      </p>
      <ol className="card" style={{ marginTop: "1.25rem", paddingLeft: "1.6rem", lineHeight: 1.7 }}>
        <li>Complete KYC (GSTIN). An admin approves before first live bounty.</li>
        <li>Build criteria with presets — see a live eligible-creator count.</li>
        <li>Fund budget + fee. Campaign goes live for applications.</li>
        <li>Close applications → shortlist (3× slots) → award within 48 hours.</li>
        <li>Review draft (one revision). Approve → creator posts → we verify views.</li>
      </ol>
      <Link href="/signup?role=brand" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
        Create a brand account
      </Link>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/for-creators/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";

export const metadata = { title: "For creators" };

export default function ForCreatorsPage() {
  return (
    <MarketingShell>
      <h1>Earn for approved reels and verified views</h1>
      <p className="muted" style={{ maxWidth: "52ch", marginTop: "0.75rem" }}>
        Connect Instagram, finish PAN and UPI, and apply only to bounties you are eligible for. RedCup shows
        Eligible / Almost / Not eligible on every card — no claim-first scramble.
      </p>
      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Base + performance</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Base pays when your draft is approved and the reel is live with a paid partnership label. Performance
            pays per verified 1,000 views, capped.
          </p>
        </div>
        <div className="card">
          <h3>Fit Score shortlist</h3>
          <p className="muted" style={{ marginTop: "0.4rem" }}>
            Matching niches, audience, and reliability raise your Fit Score. Brands award from the shortlist;
            if they miss the deadline, top Fit Scores auto-award.
          </p>
        </div>
      </div>
      <Link href="/signup?role=creator" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
        Create a creator account
      </Link>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/bounties/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Bounties" };
export const dynamic = "force-dynamic";

export default async function BountiesPage() {
  const db = await readDb();
  const live = db.campaigns.filter((c) => ["live", "shortlisted", "in_production", "tracking"].includes(c.status));
  const brands = new Map(db.brands.map((b) => [b.id, b]));

  return (
    <MarketingShell>
      <h1>Open bounties</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>
        Public list of live and active campaigns. Sign in as a creator to see your eligibility on each card.
      </p>
      <div style={{ display: "grid", gap: "0.85rem", marginTop: "1.25rem" }}>
        {live.length === 0 && (
          <div className="card muted">No live bounties yet. Brands can fund one from the dashboard after KYC.</div>
        )}
        {live.map((c) => {
          const brand = brands.get(c.brandId);
          return (
            <Link key={c.id} href={"/bounties/" + c.slug} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <strong>{c.title}</strong>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                    {brand?.businessName || "Brand"} · {c.slots} slots · {formatINR(c.budgetPaise)} budget
                  </div>
                </div>
                <span className="chip">{c.status}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/bounties/[slug]/page.tsx', `import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatINR } from "@/lib/money";
import { formatIST } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function BountyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await readDb();
  const campaign = db.campaigns.find((c) => c.slug === slug);
  if (!campaign) notFound();
  const brand = db.brands.find((b) => b.id === campaign.brandId);

  return (
    <MarketingShell>
      <Link href="/bounties" className="muted" style={{ fontSize: "0.85rem" }}>
        ← All bounties
      </Link>
      <h1 style={{ marginTop: "0.75rem" }}>{campaign.title}</h1>
      <p className="muted" style={{ marginTop: "0.35rem" }}>
        {brand?.businessName} · {campaign.status}
        {campaign.applicationClosesAt ? " · applies close " + formatIST(campaign.applicationClosesAt) : ""}
      </p>
      <div className="axis axis-2" style={{ marginTop: "1.25rem" }}>
        <div className="card">
          <h3>Brief</h3>
          <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>{campaign.brief}</p>
          {campaign.dosDonts && (
            <>
              <h3 style={{ marginTop: "1rem" }}>Do / don't</h3>
              <p style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }} className="muted">
                {campaign.dosDonts}
              </p>
            </>
          )}
        </div>
        <div className="card">
          <h3>Money</h3>
          <ul style={{ marginTop: "0.5rem", paddingLeft: "1.1rem", lineHeight: 1.7 }}>
            <li>Budget {formatINR(campaign.budgetPaise)}</li>
            <li>Base {formatINR(campaign.basePaise)}</li>
            <li>Rate {formatINR(campaign.ratePer1000Paise)} / 1K views</li>
            <li>Cap per creator {formatINR(campaign.capPerCreatorPaise)}</li>
            <li>{campaign.slots} slots</li>
          </ul>
          <Link href="/signup?role=creator" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Apply as creator
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/creators/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatFollowers } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const metadata = { title: "Creators" };
export const dynamic = "force-dynamic";

export default async function CreatorsDirectoryPage() {
  const db = await readDb();
  const metrics = new Map(db.creatorMetrics.map((m) => [m.creatorId, m]));

  return (
    <MarketingShell>
      <h1>Creators</h1>
      <p className="muted" style={{ marginTop: "0.5rem" }}>Directory of listed and verified creators on RedCup.</p>
      <div style={{ display: "grid", gap: "0.75rem", marginTop: "1.25rem" }}>
        {db.creators.length === 0 && <div className="card muted">No creators yet.</div>}
        {db.creators.map((c) => {
          const m = metrics.get(c.id);
          return (
            <Link key={c.id} href={"/creators/" + c.handle} className="card" style={{ display: "block" }}>
              <strong>{c.displayName}</strong>
              <span className="muted"> @{c.handle}</span>
              <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                {c.city || "India"} · {c.level}
                {m ? " · " + formatFollowers(m.followers) + " followers" : ""}
              </div>
            </Link>
          );
        })}
      </div>
    </MarketingShell>
  );
}
`);

w('src/app/(marketing)/creators/[handle]/page.tsx', `import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { formatFollowers } from "@/lib/format";
import { readDb } from "@/server/db/store";

export const dynamic = "force-dynamic";

export default async function CreatorPublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const db = await readDb();
  const creator = db.creators.find((c) => c.handle === handle);
  if (!creator) notFound();
  const m = db.creatorMetrics.find((x) => x.creatorId === creator.id);

  return (
    <MarketingShell>
      <h1>{creator.displayName}</h1>
      <p className="muted">@{creator.handle} · {creator.level} · {creator.city || "India"}</p>
      <div className="card" style={{ marginTop: "1rem" }}>
        <div>Categories: {creator.categories.join(", ") || "—"}</div>
        <div style={{ marginTop: 8 }}>Languages: {creator.languages.join(", ") || "—"}</div>
        {m && (
          <div style={{ marginTop: 8 }} className="muted">
            {formatFollowers(m.followers)} followers
            {m.avgReelViews10 != null ? " · avg reel views " + formatFollowers(m.avgReelViews10) : ""}
          </div>
        )}
      </div>
    </MarketingShell>
  );
}
`);

const legal = [
  ["about", "About", "RedCup is an India-focused creator marketing platform. Brands fund Instagram reel bounties; eligible creators apply; Fit Score shortlists; brands award; creators earn base + pay per verified views."],
  ["contact", "Contact", "Email thenoteaditya@gmail.com for brand onboarding, creator support, or partnerships."],
  ["terms", "Terms", "By using RedCup you agree to fund bounties in INR, keep KYC accurate, and follow Meta paid partnership rules. Full legal terms ship with launch counsel review."],
  ["privacy", "Privacy", "We store account, KYC, campaign, and Instagram metric data needed to run bounties. PAN and UPI are masked in the UI and encrypted at rest when ENCRYPTION_KEY is set."],
  ["refunds", "Refunds", "Unused budget after a bounty closes returns to the brand wallet (minus non-refundable platform fee already charged). Creators are paid only after verification."],
];
for (const [slug, title, body] of legal) {
  w("src/app/(marketing)/" + slug + "/page.tsx",
    'import { MarketingShell } from "@/components/layout/MarketingShell";\\n\\n' +
    'export const metadata = { title: "' + title + '" };\\n\\n' +
    "export default function Page() {\\n" +
    "  return (\\n" +
    "    <MarketingShell>\\n" +
    "      <h1>" + title + "</h1>\\n" +
    '      <p className="muted" style={{ marginTop: "0.75rem", maxWidth: "56ch" }}>' + body + "</p>\\n" +
    "    </MarketingShell>\\n" +
    "  );\\n" +
    "}\\n"
  );
}

w('src/app/login/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignInForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <MarketingShell>
      <h1>Sign in</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
      <div style={{ maxWidth: 420 }}>
        <SignInForm />
      </div>
    </MarketingShell>
  );
}
`);

w('src/app/signup/page.tsx', `import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { SignUpForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role = sp.role === "creator" ? "creator" : "brand";
  return (
    <MarketingShell>
      <h1>Create account</h1>
      <p className="muted" style={{ margin: "0.5rem 0 1rem" }}>
        Already have one? <Link href="/login">Sign in</Link>
      </p>
      <div style={{ maxWidth: 420 }}>
        <SignUpForm defaultRole={role} />
      </div>
    </MarketingShell>
  );
}
`);

w('src/app/verify/page.tsx', `import { MarketingShell } from "@/components/layout/MarketingShell";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export const metadata = { title: "Verify" };

export default function VerifyPage() {
  return (
    <MarketingShell>
      <h1>Verify OTP</h1>
      <div style={{ maxWidth: 480, marginTop: "1rem" }}>
        <ConnectBanner
          provider="Resend or MSG91"
          message="OTP verification needs RESEND_API_KEY or SMS_API_KEY. Use demo password sign-in until those keys are connected."
        />
      </div>
    </MarketingShell>
  );
}
`);

console.log('public pages done');
