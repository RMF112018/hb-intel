# SF12-T04 — Sync Engine and Connectivity: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-02, D-03, D-04
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF12-T04 sync/connectivity task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Implement connectivity detection and queue sync orchestration for PWA and SPFx environments.

---

## Connectivity Model

- `online`: browser online + probe succeeds within threshold.
- `offline`: browser offline or probe fails.
- `degraded`: browser online but probe latency exceeds threshold.

Probe source: lightweight app health endpoint or equivalent internal endpoint.

---

## SyncEngine Contract

```typescript
interface ISyncEngine {
  triggerSync(): Promise<void>;
  registerBackgroundSync?(): Promise<void>;
  processQueue(): Promise<void>;
}
```

---

## Processing Rules

1. Fetch pending queue ordered by `createdAt`.
2. Execute each target operation.
3. On success: remove item.
4. On failure: increment retry and set `lastError`.
5. If `retryCount >= maxRetries`: mark failed, stop auto-retrying item.

Backoff: exponential (bounded) per item.

---

## Platform Strategy

- PWA: use Background Sync API when available.
- SPFx: fallback polling every `SPFX_SYNC_POLL_INTERVAL_MS` when back online.

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state test -- SyncEngine
pnpm --filter @hbc/session-state check-types
```
