import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Syne, DM_Sans } from "next/font/google";
import { MotionProviders } from "@/components/motion/Providers";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const syne = Syne({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    "India's pay-for-results creator platform. Brands fund a reel bounty. Eligible creators apply. You pay for an approved live reel plus verified views.",
  openGraph: {
    title: "RedCup — Pay for verified Instagram views",
    description:
      "Fund a reel bounty. Award eligible creators. Pay for approved posts and verified views.",
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
  themeColor: "#140d0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrument.variable} ${syne.variable} ${dmSans.variable}`}>
      <body>
        <MotionProviders>{children}</MotionProviders>
      </body>
    </html>
  );
}
