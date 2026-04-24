/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { NavigationProgress } from "@/components/navigation-progress";
import { Providers } from "@/components/providers";
import { RainbowKitProvider } from "@/components/rainbow-provider";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import appCss from "@/styles/app.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ZilStream" },
      { name: "description", content: "ZilStream for EVM." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
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
                <Toaster />
              </SidebarProvider>
            </RainbowKitProvider>
          </ThemeProvider>
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
