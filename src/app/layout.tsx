import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import 'leaflet/dist/leaflet.css';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "WebShopping.lk - Fresh Groceries Delivered in Sri Lanka",
  description: "Get fresh groceries, fruits, vegetables and more delivered to your doorstep in minutes with WebShopping.lk.",
};

import Providers from "./Providers";
import MobileWrapper from "@/components/layout/MobileWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <MobileWrapper>
            {children}
          </MobileWrapper>
        </Providers>
      </body>
    </html>
  );
}
