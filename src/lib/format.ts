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

export { numberFormatter };
