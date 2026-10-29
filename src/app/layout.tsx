import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { MotionProviders } from "@/components/motion/Providers";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${manrope.variable} antialiased`}>
        <MotionProviders>{children}</MotionProviders>
      </body>
    </html>
  );
}
