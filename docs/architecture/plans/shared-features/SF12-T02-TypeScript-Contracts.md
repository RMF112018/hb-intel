# SF12-T02 — TypeScript Contracts: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-02, D-03, D-06, D-07, D-10
**Estimated Effort:** 0.4 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF12-T02 contracts task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Define all public types/interfaces for connectivity, drafts, queue operations, provider context, hook results, and defaults.

---

## Contracts (`src/types/ISessionState.ts`)

```typescript
export type ConnectivityStatus = 'online' | 'offline' | 'degraded';

export type QueuedOperationType =
  | 'upload'
  | 'acknowledgment'
  | 'form-save'
  | 'api-mutation'
  | 'notification-action';

export interface IQueuedOperation {
  operationId: string;
  type: QueuedOperationType;
  target: string;
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  lastAttemptAt: string | null;
  lastError: string | null;
}

export interface IDraftEntry {
  draftKey: string;
  value: unknown;
  savedAt: string;
  ttlHours: number;
}

export interface ISessionStateContext {
  connectivity: ConnectivityStatus;
  queuedOperations: IQueuedOperation[];
  pendingCount: number;
  triggerSync: () => Promise<void>;
  saveDraft: (key: string, value: unknown, ttlHours?: number) => void;
  loadDraft: <T>(key: string) => T | null;
  clearDraft: (key: string) => void;
  queueOperation: (
    operation: Omit<
      IQueuedOperation,
      'operationId' | 'retryCount' | 'createdAt' | 'lastAttemptAt' | 'lastError'
    >
  ) => void;
}

export interface IUseDraftResult<T> {
  value: T | null;
  save: (value: T, ttlHours?: number) => void;
  clear: () => void;
}
```

---

## Constants (`src/constants/sessionStateDefaults.ts`)

```typescript
export const SESSION_DB_NAME = 'hbc-session-state';
export const SESSION_DB_VERSION = 1;
export const DRAFT_STORE_NAME = 'drafts';
export const QUEUE_STORE_NAME = 'queue';
export const DRAFT_DEFAULT_TTL_HOURS = 72;
export const QUEUE_DEFAULT_MAX_RETRIES = 5;
export const SPFX_SYNC_POLL_INTERVAL_MS = 30_000;
```

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state check-types
pnpm --filter @hbc/session-state build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T02 completed: 2026-03-11
- ISessionState.ts: ConnectivityStatus, QueuedOperationType, IQueuedOperation, IDraftEntry, ISessionStateContext, IUseDraftResult<T>
- sessionStateDefaults.ts: SESSION_DB_NAME, SESSION_DB_VERSION, DRAFT_STORE_NAME, QUEUE_STORE_NAME, DRAFT_DEFAULT_TTL_HOURS, QUEUE_DEFAULT_MAX_RETRIES, SPFX_SYNC_POLL_INTERVAL_MS
- Barrel exports wired: types/index.ts, constants/index.ts, src/index.ts
- Testing factories tightened: createMockQueuedOperation, createMockDraftEntry, createMockSessionContext typed with proper interfaces; mockConnectivityStates typed as readonly ConnectivityStatus[]
- Verification: check-types zero errors, build compiles to dist/
-->
