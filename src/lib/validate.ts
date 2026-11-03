export function requiredText(value: string, label: string) {
  const v = value.trim();
  if (!v) return `${label} is required. Enter a value to continue.`;
  return null;
}

export function emailOk(value: string) {
  const v = value.trim();
  if (!v) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email like you@brand.com.";
  return null;
}

export function passwordOk(value: string) {
  if (value.length < 6) return "Password needs at least 6 characters.";
  return null;
}

export function urlOptional(value: string) {
  const v = value.trim();
  if (!v) return null;
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    if (!u.hostname.includes(".")) return "Enter a full website like https://example.com.";
    return null;
  } catch {
    return "Enter a full website like https://example.com.";
  }
}

export function gstinOptional(value: string) {
  const v = value.trim().toUpperCase();
  if (!v) return null;
  if (!/^[0-9A-Z]{15}$/.test(v)) return "GSTIN must be 15 characters (letters and numbers).";
  return null;
}

export function panOk(value: string) {
  const v = value.trim().toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)) return "PAN looks like ABCDE1234F — five letters, four digits, one letter.";
  return null;
}

export function upiOk(value: string) {
  const v = value.trim();
  if (!/^[\w.\-]{2,}@[\w]{2,}$/i.test(v)) return "UPI ID looks like name@bank.";
  return null;
}

export function phoneOk(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "Enter a WhatsApp number with at least 10 digits.";
  return null;
}

export function handleOk(value: string) {
  const v = value.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9._]{2,30}$/.test(v)) return "Handle can use letters, numbers, dots and underscores.";
  return null;
}

export function positiveRupees(n: number, label: string, min = 1) {
  if (!Number.isFinite(n) || n < min) return `${label} must be at least ₹${min}.`;
  return null;
}
