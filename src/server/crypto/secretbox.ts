import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "crypto";

/**
 * AES-256-GCM for secrets we keep at rest (Instagram access tokens).
 * The key is derived from SESSION_SECRET with HKDF, so no extra env var is needed.
 * Rotating SESSION_SECRET makes old ciphertexts unreadable; callers treat that as
 * "token invalid" and the creator simply logs in with Instagram again.
 */
const VERSION = "v1";

function key(purpose: string): Buffer {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required to encrypt tokens.");
  }
  const material = secret || "dev-only-session-secret-change-me-32chars!!";
  return Buffer.from(hkdfSync("sha256", material, "redcup", `redcup:${purpose}`, 32));
}

export function seal(plain: string, purpose = "instagram-token"): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(purpose), iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), body.toString("base64url")].join(".");
}

/** Returns null when the value is malformed or was sealed with another key. */
export function open(sealed: string | null | undefined, purpose = "instagram-token"): string | null {
  if (!sealed) return null;
  const [v, iv, tag, body] = sealed.split(".");
  if (v !== VERSION || !iv || !tag || !body) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(purpose), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(body, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
