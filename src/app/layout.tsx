import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
