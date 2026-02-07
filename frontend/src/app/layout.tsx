import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Dashboard | Real-time Stock Tracking",
  description: "Dynamic portfolio dashboard with real-time stock prices, P/E ratios, and earnings data from Yahoo Finance and Google Finance",
  keywords: ["portfolio", "stocks", "finance", "dashboard", "real-time", "investment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI','Roboto',sans-serif] tracking-tight`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
