import { whatsappConnectState } from "@/server/integrations/whatsapp";
import { ConnectBanner } from "@/components/ui/ConnectBanner";

export default function CreatorSettingsPage() {
  const wa = whatsappConnectState();
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: "1rem", maxWidth: 520 }}>
        {!wa.ready && wa.message ? (
          <ConnectBanner provider="WhatsApp" message={wa.message} />
        ) : (
          <div className="card">WhatsApp alerts connected.</div>
        )}
      </div>
    </div>
  );
}
