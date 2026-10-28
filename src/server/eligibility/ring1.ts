import { RING1 } from "@/lib/pricing";
import type { CreatorMetrics, EligibilityReason } from "@/lib/types";

export function ring1Failures(m: CreatorMetrics): EligibilityReason[] {
  const fails: EligibilityReason[] = [];

  if (!m.igConnected || !m.tokenValid || !m.accountType || m.accountType === "PERSONAL") {
    fails.push({
      code: "IG_NOT_CONNECTED",
      message: "Connect your Instagram professional account",
    });
  }

  if (m.accountAgeDays == null || m.accountAgeDays < RING1.minAccountAgeDays) {
    const n = m.accountAgeDays ?? 0;
    fails.push({
      code: "ACCOUNT_TOO_NEW",
      message: `Your account needs to be ${RING1.minAccountAgeDays} days old (yours: ${n} days)`,
      numeric: true,
      threshold: RING1.minAccountAgeDays,
      value: n,
    });
  }

  if (m.mediaCount < RING1.minPosts) {
    fails.push({
      code: "TOO_FEW_POSTS",
      message: `You need at least ${RING1.minPosts} posts (you have ${m.mediaCount})`,
      numeric: true,
      threshold: RING1.minPosts,
      value: m.mediaCount,
    });
  }

  const missing: string[] = [];
  if (!m.whatsapp) missing.push("WhatsApp");
  if (!m.pan) missing.push("PAN");
  if (!m.upi) missing.push("UPI");
  if (missing.length) {
    fails.push({
      code: "PROFILE_INCOMPLETE",
      message: `Add your ${missing.join(", ")} to apply`,
    });
  }

  if (m.fraudFlagsUpheld > 0) {
    fails.push({
      code: "ACCOUNT_RESTRICTED",
      message: "Your account can't apply right now; contact support",
    });
  }

  return fails;
}
