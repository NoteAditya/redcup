import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = { title: "Privacy Policy — RedCup" };

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <p>
        RedCup is a platform in India where brands fund Instagram reel campaigns and creators apply to make them. This
        policy explains what we collect, why, who we share it with, and how to have it deleted. Questions go to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
  {
    title: "What we collect from creators",
    body: (
      <>
        <p>Creators sign up and log in with Instagram. When you do, Instagram shares with us, with your permission:</p>
        <ul>
          <li>your Instagram account id, username, name, account type, bio and website;</li>
          <li>your profile picture, follower, following and post counts;</li>
          <li>
            for reels you post for a RedCup campaign, the view count from Instagram insights, so we can pay you for
            verified views.
          </li>
        </ul>
        <p>
          We also store an access token that Instagram issues for your account, so we can refresh these numbers. It is
          encrypted (AES-256-GCM) before it is saved and is never shown in the app. We do not post, comment or send
          messages on your behalf.
        </p>
        <p>
          During onboarding you give us your city, languages, content categories, WhatsApp number, PAN and UPI ID. We
          use these to match you to campaigns, contact you about them and pay you. PAN and UPI are shown masked in the
          app.
        </p>
      </>
    ),
  },
  {
    title: "What we collect from brands",
    body: (
      <p>
        Business name, contact email or phone, a password (stored only as a hash) or your Google account through our
        sign-in provider, category, city, website and GSTIN for verification, and the campaigns you create and fund.
      </p>
    ),
  },
  {
    title: "How we use it",
    body: (
      <ul>
        <li>to run your account and keep you signed in (one secure session cookie);</li>
        <li>to check creator eligibility for campaigns and show approved creators to the brand that runs the campaign;</li>
        <li>to verify reel views and calculate payouts and our commission;</li>
        <li>to review brands, campaigns and applications, and to prevent fraud;</li>
        <li>to send emails about your account and campaigns.</li>
      </ul>
    ),
  },
  {
    title: "Who sees your data",
    body: (
      <>
        <p>
          Brands only see creators that RedCup has approved for their campaign, and only the profile details needed to
          choose creators (name, handle, followers, niches and fit score). They never see your token, PAN, UPI or
          WhatsApp number. RedCup admins can see everything needed to review accounts and pay creators.
        </p>
        <p>
          We use service providers to run RedCup: Meta (Instagram login and data), Neon (database), Netlify (hosting),
          Clerk (Google sign-in for brands), Resend (email) and our payment provider for brand payments. They process
          data only to provide their service to us. We do not sell personal data or use it for advertising.
        </p>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <p>
        We keep account data while your account is open. Instagram profile data is refreshed when you log in and is
        removed when you disconnect or ask us to delete it. Records of campaigns, views and payments are kept as long
        as Indian tax and accounting law requires.
      </p>
    ),
  },
  {
    title: "Deleting your data",
    body: (
      <p>
        Creators can delete their Instagram data at any time from Settings, or by removing RedCup in Instagram&apos;s
        settings under Apps and websites. You can also email us to close your account. See{" "}
        <Link href="/data-deletion">data deletion instructions</Link>.
      </p>
    ),
  },
  {
    title: "Changes",
    body: <p>If we change this policy we will update this page and the date below.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div style={{ maxWidth: "780px", margin: "2rem auto 4rem" }}>
        <h1 style={{ marginBottom: "1rem" }}>Privacy Policy</h1>
        <p className="muted" style={{ marginBottom: "2rem" }}>Last updated: 13 November 2026</p>
        <div className="card legal-copy" style={{ padding: "2.5rem", display: "grid", gap: "1.75rem", lineHeight: 1.7 }}>
          {sections.map((s, i) => (
            <div key={s.title} style={i ? { paddingTop: "1.25rem", borderTop: "1px solid var(--line)" } : undefined}>
              <h2 style={{ fontSize: "1.1rem" }}>
                {i + 1}. {s.title}
              </h2>
              <div style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", display: "grid", gap: "0.6rem" }}>{s.body}</div>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
