"use client";

import {
  RainbowKitProvider as RainbowKitProviderOriginal,
  lightTheme,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";
import * as React from "react";

import "@rainbow-me/rainbowkit/styles.css";

export function RainbowKitProvider({
  children,
}: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering the theme dependent provider after mount
  // Or just default to light/dark and let it switch?
  // RainbowKit might handle this internaly but accessing useTheme needs client side.
  
  // Actually, if we just pass the theme, RainbowKit might handle the rest. 
  // But resolvedTheme is undefined on server.
  
  return (
    <RainbowKitProviderOriginal
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProviderOriginal>
  );
}
