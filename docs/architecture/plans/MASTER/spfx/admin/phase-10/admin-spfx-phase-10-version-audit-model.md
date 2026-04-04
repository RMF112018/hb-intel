# Phase 10 — Version and Audit Model

**Phase:** 10 — Live Admin-Maintained Standards and Configuration Governance  
**Prompt:** 05  
**Date:** 2026-04-04  
**Status:** Frozen — governs API, UI, and downstream run integration

---

## 1. Version lifecycle

Every live-editable config item follows this lifecycle:

```
(no override) ──publish──▶ v1 (published)
                              │
                              ├──publish──▶ v2 (published) ──…──▶ vN (published)
                              │
                              └──revert──▶ v2 (reverted) ── effective value falls back to code default
                                              │
                                              └──publish──▶ v3 (published) ── re-overrides code default
```

### Rules

- Version numbers are monotonically increasing integers starting at 1.
- Every publish or revert creates a new version. Reverts are not version-deleting — they create a new version with status `reverted` and value `null`.
- There is no draft state in Phase 10. All writes are immediate-publish. Phase 11 may introduce staged/draft semantics for high-risk items.
- A reverted item can be re-published. This creates a new version with status `published`.
- Version history is never pruned or deleted.

---

## 2. Event types

| Event Type | Trigger | Produces Version | Value |
|-----------|---------|-----------------|-------|
| `created` | First publish of an override for this key | Yes (v1) | The new value |
| `updated` | Subsequent publish with a different or identical value | Yes (vN+1) | The new value |
| `reverted` | Revert to code default | Yes (vN+1) | `null` (code default resumes) |

All three event types produce an append-only audit record with full before/after values, actor, timestamp, and reason.

---

## 3. Concurrency rules

### Optimistic concurrency via `expectedVersion`

Every write (publish or revert) requires an `expectedVersion` parameter:

- For **first publish**: `expectedVersion` is `null` (no prior override exists).
- For **updates**: `expectedVersion` must match the current stored version.
- For **reverts**: `expectedVersion` must match the current stored version.

### Rejection behavior

If the stored version does not match `expectedVersion`, the operation is rejected with a `Concurrency conflict` error. The caller must re-read the current state and retry.

### Guarantees

- A live-editable config item cannot silently overwrite a newer value.
- Two concurrent callers targeting the same version: exactly one succeeds, the other receives a concurrency error.
- No distributed locks are required — the version check is sufficient for single-admin operation and safe against concurrent API calls.

---

## 4. Publish/revert semantics

### Publish

1. Caller provides: `key`, `domain`, `value`, `reason`, `expectedVersion`.
2. Service validates concurrency (`expectedVersion` matches current).
3. New version is created with status `published`.
4. Audit event (`created` or `updated`) is appended.
5. Effective value immediately reflects the new override on next resolution call.

### Revert

1. Caller provides: `key`, `reason`, `expectedVersion`.
2. Service validates concurrency.
3. New version is created with status `reverted` and value `null`.
4. Audit event (`reverted`) is appended.
5. Effective value falls back to code default on next resolution call.

### Key invariants

- Publish and revert are symmetric — both create versions and audit records.
- There is no "delete" operation. Revert is the only way to remove an override's effect.
- Reason is always required for publish and revert (enforced by the API layer in Prompt-07).

---

## 5. Diff model

The `IConfigVersionDiff` type provides a stable diff between any two versions:

| Field | Description |
|-------|-------------|
| `fromVersion` | Source version (null = code default) |
| `toVersion` | Target version |
| `fromValue` | Value at source |
| `toValue` | Value at target |
| `unchanged` | Whether values are identical (JSON-stable comparison) |
| `summary` | Human-readable description of the change |
| `actor` | Who created the target version |
| `timestamp` | When the target version was created |
| `reason` | Why the target version was created |

### Diff stability

Diff output is deterministic — calling `diffVersions` with the same inputs always produces the same output. This is guaranteed by JSON-stable comparison (`stableEquals`) and immutable version records.

### Diff use cases

- **API**: Returns diff in response to preview/history requests.
- **UI**: Renders before/after view with change attribution.
- **Audit**: Diff summary included in audit trail display.

---

## 6. Service architecture

```
┌────────────────────────────────┐
│  IConfigVersioningService      │  ← API and UI consume this
│  (config-versioning-service)   │
├────────────────────────────────┤
│  publish()                     │
│  revert()                      │
│  getCurrent()                  │
│  getVersion(key, version)      │
│  getVersionHistory(key)        │
│  diffVersions(key, from, to)   │
└──────────┬─────────────────────┘
           │ delegates to
┌──────────▼─────────────────────┐
│  IConfigOverrideStore          │  ← Persistence layer (P10-04)
│  (config-override-store)       │
├────────────────────────────────┤
│  ConfigOverrides table         │  ← Current state per key
│  ConfigAuditLog table          │  ← Append-only history
└────────────────────────────────┘
```

The versioning service does not own persistence. It delegates all writes and reads to the store and adds structured version retrieval and diff capabilities.

---

## 7. What is intentionally deferred to Phase 11

| Capability | Reason |
|-----------|--------|
| Staged/draft writes with explicit publish gate | Phase 10 uses immediate-publish; Phase 11 adds safety gates for high-risk items |
| Multi-approver publish workflow | Phase 10 is single-admin; Phase 11 adds approval gates |
| Dry-run / blast-radius preview | Phase 10 provides diff; Phase 11 adds impact estimation |
| Rollback orchestration (automated multi-item revert) | Phase 10 supports per-item revert; Phase 11 adds coordinated rollback |
| Conflict resolution beyond optimistic concurrency | Phase 10's version-based concurrency is sufficient for single-admin; Phase 11 may add merge semantics if needed |
| Safety observability and alerting on config changes | Phase 10 produces audit records; Phase 12 wires observability |

---

## 8. Implementation locations

| Artifact | Location |
|---------|----------|
| Version/diff DTOs | `packages/models/src/admin-control-plane/IConfigVersioning.ts` |
| Versioning service | `backend/functions/src/services/admin-control-plane/config-versioning-service.ts` |
| Override store (P10-04) | `backend/functions/src/services/admin-control-plane/config-override-store.ts` |
| Service factory wiring | `backend/functions/src/hosts/admin-control-plane/service-factory.ts` |
| Tests | `backend/functions/src/services/admin-control-plane/__tests__/config-versioning-service.test.ts` |
