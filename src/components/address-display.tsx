"use client";

import { useQuery } from "@tanstack/react-query";
import {
  type Address,
  encodePacked,
  isAddress,
  keccak256,
  namehash,
} from "viem";
import { shortenAddress } from "@/lib/format";
import { publicClient } from "@/lib/public-client";
import { zilliqa } from "@/lib/wagmi";

interface AddressDisplayProps {
  address: string;
  chars?: number;
  shorten?: boolean;
  showAddress?: boolean;
  className?: string;
}

const L2_RESOLVER_ABI = [
  {
    type: "function",
    name: "name",
    inputs: [{ name: "node", type: "bytes32" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
] as const;

const L2_RESOLVER_ADDRESS = zilliqa.contracts?.ensUniversalResolver
  ?.address as Address;

function convertChainIdToCoinType(chainId: number) {
  if (chainId === 1) {
    return "addr";
  }

  if (chainId === 33101) {
    return "80002105";
  }

  const coinType = (0x80000000 | chainId) >>> 0;
  return coinType.toString(16).toUpperCase();
}

function convertReverseNodeToBytes(address: Address, chainId: number) {
  const addressFormatted = address.toLowerCase() as Address;
  const addressNode = keccak256(addressFormatted.slice(2) as Address);
  const chainCoinType = convertChainIdToCoinType(chainId);
  const baseReverseNode = namehash(`${chainCoinType.toUpperCase()}.reverse`);

  return keccak256(
    encodePacked(["bytes32", "bytes32"], [baseReverseNode, addressNode]),
  );
}

async function fetchZilname(address: Address) {
  const addressReverseNode = convertReverseNodeToBytes(address, zilliqa.id);

  try {
    const zilname = await publicClient.readContract({
      abi: L2_RESOLVER_ABI,
      address: L2_RESOLVER_ADDRESS,
      functionName: "name",
      args: [addressReverseNode],
    });

    return zilname || null;
  } catch {
    return null;
  }
}

export function AddressDisplay({
  address,
  chars = 4,
  shorten = true,
  showAddress = false,
  className,
}: AddressDisplayProps) {
  const isValidAddress = isAddress(address);
  const { data: zilname } = useQuery({
    queryKey: ["zilname", address],
    queryFn: () => fetchZilname(address as Address),
    enabled: isValidAddress,
    refetchOnWindowFocus: false,
  });

  const resolvedName = zilname && zilname.length > 0 ? zilname : null;
  const shortAddress = shortenAddress(address, chars);
  const fullAddress = address;
  const fallback = shorten ? shortAddress : address;
  const title = resolvedName && !showAddress ? address : undefined;

  if (showAddress) {
    if (resolvedName) {
      return (
        <span className={className} title={address}>
          <span>{resolvedName}</span>
          <span className="text-muted-foreground md:hidden">
            {" "}
            · {shortAddress}
          </span>
          <span className="text-muted-foreground hidden md:inline">
            {" "}
            · {fullAddress}
          </span>
        </span>
      );
    }

    return (
      <span className={className} title={address}>
        <span className="md:hidden">{shortAddress}</span>
        <span className="hidden md:inline">{fullAddress}</span>
      </span>
    );
  }

  return (
    <span className={className} title={title}>
      {resolvedName ?? fallback}
    </span>
  );
}
