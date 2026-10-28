import { paymentConnectState } from "@/server/integrations/payments";
import { ConnectBanner } from "@/components/ui/ConnectBanner";
import { TestModeBanner } from "@/components/ui/TestModeBanner";

export default function BrandSettingsPage() {
  const pay = paymentConnectState();
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: "1rem", maxWidth: 520, display: "grid", gap: "0.75rem" }}>
        {!pay.ready && pay.message ? (
          <>
            <TestModeBanner />
            <ConnectBanner provider={pay.provider} message={pay.message} />
          </>
        ) : (
          <div className="card">Payments connected via {pay.provider}.</div>
        )}
      </div>
    </div>
  );
}
