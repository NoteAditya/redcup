export function ConnectBanner({
  provider,
  message,
}: {
  provider: string;
  message: string;
}) {
  return (
    <div className="connect-banner" role="status">
      <strong>Connect {provider}</strong>
      <div className="muted" style={{ marginTop: 4 }}>
        {message}
      </div>
    </div>
  );
}
