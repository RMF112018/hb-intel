# PH7-SF-12: `@hbc/session-state` — Offline-Safe Session Persistence & Sync

**Priority Tier:** 2 — Application Layer (required before any offline-capable feature)
**Package:** `packages/session-state/`
**Interview Decision:** Q21 — Option B confirmed
**Mold Breaker Source:** UX-MB §5 (Offline-Safe Workflows); ux-mold-breaker.md Signature Solution #5; con-tech-ux-study §10.4 (Form State Preservation — highest-impact PWA opportunity)

---

## Problem Solved

Construction work happens in environments where connectivity is unreliable: trailers with spotty WiFi, underground floors during construction, remote sites with no cellular signal. Current construction platforms handle connectivity loss in one of two ways:
1. **Fail completely** — user sees an error screen; all unsaved work is lost
2. **Block silently** — the UI appears to work but nothing is actually saved; user discovers the loss later

Both approaches destroy user trust and create rework. The con-tech UX study §10.4 identifies form state preservation as "the single highest-impact PWA opportunity" — the gap between current platform behavior and user expectation is widest here.

`@hbc/session-state` provides a unified IndexedDB-based persistence layer that:
- Preserves form draft state across tab closes, browser refreshes, and connectivity loss
- Queues pending mutations (acknowledgments, uploads, field saves) for execution when connectivity returns
- Surfaces connectivity status to all components via a shared context
- Syncs queued operations transparently on reconnect

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #5 (Offline-Safe Workflows) specifies: "Every form auto-saves drafts. Every pending action queues offline. Reconnect triggers transparent sync — no user action required." Operating Principle §7.4 (Offline-safe by default) requires that all three guarantees hold across every module.

This is a platform-wide primitive because every module's forms, uploads, and acknowledgments need these guarantees. Without a shared package, each module independently implements offline handling — creating inconsistent behavior, duplicated IndexedDB schemas, and synchronization conflicts.

---

## Applicable Features

| Feature | Session State Use |
|---|---|
| PH9b `useFormDraft` | Form field values persisted to IndexedDB; restored on remount |
| `@hbc/sharepoint-docs` | Pending uploads queued offline; retried on reconnect |
| `@hbc/acknowledgment` | Pending acknowledgment actions queued offline |
| `@hbc/step-wizard` | Step completion state persisted across sessions |
| `@hbc/workflow-handoff` | Handoff composer draft persisted |
| `@hbc/notification-intelligence` | Pending notification reads/dismissals queued |
| All modules | Connectivity state surfaced for conditional rendering |

---

## Interface Contract

```typescript
// packages/session-state/src/types/ISessionState.ts

export type ConnectivityStatus = 'online' | 'offline' | 'degraded';
export type QueuedOperationType = 'upload' | 'acknowledgment' | 'form-save' | 'api-mutation' | 'notification-action';

export interface IQueuedOperation {
  operationId: string;
  type: QueuedOperationType;
  /** API endpoint or function identifier */
  target: string;
  /** Serialized payload */
  payload: unknown;
  /** Number of retry attempts made */
  retryCount: number;
  /** Max retries before marking as failed */
  maxRetries: number;
  createdAt: string; // ISO 8601
  lastAttemptAt: string | null;
  /** Error from last failed attempt */
  lastError: string | null;
}

export interface IDraftEntry {
  draftKey: string;
  /** Serialized form state */
  value: unknown;
  savedAt: string; // ISO 8601
  /** TTL in hours; draft auto-expires after this time */
  ttlHours: number;
}

export interface ISessionStateContext {
  connectivity: ConnectivityStatus;
  queuedOperations: IQueuedOperation[];
  pendingCount: number;
  /** Manually trigger a sync attempt */
  triggerSync: () => Promise<void>;
  /** Save a draft value */
  saveDraft: (key: string, value: unknown, ttlHours?: number) => void;
  /** Load a draft value */
  loadDraft: <T>(key: string) => T | null;
  /** Clear a draft */
  clearDraft: (key: string) => void;
  /** Queue an operation for offline execution */
  queueOperation: (operation: Omit<IQueuedOperation, 'operationId' | 'retryCount' | 'createdAt' | 'lastAttemptAt' | 'lastError'>) => void;
}
```

---

## Package Architecture

```
packages/session-state/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISessionState.ts
│   │   └── index.ts
│   ├── db/
│   │   ├── SessionDb.ts                  # IndexedDB schema + connection manager
│   │   ├── DraftStore.ts                 # read/write/expire draft entries
│   │   └── QueueStore.ts                 # read/write/retry queued operations
│   ├── sync/
│   │   └── SyncEngine.ts                 # Background Sync API + retry logic
│   ├── context/
│   │   ├── SessionStateContext.ts        # React context
│   │   └── SessionStateProvider.tsx      # Root provider; manages connectivity detection
│   ├── hooks/
│   │   ├── useSessionState.ts            # Access full context
│   │   ├── useDraft.ts                   # Draft-specific hook (key, value, save, clear)
│   │   └── useConnectivity.ts            # Connectivity status only
│   └── components/
│       ├── HbcConnectivityBar.tsx        # Global offline/degraded status bar
│       ├── HbcSyncStatusBadge.tsx        # Pending ops count badge
│       └── index.ts
```

---

## Component Specifications

### `HbcConnectivityBar` — Global Connectivity Status

```typescript
interface HbcConnectivityBarProps {
  /** Whether to show the bar even when online (for transparency) */
  showWhenOnline?: boolean;
}
```

**Visual behavior:**
- **Online**: hidden (unless `showWhenOnline`)
- **Degraded** (requests succeeding slowly): amber bar — "Slow connection detected. Changes are being saved."
- **Offline**: red bar — "You're offline. Changes are queued and will sync when reconnected."
- On reconnect: brief green confirmation — "Back online. Syncing N changes..." → auto-dismisses

### `HbcSyncStatusBadge` — Queued Operation Count

```typescript
interface HbcSyncStatusBadgeProps {
  showWhenEmpty?: boolean;
}
```

**Visual behavior:**
- Shows count of pending queued operations
- Amber when >0; green with checkmark when 0 (if `showWhenEmpty`)
- Clicking opens a popover showing queued operation details

---

## IndexedDB Schema

**Object Store: `drafts`**
| Key | Type | Description |
|---|---|---|
| `draftKey` | String (PK) | Unique draft identifier (e.g., `scorecard-form-${id}`) |
| `value` | Any | Serialized form state |
| `savedAt` | ISO string | Timestamp |
| `expiresAt` | ISO string | Auto-computed from TTL |

**Object Store: `queue`**
| Key | Type | Description |
|---|---|---|
| `operationId` | UUID (PK) | Unique operation ID |
| `type` | String | Operation type |
| `target` | String | API endpoint |
| `payload` | Any | Serialized request body |
| `retryCount` | Number | Current retry count |
| `maxRetries` | Number | Max allowed retries |
| `createdAt` | ISO string | Queue entry timestamp |
| `lastAttemptAt` | ISO string | Last retry attempt |
| `lastError` | String | Last error message |

---

## Auto-Save Integration (PH9b)

`@hbc/session-state` is the storage layer for PH9b's `useFormDraft` auto-save system:

```typescript
// PH9b useFormDraft uses useDraft under the hood
import { useDraft } from '@hbc/session-state';

function useFormDraft<T>(draftKey: string, initialValues: T) {
  const { value: savedDraft, save, clear } = useDraft<T>(draftKey);
  const [formValues, setFormValues] = useState(savedDraft ?? initialValues);

  const handleChange = (newValues: T) => {
    setFormValues(newValues);
    save(newValues); // auto-save on every change
  };

  return { formValues, handleChange, clearDraft: clear };
}
```

---

## Offline Queue Execution

The `SyncEngine` uses the Service Worker Background Sync API (PWA) or polling (SPFx fallback):

```typescript
// When connectivity returns, SyncEngine processes the queue:
// 1. Load all queued operations ordered by createdAt
// 2. For each operation: execute the target API call with the payload
// 3. On success: remove from queue
// 4. On failure: increment retryCount; if maxRetries exceeded, mark as failed + notify user
// 5. Failed operations surfaced in HbcSyncStatusBadge with manual retry option
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/sharepoint-docs` | Upload queue managed via `queueOperation({ type: 'upload', ... })` |
| `@hbc/acknowledgment` | Acknowledgment actions queued offline |
| `@hbc/step-wizard` | Step completion state persisted via `draftKey` |
| `@hbc/workflow-handoff` | Handoff composer draft persisted via `saveDraft` |
| `@hbc/notification-intelligence` | Read/dismiss actions queued when offline |
| PH9b `useFormDraft` | Direct dependency — session state IS the form draft storage layer |
| All components | `HbcConnectivityBar` mounted at app root; visible platform-wide |

---

## SPFx Constraints

- IndexedDB available in SPFx webpart context (modern browsers)
- Background Sync API not available in SPFx — use polling every 30 seconds on reconnect detection instead
- `SessionStateProvider` mounted at SPFx Application Customizer level for cross-webpart share

---

## Priority & ROI

**Priority:** P1 — Required before any offline-capable feature can ship; without it, connectivity loss creates data loss
**Estimated build effort:** 4–5 sprint-weeks (IndexedDB schema, sync engine, provider, two components, Background Sync integration)
**ROI:** Eliminates the #1 trust-destroying event in field usage (data loss on connectivity interruption); enables the "offline-safe by default" mold breaker principle across all modules

---

## Definition of Done

- [ ] IndexedDB schema: `drafts` and `queue` object stores with correct indexes
- [ ] `DraftStore`: save, load, clear, TTL expiry implemented
- [ ] `QueueStore`: enqueue, dequeue, increment-retry, mark-failed implemented
- [ ] `SyncEngine`: Background Sync API (PWA) + polling fallback (SPFx)
- [ ] `SessionStateProvider` detects connectivity via `navigator.onLine` + fetch probe
- [ ] `useSessionState` exposes full context
- [ ] `useDraft<T>` exposes `value`, `save`, `clear` with type safety
- [ ] `useConnectivity` returns `connectivity` status
- [ ] `HbcConnectivityBar` renders offline/degraded/reconnected states
- [ ] `HbcSyncStatusBadge` renders pending operation count
- [ ] `@hbc/sharepoint-docs` upload queue integration verified
- [ ] `@hbc/acknowledgment` offline queue integration verified
- [ ] PH9b `useFormDraft` implemented using `useDraft`
- [ ] TTL-based draft expiry: expired drafts auto-purged on provider mount
- [ ] Unit tests ≥95% on sync engine retry logic and draft TTL expiry
- [ ] E2E test: go offline → fill form → close tab → reopen → draft restored → come online → data synced

---

## ADR Reference

Create `docs/architecture/adr/0021-session-state-offline-persistence.md` documenting the IndexedDB schema, the Background Sync API strategy, the SPFx polling fallback, and the TTL-based draft expiry model.
