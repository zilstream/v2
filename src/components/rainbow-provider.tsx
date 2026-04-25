import {
  darkTheme,
  lightTheme,
  RainbowKitProvider as RainbowKitProviderOriginal,
} from "@rainbow-me/rainbowkit";
import { useTheme } from "next-themes";

import "@rainbow-me/rainbowkit/styles.css";

export function RainbowKitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <RainbowKitProviderOriginal
      theme={resolvedTheme === "dark" ? darkTheme() : lightTheme()}
    >
      {children}
    </RainbowKitProviderOriginal>
  );
}
