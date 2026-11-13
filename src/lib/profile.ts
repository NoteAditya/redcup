/** Who has finished onboarding. The step-by-step wizard only runs for people who haven't. */

type BrandLike = { category?: string | null; city?: string | null; onboardedAt?: string | null };
type CreatorLike = { city?: string | null; categories?: string[] | null; onboardedAt?: string | null };

export function brandOnboarded(b: BrandLike | null | undefined): boolean {
  if (!b) return false;
  return Boolean(b.onboardedAt) || Boolean(b.category?.trim() && b.city?.trim());
}

export function creatorOnboarded(c: CreatorLike | null | undefined): boolean {
  if (!c) return false;
  return Boolean(c.onboardedAt) || Boolean(c.city?.trim() && c.categories?.length);
}

/** A brand needs a GSTIN before RedCup can approve it (admins can override with a reason). */
export function brandHasGst(b: { gstin?: string | null } | null | undefined): boolean {
  return Boolean(b?.gstin?.trim());
}
