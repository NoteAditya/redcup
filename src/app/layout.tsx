import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { MotionProviders } from "@/components/motion/Providers";
import "./globals.css";

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
  themeColor: "#F7F2F1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=chillax@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={dmSans.variable}
        style={
          {
            ["--font-display" as string]: '"Chillax", system-ui, sans-serif',
          } as React.CSSProperties
        }
      >
        <MotionProviders>{children}</MotionProviders>
      </body>
    </html>
  );
}
