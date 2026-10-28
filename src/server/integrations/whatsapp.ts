export function whatsappConnectState() {
  const ready = Boolean(process.env.WHATSAPP_API_KEY);
  return {
    ready,
    message: ready
      ? undefined
      : "Connect a WhatsApp Business provider (WHATSAPP_API_KEY). Alerts are queued but not sent until then.",
  };
}
