import { describe, expect, it } from "vitest";
import { brandCheckoutTotal, creatorPayout, performanceEarning } from "@/lib/money";

describe("money math", () => {
  it("₹50,000 bounty checkout matches Final Model unit economics", () => {
    const c = brandCheckoutTotal(5_000_000);
    expect(c.fee).toBe(750_000);
    expect(c.gst).toBe(135_000);
    expect(c.total).toBe(5_885_000);
  });

  it("performance earning respects cap", () => {
    expect(performanceEarning(64000, 5000, 500_000)).toBe(320_000);
    expect(performanceEarning(1_000_000, 5000, 500_000)).toBe(500_000);
  });

  it("creator payout applies commission and TDS", () => {
    const p = creatorPayout(320_000);
    expect(p.commission).toBe(32_000);
    expect(p.net).toBe(p.earning - p.commission - p.tds);
  });
});
