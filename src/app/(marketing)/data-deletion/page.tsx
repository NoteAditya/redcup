import Link from "next/link";
import { MarketingShell } from "@/components/layout/MarketingShell";
import { CONTACT_EMAIL } from "@/lib/site";
import { readDb } from "@/server/db/store";
import { formatIST } from "@/lib/format";

export const metadata = { title: "Data Deletion — RedCup" };
export const dynamic = "force-dynamic";

export default async function DataDeletionPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const request = code
    ? (await readDb()).dataDeletionRequests.find((r) => r.code === code) ?? null
    : null;

  return (
    <MarketingShell>
      <div style={{ maxWidth: "780px", margin: "2rem auto 4rem" }}>
        <p className="kicker">Data Protection</p>
        <h1 style={{ marginBottom: "1rem" }}>Delete your RedCup data</h1>

        {code ? (
          <div className="card" role="status" style={{ marginBottom: "1.5rem" }}>
            {request ? (
              <>
                <strong>Request {request.code}</strong>
                <p className="muted" style={{ marginTop: "0.35rem" }}>
                  Received {formatIST(request.requestedAt)}.{" "}
                  {request.status === "completed"
                    ? "Your Instagram data (token, profile details and picture) has been deleted from RedCup."
                    : "We had no Instagram data stored for this account, so there was nothing to delete."}
                </p>
              </>
            ) : (
              <p className="muted">We couldn&apos;t find a request with code {code}. Email us if you need help.</p>
            )}
          </div>
        ) : null}

        <div className="card" style={{ padding: "2.5rem", display: "grid", gap: "1.5rem", lineHeight: 1.7 }}>
          <div>
            <h2 style={{ fontSize: "1.1rem" }}>Delete your Instagram data</h2>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>Any of these works:</p>
            <ol style={{ marginTop: "0.5rem", color: "var(--ink-secondary)", paddingLeft: "1.2rem" }}>
              <li>
                In RedCup, open <Link href="/creator/settings">Settings</Link> and choose{" "}
                <strong>Disconnect and delete my Instagram data</strong>. It happens immediately and you get a
                confirmation code.
              </li>
              <li>
                In Instagram, go to <strong>Settings and activity</strong> → <strong>Website permissions</strong> →{" "}
                <strong>Apps and websites</strong>, find RedCup and remove it. Meta tells us and we delete the data
                automatically; you can check the status with the confirmation code Meta shows you.
              </li>
              <li>
                Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on your account, or
                tell us your Instagram username, and ask us to delete your data.
              </li>
            </ol>
          </div>
          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.1rem" }}>What gets deleted</h2>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Your Instagram access token, username, name, bio, website, profile picture and follower, following and post
              counts. If you ask by email to close your account, we also delete your profile, contact and payout details.
              Records of campaigns you were paid for are kept only as long as Indian tax and accounting law requires.
            </p>
          </div>
          <div style={{ paddingTop: "1.25rem", borderTop: "1px solid var(--line)" }}>
            <h2 style={{ fontSize: "1.1rem" }}>How long it takes</h2>
            <p style={{ marginTop: "0.5rem", color: "var(--ink-secondary)" }}>
              Requests from Settings and from Instagram are processed straight away. Email requests are handled within
              30 days. See the <Link href="/privacy">privacy policy</Link> for more.
            </p>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
