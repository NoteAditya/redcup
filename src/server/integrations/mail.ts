/**
 * Transactional email via Resend.
 * Secrets: RESEND_API_KEY only from env. Never log the key.
 * Default from: onboarding@resend.dev (Resend test sender).
 */

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendMail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string; skipped?: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      // Dev fallback — do not print recipient bodies with secrets
      console.info("[mail:demo]", args.subject, "→", args.to);
    }
    return { ok: true, skipped: true };
  }

  const from = process.env.RESEND_FROM || "RedCup <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text || args.html.replace(/<[^>]+>/g, " "),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      console.info("[mail:error]", res.status, data.message || "send failed");
      return { ok: false, error: data.message || `HTTP ${res.status}` };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.info("[mail:error]", e instanceof Error ? e.message : "network");
    return { ok: false, error: "network" };
  }
}

export async function sendWelcomeEmail(to: string, name: string, role: "brand" | "creator") {
  const path = role === "brand" ? "/brand/onboarding" : "/creator/onboarding";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://redcup-ten.vercel.app";
  return sendMail({
    to,
    subject: `Welcome to RedCup, ${name}`,
    html: `<p>Hi ${escapeHtml(name)},</p>
<p>Your ${role} account is ready. Continue setup here:</p>
<p><a href="${site}${path}">${site}${path}</a></p>
<p>— RedCup</p>`,
  });
}

export async function sendApplicationNotice(to: string, campaignTitle: string, creatorName: string) {
  return sendMail({
    to,
    subject: `New application on ${campaignTitle}`,
    html: `<p>${escapeHtml(creatorName)} applied to <strong>${escapeHtml(campaignTitle)}</strong>.</p>
<p>Review shortlist in your brand dashboard.</p>`,
  });
}

export async function sendAwardNotice(to: string, campaignTitle: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://redcup-ten.vercel.app";
  return sendMail({
    to,
    subject: `You were awarded: ${campaignTitle}`,
    html: `<p>You were awarded on <strong>${escapeHtml(campaignTitle)}</strong>.</p>
<p>Open your applications: <a href="${site}/creator/applications">${site}/creator/applications</a></p>`,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
