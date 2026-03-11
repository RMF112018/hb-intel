# SF12-T03 — IndexedDB and Stores: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-01, D-02, D-05
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF12-T03 data-store task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Implement IndexedDB connection and two canonical stores: `DraftStore` and `QueueStore`.

---

## `SessionDb`

- Creates DB `hbc-session-state` (versioned).
- Creates object stores:
  - `drafts` keyed by `draftKey`
  - `queue` keyed by `operationId`
- Adds indexes:
  - `drafts.expiresAt`
  - `queue.createdAt`
  - `queue.retryCount`

---

## `DraftStore`

Required operations:

- `saveDraft(draftKey, value, ttlHours)`
- `loadDraft<T>(draftKey)`
- `clearDraft(draftKey)`
- `purgeExpiredDrafts(nowIso)`

Behavior:

- `expiresAt` computed from `savedAt + ttlHours`.
- expired draft read returns `null` and schedules cleanup.

---

## `QueueStore`

Required operations:

- `enqueue(operation)`
- `listPending()` sorted by `createdAt ASC`
- `markAttempt(operationId, error?)`
- `remove(operationId)`
- `markFailed(operationId, lastError)`

Behavior:

- respects `maxRetries`
- failed items remain queryable for UI surfacing/manual retry

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state test -- SessionDb DraftStore QueueStore
pnpm --filter @hbc/session-state check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T03 completed: 2026-03-11
- SessionDb: idb-based lazy singleton connection manager with typed SessionDbSchema
- DraftStore: saveDraft, loadDraft (with TTL expiry check), clearDraft, purgeExpiredDrafts (cursor-based range purge)
- QueueStore: enqueue (crypto.randomUUID), listPending (sorted by createdAt ASC), markAttempt, remove, markFailed
- IDraftEntryRecord extends IDraftEntry with computed expiresAt for index-based purge
- EnqueueInput type for consumer-friendly queue API
- All functions return safe defaults (null/[]) when IDB unavailable; no throws to consumers
- 39 tests across 4 test files (SessionDb, DraftStore, QueueStore, db-unavailable), 100% coverage
- Barrel exports wired: db/index.ts → src/index.ts (with removeOperation alias for remove)
- Dependencies: idb ^8.0.3 (runtime), fake-indexeddb ^6.2.5 (devDep)
- Verification: check-types zero errors, build compiles, test:coverage 100%
Next: SF12-T04 (Sync Engine & Connectivity)
-->
