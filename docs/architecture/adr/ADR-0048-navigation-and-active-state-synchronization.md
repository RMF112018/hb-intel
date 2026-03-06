# ADR-0048: Navigation and Active State Synchronization (Phase 4b.14)

**Status:** Accepted  
**Date:** 2026-03-06  
**Phase:** Phase 4b.14  
**Deciders:** HB Intel Engineering Team  
**References:**
- PH4B.14-C-UI-Design-Plan.md §5 (CF-005)
- PH4B-C-UI-Design-Plan.md (D-04, §11 Remediation Gates)
- PH4B-UI-Design-Plan.md v1.2 (binding baseline D-01 through D-10)
- HB-Intel-Blueprint-V4.md §1d

## Context

CF-005 identified a synchronization gap: active navigation state was being inferred ad hoc in PWA route rendering instead of being mechanically owned by route location updates. This created risk for drift between deep links, nested routes, and browser back/forward transitions.

Binding decision D-04 requires active state to be derived automatically from TanStack Router location changes.

## Decision

Phase 4b.14 centralizes route-authoritative navigation synchronization in `navStore` and wires shell consumers to that store state.

1. `packages/shell/src/stores/navStore.ts` now includes:
   - `resolveNavRouteState(pathname)` canonical mapping logic,
   - `syncFromPathname(pathname)` route-to-store state projection,
   - `startNavSync(history)` / `stopNavSync()` lifecycle controls for TanStack history subscription.
2. PWA root route (`apps/pwa/src/router/root-route.tsx`) starts/stops synchronization by subscribing `navStore` to `router.history`.
3. `HbcAppShell` now defaults sidebar/bottom-nav active item resolution to synchronized `useNavStore().activeItemId` when explicit prop value is not provided.
4. `WorkspacePageShell` reads synchronized workspace context for route-aware shell telemetry and removes reliance on page-level active state ownership.

## Verification Evidence (2026-03-06)

- Unit tests: `pnpm --filter @hbc/shell test` (5/5 passing), including:
  - initial route sync,
  - route change sync,
  - back/forward transition sync,
  - subscription cleanup behavior.
- Storybook: `HbcAppShell.stories.tsx` includes `Router Back/Forward Sync` deterministic scenario with store-driven active updates.
- Workspace gates:
  - `pnpm turbo run build`: pass
  - `pnpm turbo run lint`: pass (warnings only, no lint errors)
  - `pnpm turbo run check-types`: pass
  - `pnpm --filter @hbc/ui-kit build-storybook`: pass
  - `pnpm --filter @hbc/ui-kit test-storybook --url http://127.0.0.1:6008`: pass (54 suites, 364 tests)
  - `pnpm e2e`: pass (25 passed, 4 skipped)

## Consequences

- Active shell navigation state is now mechanically derived from router location, including deep links and browser history traversal.
- Subscription lifecycle is explicit and testable, reducing duplicate-subscription risk during hot reload and story/test runs.
- CF-005 is closed in remediation tracking while preserving backward compatibility for existing `useNavStore` consumers.
