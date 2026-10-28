import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/server/auth/session";
import { readDb } from "@/server/db/store";
import { DraftUploadForm, ReelLinkForm } from "@/components/creator/ApplicationActions";

export const dynamic = "force-dynamic";

export default async function CreatorApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const db = await readDb();
  const creator = db.creators.find((c) => c.userId === session.userId);
  const app = db.applications.find((a) => a.id === id && a.creatorId === creator?.id);
  if (!app) notFound();
  const campaign = db.campaigns.find((c) => c.id === app.campaignId);
  const drafts = db.drafts.filter((d) => d.applicationId === app.id);

  return (
    <div>
      <Link href="/creator/applications" className="muted" style={{ fontSize: "0.85rem" }}>
        ← Applications
      </Link>
      <h1 style={{ marginTop: "0.5rem" }}>{campaign?.title}</h1>
      <p className="muted">Status: {app.status}</p>
      <div style={{ marginTop: "1rem", display: "grid", gap: "1rem", maxWidth: 520 }}>
        {(app.status === "AWARDED" || app.status === "REVISION") && <DraftUploadForm applicationId={app.id} />}
        {app.status === "APPROVED" && <ReelLinkForm applicationId={app.id} />}
        {drafts.map((d) => (
          <div key={d.id} className="card">
            Draft v{d.version}: {d.reviewStatus}
            {d.reviewReason && <p className="muted">{d.reviewReason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
