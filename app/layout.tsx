import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#0a0d0c",
};

export const metadata: Metadata = {
  title: "GM Edge-Case Lab",
  description:
    "Unofficial compatibility suite: documented Ondo Stocks production states replayed against a happy-path integration.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
