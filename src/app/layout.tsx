import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { NavigationProgress } from "@/components/navigation-progress";
import { Providers } from "@/components/providers";
import { RainbowKitProvider } from "@/components/rainbow-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
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
  title: "ZilStream",
  description: "ZilStream for EVM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RainbowKitProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <SidebarProvider>
                <AppSidebar />
                <main className="flex min-h-screen w-full flex-col">
                  <SiteHeader />
                  <div className="flex-1">{children}</div>
                </main>
              </SidebarProvider>
            </RainbowKitProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
