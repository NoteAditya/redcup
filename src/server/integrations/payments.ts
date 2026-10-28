import { brandCheckoutTotal } from "@/lib/money";

export type PaymentProviderName = "demo" | "razorpay" | "cashfree";

export function activePaymentProvider(): PaymentProviderName {
  const named = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (named === "razorpay" || named === "cashfree" || named === "demo") return named;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return "razorpay";
  if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) return "cashfree";
  return "demo";
}

export function paymentConnectState(): { ready: boolean; provider: PaymentProviderName; message?: string } {
  const provider = activePaymentProvider();
  if (provider === "demo") {
    return {
      ready: false,
      provider,
      message:
        "Connect Razorpay or Cashfree (set keys in Vercel env). Until then, checkout uses a clear demo capture that never moves real money.",
    };
  }
  return { ready: true, provider };
}

export async function createFundingOrder(input: {
  campaignId: string;
  brandId: string;
  budgetPaise: number;
  prizePaise?: number;
}): Promise<{
  provider: PaymentProviderName;
  orderId: string;
  amountPaise: number;
  checkout: ReturnType<typeof brandCheckoutTotal>;
  demo: boolean;
}> {
  const checkout = brandCheckoutTotal(input.budgetPaise, input.prizePaise ?? 0);
  const provider = activePaymentProvider();
  const orderId = `ord_${input.campaignId}_${Date.now()}`;

  if (provider === "razorpay") {
    // Real Razorpay Orders API would go here when keys are present.
    return { provider, orderId, amountPaise: checkout.total, checkout, demo: false };
  }
  if (provider === "cashfree") {
    return { provider, orderId, amountPaise: checkout.total, checkout, demo: false };
  }
  return { provider: "demo", orderId, amountPaise: checkout.total, checkout, demo: true };
}
