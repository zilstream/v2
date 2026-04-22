export type WatchlistKind = "token" | "pair";

export interface WatchlistState {
  tokens: string[];
  pairs: string[];
}

const STORAGE_KEY = "zilstream_watchlist";

const EMPTY_STATE: WatchlistState = { tokens: [], pairs: [] };

function normalize(address: string): string {
  return address.toLowerCase();
}

export function loadWatchlist(): WatchlistState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_STATE;
    const parsed = JSON.parse(stored) as Partial<WatchlistState>;
    return {
      tokens: Array.isArray(parsed.tokens) ? parsed.tokens.map(normalize) : [],
      pairs: Array.isArray(parsed.pairs) ? parsed.pairs.map(normalize) : [],
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveWatchlist(state: WatchlistState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export function isInWatchlist(
  state: WatchlistState,
  kind: WatchlistKind,
  address: string,
): boolean {
  const list = kind === "token" ? state.tokens : state.pairs;
  return list.includes(normalize(address));
}

export function toggleWatchlistEntry(
  state: WatchlistState,
  kind: WatchlistKind,
  address: string,
): WatchlistState {
  const normalized = normalize(address);
  const key = kind === "token" ? "tokens" : "pairs";
  const list = state[key];
  const next = list.includes(normalized)
    ? list.filter((item) => item !== normalized)
    : [...list, normalized];
  return { ...state, [key]: next };
}
