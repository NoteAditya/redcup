import { paymentConnectState } from "@/server/integrations/payments";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { TestModeBanner } from "@/components/ui/TestModeBanner";

export default function BrandSettingsPage() {
  const pay = paymentConnectState();
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: "1rem", maxWidth: 520, display: "grid", gap: "0.75rem" }}>
        {pay.testMode ? <TestModeBanner detail={pay.message} /> : null}
        {!pay.ready && pay.message ? (
          <ConnectBanner provider={pay.provider} message={pay.message} />
        ) : (
          <div className="card">
            Payments connected via {pay.provider}
            {pay.testMode ? " (test keys)." : "."}
          </div>
        )}
      </div>
    </div>
  );
}
