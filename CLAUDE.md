# Repository Guidelines

## Project Structure & Module Organization
The app follows the Next.js App Router. Route entries, layouts, and server components live in `src/app`; group related screens under folders such as `src/app/(feature)` or `src/app/components`. Tailwind CSS v4 utilities are configured in `postcss.config.mjs` and pulled into `src/app/globals.css`. ShadCN UI primitives should stay in `src/components/ui` with any project-specific wrappers beside their consumers. Shared assets belong in `public`, while type checking and lint/format rules are centralized in `tsconfig.json` and `biome.json`—update those files when project-wide standards change.

## Build, Test, and Development Commands
Install dependencies with `bun install` to stay aligned with `bun.lock`. Start the development server via `bun run dev`, which uses Turbopack on port 3000. Produce an optimized build with `bun run build`, and preview it locally with `bun run start`. Run `bun run lint` before submitting changes; if formatting drifts, apply `bun run format`.

## Coding Style & Naming Conventions
Code is TypeScript-first with 2-space indentation enforced by Biome. Use PascalCase for React components (`HomePage`), camelCase for variables, hooks, and helper functions, and UPPER_SNAKE_CASE only for exported constants. Co-locate feature-specific modules beneath their route folder and keep imports path-relative to avoid brittle aliases. Tailwind v4 utilities are available—order classes from layout → spacing → color to aid scanning—and prefer ShadCN component slots over ad-hoc DOM when an existing primitive fits.

## Testing Guidelines
Automated tests are not configured yet. When introducing a test harness (e.g., Vitest or Playwright), document the new scripts and wire them through `bun run`. Until then, include manual verification steps in every PR and avoid merging without checking the home route render, navigation behavior, and asset loading. Add smoke tests alongside any new critical feature once tooling is in place.

## Commit & Pull Request Guidelines
Write concise, imperative commit subjects similar to the existing history (e.g., `Add staking rewards table`), and reference related issues in the body using `#123`. Keep changes focused per commit. Pull requests should summarize intent, list QA steps or commands executed, and attach screenshots or recordings for UI updates. Ensure linting and builds pass locally before requesting review.
