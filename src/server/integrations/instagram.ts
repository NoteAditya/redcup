export function instagramConnectState() {
  const ready = Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
  return {
    ready,
    message: ready
      ? undefined
      : "Connect Meta / Instagram (META_APP_ID + META_APP_SECRET). Until App Review, admins can enter views from screen recordings.",
  };
}

export function instagramAuthUrl(state: string): string | null {
  if (!process.env.META_APP_ID || !process.env.META_REDIRECT_URI) return null;
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: process.env.META_REDIRECT_URI,
    scope: "instagram_business_basic,instagram_business_manage_insights",
    response_type: "code",
    state,
  });
  return `https://api.instagram.com/oauth/authorize?${params}`;
}
