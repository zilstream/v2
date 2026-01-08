import { createPublicClient, http } from "viem";
import { zilliqa } from "./wagmi";

export const publicClient = createPublicClient({
  chain: zilliqa,
  transport: http("https://api.zilliqa.com", {
    batch: {
      batchSize: 50,
      wait: 10,
    },
    retryCount: 3,
    timeout: 30_000,
  }),
});
