import { paymentConnectState } from "@/server/integrations/payments";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export default function BrandSettingsPage() {
  const pay = paymentConnectState();
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: "1rem", maxWidth: 520 }}>
        {!pay.ready && pay.message ? (
          <ConnectBanner provider={pay.provider} message={pay.message} />
        ) : (
          <div className="card">Payments connected via {pay.provider}.</div>
        )}
      </div>
    </div>
  );
}
