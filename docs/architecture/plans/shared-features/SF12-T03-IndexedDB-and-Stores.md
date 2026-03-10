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
