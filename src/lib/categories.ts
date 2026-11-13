/**
 * One category list for brands, creators and campaign niche rules.
 * Eligibility matches niches case-insensitively by name, so these labels are the values we store.
 */
export const CATEGORIES = [
  "Fashion",
  "Beauty",
  "Skincare",
  "Food",
  "Travel",
  "Tech",
  "Fitness",
  "Health & Wellness",
  "Lifestyle",
  "Gaming",
  "Finance",
  "Education",
  "Comedy",
  "Entertainment",
  "Parenting",
  "Automotive",
  "Music",
  "Sports",
  "Home & Decor",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** Most categories a creator can pick (keeps fit scoring meaningful). */
export const MAX_CREATOR_CATEGORIES = 3;

const BY_LOWER = new Map<string, Category>(CATEGORIES.map((c) => [c.toLowerCase(), c]));

/** Obvious synonyms only. Anything not listed here is left as the user typed it. */
const SYNONYMS: Record<string, Category> = {
  makeup: "Beauty",
  cosmetics: "Beauty",
  "beauty & personal care": "Beauty",
  "personal care": "Beauty",
  "skin care": "Skincare",
  skin: "Skincare",
  haircare: "Beauty",
  "hair care": "Beauty",
  style: "Fashion",
  apparel: "Fashion",
  clothing: "Fashion",
  food: "Food",
  foodie: "Food",
  "food & beverage": "Food",
  "food and beverage": "Food",
  "f&b": "Food",
  cafe: "Food",
  cooking: "Food",
  recipes: "Food",
  beverage: "Food",
  beverages: "Food",
  technology: "Tech",
  gadgets: "Tech",
  gym: "Fitness",
  workout: "Fitness",
  health: "Health & Wellness",
  wellness: "Health & Wellness",
  "health and wellness": "Health & Wellness",
  fintech: "Finance",
  "personal finance": "Finance",
  money: "Finance",
  edtech: "Education",
  education: "Education",
  games: "Gaming",
  esports: "Gaming",
  humour: "Comedy",
  humor: "Comedy",
  memes: "Comedy",
  parenting: "Parenting",
  mom: "Parenting",
  auto: "Automotive",
  cars: "Automotive",
  bikes: "Automotive",
  travel: "Travel",
  sport: "Sports",
  cricket: "Sports",
  "home decor": "Home & Decor",
  home: "Home & Decor",
  interiors: "Home & Decor",
};

/** The list category a free-text value obviously means, or null when it is not obvious. */
export function toCategory(value: string | null | undefined): Category | null {
  const v = (value || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!v) return null;
  return BY_LOWER.get(v) ?? SYNONYMS[v] ?? null;
}

export function isCategory(value: string): value is Category {
  return BY_LOWER.get(value.trim().toLowerCase()) === value;
}

/**
 * Map stored values to list categories where obvious, keeping unknown values as they are
 * (never silently dropped). Duplicates are removed, order kept.
 */
export function mapCategories(values: string[]): { mapped: string[]; changed: boolean } {
  const out: string[] = [];
  for (const raw of values) {
    const v = toCategory(raw) ?? raw.trim();
    if (v && !out.includes(v)) out.push(v);
  }
  const changed = out.length !== values.length || out.some((v, i) => v !== values[i]);
  return { mapped: out, changed };
}

/** Validate a creator's picks from the dropdown. */
export function creatorCategoriesOk(values: string[]): string | null {
  if (!values.length) return "Pick at least one category.";
  if (values.length > MAX_CREATOR_CATEGORIES) return `Pick up to ${MAX_CREATOR_CATEGORIES} categories.`;
  return null;
}
