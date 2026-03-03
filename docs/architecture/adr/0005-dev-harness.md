# ADR-0005: Dev Harness — Vite SPA for Unified Package Testing

**Status:** Accepted
**Date:** 2026-03-03
**Phase:** 3 (Foundation Plan)
**Blueprint:** §1 (monorepo structure: apps/dev-harness)

## Context

Phases 0–2.6 delivered six shared packages (@hbc/models, @hbc/data-access, @hbc/query-hooks, @hbc/auth, @hbc/shell, @hbc/ui-kit). Without a running application, there is no way to visually verify that these packages integrate correctly. A lightweight development harness is needed for the "first glass on screen" moment.

## Decision

Create `apps/dev-harness` as a **Vite SPA** (not deployed to production) that:

1. **Alias-based HMR**: `vite.config.ts` uses `resolve.alias` to point each `@hbc/*` import directly at the package's `src/` directory. Vite transpiles TypeScript on-the-fly, so editing any package source triggers instant HMR without rebuilding `dist/`.

2. **Compile-time mock injection**: `define: { 'process.env.HBC_ADAPTER_MODE': '"mock"' }` forces mock adapters at module scope. This is critical because `@hbc/query-hooks` creates repositories at module evaluation time (e.g., `const repo = createLeadRepository()` runs before any component mounts).

3. **Synchronous Zustand bootstrap**: `bootstrap.ts` calls `useAuthStore.getState().setUser(...)` imperatively before `createRoot().render()`, ensuring all components see mock data on first render without loading spinners.

4. **React state tabs (no router)**: A simple `useState<TabId>` with Fluent UI `TabList` provides 13-tab navigation. No routing library is needed for flat dev-tool navigation.

5. **Provider hierarchy**: `FluentProvider > QueryClientProvider > HbcErrorBoundary > TabRouter + DevControls + ReactQueryDevtools`.

## Alternatives Considered

- **Storybook-only approach**: Would show components in isolation but not integration between packages (shell + auth + query-hooks together).
- **Next.js dev app**: Heavier than needed for a dev tool; Vite is faster to start and simpler to configure.
- **Vitest integration tests only**: Headless tests miss visual regressions and designer feedback loops.

## Consequences

- Developers can visually verify all 6 packages together with a single `pnpm dev --filter=@hbc/dev-harness` command.
- HMR works across package boundaries (edit shell component → browser updates instantly).
- The ECharts chunk (~1MB) is lazy-loaded via `React.lazy` — acceptable for a dev tool.
- The dev-harness is never deployed; it exists solely in `apps/dev-harness`.
