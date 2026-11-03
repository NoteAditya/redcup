export function TestModeBanner({ detail }: { detail?: string }) {
  return (
    <div className="test-mode-banner" role="status">
      <strong>TEST MODE</strong>
      <span>
        {detail ||
          "Payments run in test mode. No live charges until production Razorpay keys are connected."}
      </span>
    </div>
  );
}
