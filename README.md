# ZilStream V2

ZilStream V2 is an early preview of the refreshed liquidity explorer for the Zilliqa 2.0 ecosystem. It highlights EVM-first pools, token metrics, and recent on-chain activity while the broader V2 experience is still in active development. Use it to understand where capital is flowing as the network transitions to its new architecture.

## Highlights

- **Live market tables** for tokens and pairs sourced from the v2 ZilStream data service.
- **Pair drill-down pages** with token logos, human-readable amounts, and direct transaction links on OtterScan.
- **Fresh homepage experience** featuring high-level liquidity stats, trending pools, and calls to action tailored to Zilliqa 2.0.
- **Shared ShadCN components** (tables, cards, tooltips, badges) to keep the UI consistent as features evolve.

## Getting Started

This project uses [Bun](https://bun.sh) for dependency management and scripts.

```bash
bun install
bun run dev
```

The development server defaults to <http://localhost:3000>. Data is fetched directly from the public `api-v2.zilstream.com` endpoints, so an internet connection is required.

## Available Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `bun run dev`    | Starts the local development server.             |
| `bun run build`  | Creates an optimized production build.           |
| `bun run start`  | Serves the production build locally.             |
| `bun run lint`   | Runs Biome formatting & lint checks (read-only). |
| `bun run format` | Applies Biome formatting fixes.                  |

## Project Layout

```
src/
  app/                Application routes (tokens, pairs, events, home)
  components/         ShadCN UI primitives and shared widgets
  lib/                Fetch helpers, formatting utilities, token helpers
public/               Logos, favicons, and other static assets
```

Key routes include:

- `/` – Highlights ZilStream V2 positioning, liquidity snapshot, and top markets.
- `/tokens` – Token directory with pricing, decimals, and volume data.
- `/pairs` – Liquidity pairs with protocol tags, USD metrics, and event links.
- `/pairs/[address]/events` – Event timeline showing swaps/mints/burns with decimals-aware amounts and OtterScan references.

## Contributing & Preview Status

This UI is an evolving preview and will continue to change rapidly. Feedback, bug reports, and ideas are welcome—please open an issue or reach out directly to the ZilStream team so we can shape V2 together.
