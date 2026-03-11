# SF12-T05 — SessionStateProvider and Hooks: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-05, D-06, D-07
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan — SF12-T05 provider/hooks task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Implement provider context wiring and hook-level consumption contracts for drafts, connectivity, and sync actions.

---

## Provider

**File:** `src/context/SessionStateProvider.tsx`

Responsibilities:

- initialize DB and stores
- initialize SyncEngine
- detect connectivity changes
- expose context methods and state
- purge expired drafts on mount

---

## Hooks

### `useSessionState`
- returns full `ISessionStateContext`
- throws descriptive error if used outside provider

### `useDraft<T>(draftKey: string, ttlHours?: number)`
- loads draft on mount
- exposes `save(value, ttl?)`, `clear()`
- returns typed draft value

### `useConnectivity`
- returns current `ConnectivityStatus`
- no write operations

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state test -- SessionStateProvider useDraft useConnectivity
pnpm --filter @hbc/session-state check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T05 completed: 2026-03-11
- SessionStateContext.ts: createContext with null default, displayName set
- SessionStateProvider.tsx: mounts SyncEngine + ConnectivityMonitor, purgeExpiredDrafts on mount, memoized context value with triggerSync/saveDraft/loadDraft(sync null)/clearDraft/queueOperation
- useSessionState.ts: throws if outside provider
- useDraft.ts: async loadDraft on mount + draftKey change, save/clear with local state sync
- useConnectivity.ts: thin selector from context
- Barrel exports updated: context/index.ts, hooks/index.ts, src/index.ts
- vitest.config.ts: removed context/** and hooks/** from coverage exclusions
- 14 tests in SessionStateProvider.test.tsx; 77 total tests pass
- Coverage: 98.5% stmts, 97.35% branches, 95.34% functions
- All gates pass: check-types ✓ | test ✓ | build ✓
-->
