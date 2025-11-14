import { http, createConfig } from "wagmi";
import { zilliqa } from "viem/chains";

export const config = createConfig({
  chains: [zilliqa],
  transports: {
    [zilliqa.id]: http(),
  },
});
