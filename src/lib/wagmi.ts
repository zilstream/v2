import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { zilliqa } from "viem/chains";

export const config = getDefaultConfig({
  appName: "ZilStream",
  projectId: "9a73085bd2b8459dae2e269e6849eee1",
  chains: [zilliqa],
  ssr: true,
});
