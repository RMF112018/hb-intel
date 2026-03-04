# ADR-0014: Query Hooks Comprehensive Rebuild

**Status:** Accepted
**Date:** 2026-03-03
**Deciders:** HB Intel Architecture Team
**Phase:** 3.1
**References:** Blueprint §1c, §2g, §2e; PH3-Query-State-Mngmt-Plan §3.1 Option C

## Context

Phase 2.3 created a minimal `@hbc/query-hooks` (v0.0.1) with 5/11 domains, monolithic domain files, no optimistic updates, no Zustand stores, and no `useRepository` hook. The 6 remaining domains lacked query hooks entirely. Scorecard and Project domains used placeholder stubs since their factory functions hadn't been exported yet.

## Decision

Rebuild `@hbc/query-hooks` comprehensively per Option C:

1. **Per-file hook structure** — Each hook in its own file with domain barrel re-exports
2. **createQueryKeys helper** — Consistent key factory with static `all` array (backward compatible)
3. **useOptimisticMutation** — Generic helper handling cancel → snapshot → rollback → invalidate
4. **useRepository** — Type-safe generic hook mapping 11 domain keys to port interfaces with DI support
5. **11 domain coverage** — 66 hooks total covering all port interface methods
6. **Zustand stores** — `useUiStore`, `useFilterStore`, `useFormDraftStore` for client state
7. **Backward compatibility** — All 27 existing hook names/signatures preserved, `defaultQueryOptions`/`defaultMutationOptions` remain flat objects

## Consequences

### Positive
- All 11 `@hbc/data-access` domains have corresponding query hooks
- Optimistic updates provide instant UI feedback with automatic rollback
- `useRepository` decouples hooks from specific adapters, enabling test DI
- Per-file structure improves tree-shaking and code navigation
- Zustand stores separate server state (TanStack Query) from client state (Zustand)

### Negative
- ~120 files total — larger package surface area
- Zustand added as dependency (justified by matching @hbc/auth and @hbc/shell patterns)

### Risks
- Downstream consumers must be updated to import new hooks (non-breaking — additive only)
