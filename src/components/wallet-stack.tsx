import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import { RainbowKitProvider } from "./rainbow-provider";
import { WalletReadyProvider } from "./wallet-ready-context";

export function WalletStack({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <WalletReadyProvider>{children}</WalletReadyProvider>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}
