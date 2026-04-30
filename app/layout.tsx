import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import MaintenanceGuard from "@/components/ui/MaintenanceGuard";
import DynamicStyleInjector from "@/components/ui/DynamicStyleInjector";
import MiniCart from "@/components/cart/MiniCart";
import NewsletterUplink from "@/components/ui/NewsletterUplink";
import UserPresenceTracker from "@/components/ui/UserPresenceTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "HORIZON | Luxury E-commerce",
  description: "A high-performance, real-time D2C e-commerce ecosystem for premium clothing.",
};

import CanvasShiftWrapper from "@/components/layout/CanvasShiftWrapper";
import RevealedMenu from "@/components/layout/RevealedMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="momentum-scroll">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <DynamicStyleInjector />
        <UserPresenceTracker />
        <MaintenanceGuard>
          <RevealedMenu />
          <CanvasShiftWrapper>
            {children}
            <MiniCart />
            <NewsletterUplink />
          </CanvasShiftWrapper>
        </MaintenanceGuard>
      </body>
    </html>
  );
}
