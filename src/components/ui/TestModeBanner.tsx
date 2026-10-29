export function TestModeBanner({ detail }: { detail?: string }) {
  return (
    <div
      className="connect-banner"
      role="status"
      style={{ borderColor: "var(--warn)", background: "color-mix(in srgb, var(--warn) 10%, white)" }}
    >
      <strong>TEST MODE</strong>
      <div className="muted" style={{ marginTop: 4 }}>
        {detail ||
          "Payments are simulated. No real money moves until Razorpay or Cashfree keys are connected."}
      </div>
    </div>
  );
}
