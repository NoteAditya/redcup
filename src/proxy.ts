import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Public-first: marketing + auth stay open. Dashboards keep their own
 * layout guards (iron-session + Clerk bridge) so password e2e still works.
 */
export default clerkMiddleware(async () => {
  // Session enrichment happens in getSession(); no hard protect here.
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
