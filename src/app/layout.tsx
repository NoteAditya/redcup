import type { Metadata, Viewport } from "next";
import { Archivo, Hanken_Grotesk } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { MotionProviders } from "@/components/motion/Providers";
import "./globals.css";
import { redcupClerkAppearance } from "@/components/auth/clerkAppearance";

// Type system (UI changes, 20 Nov): Archivo (semi-expanded) for headings, Hanken Grotesk for everything else.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://redcup-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RedCup — Pay for verified Instagram views",
    template: "%s · RedCup",
  },
  description:
    "India's pay-for-results creator platform. Brands fund a reel campaign. Eligible creators apply. You pay for an approved live reel plus verified views.",
  openGraph: {
    title: "RedCup — Pay for verified Instagram views",
    description:
      "Fund a reel campaign. Award eligible creators. Pay for approved posts and verified views.",
    url: siteUrl,
    siteName: "RedCup",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RedCup",
    description: "Pay for verified Instagram views — not vanity reach.",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${hankenGrotesk.variable}`}
    >
      <body>
        <ClerkProvider appearance={redcupClerkAppearance} afterSignOutUrl="/">
          <MotionProviders>{children}</MotionProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
