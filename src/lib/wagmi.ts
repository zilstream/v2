import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  rabbyWallet,
  injectedWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { zilliqa } from "viem/chains";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [metaMaskWallet, rabbyWallet, injectedWallet, walletConnectWallet],
    },
  ],
  {
    appName: "ZilStream",
    projectId: "9a73085bd2b8459dae2e269e6849eee1",
  }
);

export const config = createConfig({
  connectors,
  chains: [zilliqa],
  ssr: true,
  transports: {
    [zilliqa.id]: http(),
  },
});
