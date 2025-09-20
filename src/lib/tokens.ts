import { getAddress } from "viem";

const ICON_BASE_URL =
  "https://raw.githubusercontent.com/Plunderswap/token-lists/refs/heads/main/images";

export function getTokenIconUrl(address?: string) {
  if (!address) return undefined;

  try {
    const checksummed = getAddress(address);
    return `${ICON_BASE_URL}/${checksummed}.png`;
  } catch (_error) {
    return undefined;
  }
}
