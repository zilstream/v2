import { decodeEventLog, type Abi } from "viem";
import { ALL_ABIS } from "./abis";

export interface DecodedEvent {
  name: string;
  args: Record<string, unknown>;
  eventName: string;
}

interface EventLog {
  topics: string[];
  data: string;
}

export function decodeEvent(event: EventLog): DecodedEvent | null {
  if (event.topics.length === 0) {
    return null;
  }

  // Ensure topics and data have 0x prefix
  const topics = event.topics.map(topic => 
    topic.startsWith('0x') ? topic : `0x${topic}`
  ) as [`0x${string}`, ...`0x${string}`[]];
  
  const data = event.data.startsWith('0x') 
    ? event.data as `0x${string}` 
    : `0x${event.data}` as `0x${string}`;

  try {
    const decoded = decodeEventLog({
      abi: ALL_ABIS as Abi,
      data,
      topics,
    });

    if (!decoded.eventName) {
      return null;
    }

    return {
      name: decoded.eventName,
      args: (decoded.args ?? {}) as unknown as Record<string, unknown>,
      eventName: decoded.eventName,
    };
  } catch (error) {
    return null;
  }
}

export function formatDecodedArg(value: unknown): string {
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatDecodedArg).join(", ")}]`;
  }
  return String(value);
}
