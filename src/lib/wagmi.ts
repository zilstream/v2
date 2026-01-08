import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { defineChain } from "viem";

export const zilliqa = defineChain({
  id: 32769,
  name: "Zilliqa",
  nativeCurrency: { name: "Zilliqa", symbol: "ZIL", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.zilliqa.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Otterscan",
      url: "https://otterscan.zilliqa.com",
    },
  },
  contracts: {
    multicall3: {
      address: "0x38899efb93d5106d3adb86662c557f237f6ecf57",
      blockCreated: 3251173,
    },
  },
});

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        injectedWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "ZilStream",
    projectId: "9a73085bd2b8459dae2e269e6849eee1",
  },
);

export const config = createConfig({
  connectors,
  chains: [zilliqa],
  ssr: true,
  transports: {
    [zilliqa.id]: http(),
  },
});
