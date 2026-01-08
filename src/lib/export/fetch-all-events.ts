import {
  fetchAddressEvents,
  fetchAddressTransactions,
  type AddressEvent,
  type Transaction,
} from "@/lib/api-client";
import type { DateRange, ExportProgress } from "./types";

export async function fetchAllEventsInRange(
  address: string,
  dateRange: DateRange,
  onProgress?: (progress: ExportProgress) => void,
): Promise<AddressEvent[]> {
  const allEvents: AddressEvent[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;
  const startTimestamp = Math.floor(dateRange.start.getTime() / 1000);
  const endTimestamp = Math.floor(dateRange.end.getTime() / 1000);

  while (hasMore) {
    onProgress?.({
      phase: "fetching",
      current: allEvents.length,
      total: -1,
      message: `Fetching events page ${page}...`,
    });

    const response = await fetchAddressEvents(address, page, perPage);

    const filteredEvents = response.data.filter(
      (e) => e.timestamp >= startTimestamp && e.timestamp <= endTimestamp,
    );
    allEvents.push(...filteredEvents);

    const oldestEvent = response.data[response.data.length - 1];
    if (
      !response.pagination.hasNext ||
      (oldestEvent && oldestEvent.timestamp < startTimestamp)
    ) {
      hasMore = false;
    } else {
      page++;
    }

    if (page > 100) {
      hasMore = false;
    }
  }

  return allEvents;
}

export async function fetchAllTransactionsInRange(
  address: string,
  dateRange: DateRange,
  onProgress?: (progress: ExportProgress) => void,
): Promise<Transaction[]> {
  const allTransactions: Transaction[] = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;
  const startTimestamp = Math.floor(dateRange.start.getTime() / 1000);
  const endTimestamp = Math.floor(dateRange.end.getTime() / 1000);

  while (hasMore) {
    onProgress?.({
      phase: "fetching",
      current: allTransactions.length,
      total: -1,
      message: `Fetching transactions page ${page}...`,
    });

    const response = await fetchAddressTransactions(address, page, perPage);

    const filteredTx = response.data.filter(
      (tx) => tx.timestamp >= startTimestamp && tx.timestamp <= endTimestamp,
    );
    allTransactions.push(...filteredTx);

    const oldestTx = response.data[response.data.length - 1];
    if (
      !response.pagination.hasNext ||
      (oldestTx && oldestTx.timestamp < startTimestamp)
    ) {
      hasMore = false;
    } else {
      page++;
    }

    if (page > 100) {
      hasMore = false;
    }
  }

  return allTransactions;
}
