import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "RedCup — Pay for verified Instagram views",
    template: "%s · RedCup",
  },
  description:
    "India's pay-for-results creator platform. Brands fund a reel bounty. Eligible creators apply. You pay for an approved live reel plus verified views.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plex.variable} antialiased`}>{children}</body>
    </html>
  );
}
