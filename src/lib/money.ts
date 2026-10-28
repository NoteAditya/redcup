import { CREATOR_COMMISSION_RATE, GST_RATE, PLATFORM_FEE_RATE, TDS_RATE } from "./pricing";

/** All money is integer paise. */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function formatINR(paise: number): string {
  const sign = paise < 0 ? "-" : "";
  const n = Math.abs(paise) / 100;
  return (
    sign +
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    }).format(n)
  );
}

export function platformFee(budgetPaise: number): number {
  return Math.round(budgetPaise * PLATFORM_FEE_RATE);
}

export function gstOnFee(feePaise: number): number {
  return Math.round(feePaise * GST_RATE);
}

export function brandCheckoutTotal(budgetPaise: number, prizePaise = 0): {
  budget: number;
  fee: number;
  gst: number;
  prize: number;
  total: number;
} {
  const fee = platformFee(budgetPaise);
  const gst = gstOnFee(fee);
  return { budget: budgetPaise, fee, gst, prize: prizePaise, total: budgetPaise + fee + gst + prizePaise };
}

/** Performance earning from verified views, capped. */
export function performanceEarning(views: number, ratePer1000Paise: number, capPaise: number): number {
  const raw = Math.floor((views / 1000) * ratePer1000Paise);
  return Math.min(raw, capPaise);
}

export function creatorPayout(earningPaise: number, prizePaise = 0): {
  earning: number;
  commission: number;
  tds: number;
  prize: number;
  net: number;
} {
  const commission = Math.round(earningPaise * CREATOR_COMMISSION_RATE);
  const afterCommission = earningPaise - commission + prizePaise;
  const tds = Math.round(afterCommission * TDS_RATE);
  const net = afterCommission - tds;
  return { earning: earningPaise, commission, tds, prize: prizePaise, net };
}
