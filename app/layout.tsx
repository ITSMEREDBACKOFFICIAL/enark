import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import MaintenanceGuard from "@/components/ui/MaintenanceGuard";
import DynamicStyleInjector from "@/components/ui/DynamicStyleInjector";
import MiniCart from "@/components/cart/MiniCart";
import NewsletterUplink from "@/components/ui/NewsletterUplink";
import UserPresenceTracker from "@/components/ui/UserPresenceTracker";
import GlobalBackButton from "@/components/ui/GlobalBackButton";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "ENARK | Retail OS",
  description: "High-performance D2C ecosystem for premium Indian fashion. Shop the Obsidian collection.",
};

import CanvasShiftWrapper from "@/components/layout/CanvasShiftWrapper";
import RevealedMenu from "@/components/layout/RevealedMenu";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import InitialLoader from "@/components/ui/InitialLoader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="momentum-scroll" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <InitialLoader />
        <SmoothScrollProvider>
          <DynamicStyleInjector />
          <UserPresenceTracker />
          <MaintenanceGuard>
            <RevealedMenu />
            <CanvasShiftWrapper>
              {children}
              <MiniCart />
              <NewsletterUplink />
              <GlobalBackButton />
            </CanvasShiftWrapper>
          </MaintenanceGuard>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
