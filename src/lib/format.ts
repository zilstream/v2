import { formatUnits } from "viem";

const numberFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatNumber(
  value?: string | number | bigint,
  fractionDigits = 2,
) {
  if (value == null) return "-";

  const num = Number(
    typeof value === "bigint"
      ? value
      : typeof value === "string"
        ? value
        : value,
  );
  if (!Number.isFinite(num)) return typeof value === "string" ? value : "-";

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

const SUBSCRIPT_NUMBERS: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

function toSubscript(num: number): string {
  return num
    .toString()
    .split("")
    .map((d) => SUBSCRIPT_NUMBERS[d])
    .join("");
}

export function formatPriceUsd(value?: string | number) {
  if (value == null) return "-";

  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(num)) return typeof value === "string" ? value : "-";

  if (num === 0) return "$0.00";

  if (num < 0.00001) {
    const str = num.toFixed(20);
    const match = str.match(/^0\.0*([1-9]\d*)/);

    if (!match) return "$0.00";

    const zeros = str.match(/^0\.(0*)/)?.[1].length ?? 0;
    const significant = str.substring(2 + zeros, 2 + zeros + 4);

    return `$0.0${toSubscript(zeros)}${significant}`;
  }

  let fractionDigits = 2;
  if (num < 0.1) {
    fractionDigits = 6;
  } else if (num < 1.0) {
    fractionDigits = 4;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatUsd(value?: string | number, fractionDigits = 2) {
  if (value == null) return "-";

  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(num)) return typeof value === "string" ? value : "-";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatTokenAmount(
  value?: string | bigint,
  decimals?: number,
  fractionDigits = 4,
) {
  if (value == null) return "-";

  if (decimals == null) {
    return formatNumber(value, fractionDigits);
  }

  try {
    const bigintValue = typeof value === "bigint" ? value : BigInt(value);
    const formatted = formatUnits(bigintValue, decimals);
    const num = Number.parseFloat(formatted);
    if (Number.isNaN(num)) {
      return formatted;
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(num);
  } catch (_error) {
    return typeof value === "bigint" ? value.toString() : (value ?? "-");
  }
}

export function formatTimestamp(timestamp?: number) {
  if (!timestamp) return "-";

  return new Date(timestamp * 1000).toLocaleString("en-US", {
    hour12: false,
  });
}

export function formatZilPrice(value?: string | number) {
  if (value == null) return "-";

  const num = typeof value === "string" ? Number.parseFloat(value) : value;
  if (!Number.isFinite(num)) return typeof value === "string" ? value : "-";

  if (num === 0) return "0.00";

  if (num < 0.00001) {
    const str = num.toFixed(20);
    const match = str.match(/^0\.0*([1-9]\d*)/);

    if (!match) return "0.00";

    const zeros = str.match(/^0\.(0*)/)?.[1].length ?? 0;
    const significant = str.substring(2 + zeros, 2 + zeros + 4);

    return `0.0${toSubscript(zeros)}${significant}`;
  }

  let fractionDigits = 6;
  if (num > 100) {
    fractionDigits = 2;
  } else if (num > 10) {
    fractionDigits = 3;
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export { numberFormatter };
