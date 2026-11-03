import { brandCheckoutTotal } from "@/lib/money";

export type PaymentProviderName = "demo" | "razorpay" | "cashfree";

export function activePaymentProvider(): PaymentProviderName {
  const named = (process.env.PAYMENT_PROVIDER || "").toLowerCase();
  if (named === "razorpay" || named === "cashfree" || named === "demo") return named;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) return "razorpay";
  if (process.env.RAZORPAY_KEY_ID) return "razorpay"; // key-id-only checkout path
  if (process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY) return "cashfree";
  return "demo";
}

export function paymentConnectState(): {
  ready: boolean;
  provider: PaymentProviderName;
  message?: string;
  testMode: boolean;
  hasSecret: boolean;
} {
  const provider = activePaymentProvider();
  const hasSecret = Boolean(process.env.RAZORPAY_KEY_SECRET);
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const testMode = keyId.startsWith("rzp_test_") || provider === "demo";

  if (provider === "demo") {
    return {
      ready: false,
      provider,
      testMode: true,
      hasSecret: false,
      message:
        "TEST MODE — no real money moves. Connect Razorpay or Cashfree keys in Vercel env for live checkout.",
    };
  }
  if (provider === "razorpay" && !hasSecret) {
    return {
      ready: false,
      provider,
      testMode,
      hasSecret: false,
      message:
        "TEST MODE — Razorpay key_id is set but key_secret is missing. Checkout can show the key; order creation needs the secret.",
    };
  }
  return {
    ready: true,
    provider,
    testMode,
    hasSecret,
    message: testMode ? "TEST MODE — Razorpay test keys; no live charges." : undefined,
  };
}

export function publicRazorpayKeyId(): string | null {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || null;
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
  razorpayOrderId?: string;
  keyId?: string | null;
  error?: string;
}> {
  const checkout = brandCheckoutTotal(input.budgetPaise, input.prizePaise ?? 0);
  const provider = activePaymentProvider();
  const localOrderId = `ord_${input.campaignId}_${Date.now()}`;

  if (provider === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId) {
      return { provider: "demo", orderId: localOrderId, amountPaise: checkout.total, checkout, demo: true };
    }
    if (!secret) {
      return {
        provider,
        orderId: localOrderId,
        amountPaise: checkout.total,
        checkout,
        demo: true,
        keyId,
        error: "RAZORPAY_KEY_SECRET required to create orders",
      };
    }
    const auth = Buffer.from(`${keyId}:${secret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: checkout.total,
        currency: "INR",
        receipt: localOrderId.slice(0, 40),
        notes: { campaignId: input.campaignId, brandId: input.brandId },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; error?: { description?: string } };
    if (!res.ok || !data.id) {
      console.info("[razorpay:order-failed]", res.status, data.error?.description || "unknown");
      return {
        provider,
        orderId: localOrderId,
        amountPaise: checkout.total,
        checkout,
        demo: true,
        keyId,
        error: data.error?.description || `Razorpay HTTP ${res.status}`,
      };
    }
    // rzp_test_* : create a real test order, then auto-capture so bounties go live
    // without Checkout UI. Live rzp_live_* waits for payment confirmation.
    const autoCapture = keyId.startsWith("rzp_test_");
    return {
      provider,
      orderId: localOrderId,
      razorpayOrderId: data.id,
      amountPaise: checkout.total,
      checkout,
      demo: autoCapture,
      keyId,
    };
  }

  if (provider === "cashfree") {
    return { provider, orderId: localOrderId, amountPaise: checkout.total, checkout, demo: false };
  }
  return { provider: "demo", orderId: localOrderId, amountPaise: checkout.total, checkout, demo: true };
}
