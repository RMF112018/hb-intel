# @hbc/session-state — API Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; developer audience; session-state API reference.

**Package:** `packages/session-state/`
**Locked ADR:** [ADR-0101](../../architecture/adr/ADR-0101-session-state-offline-persistence.md)

---

## Main Exports (`@hbc/session-state`)

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `ConnectivityStatus` | Type | `'online' \| 'offline' \| 'degraded'` — three-state connectivity model (D-03) |
| `QueuedOperationType` | Type | String literal union for operation classification |
| `IQueuedOperation` | Interface | `{ id, type, payload, retryCount, maxRetries, createdAt, lastAttemptAt?, failedAt? }` — queue entry with retry lifecycle (D-02) |
| `IDraftEntry` | Interface | `{ key, data, expiresAt, updatedAt }` — draft with TTL expiration (D-05) |
| `ISessionStateContext` | Interface | Provider context value: `{ connectivity, queueOperation, pendingOperations, syncStatus, db }` |
| `IUseDraftResult<T>` | Interface | `{ value: T \| undefined; save(data: T): Promise<void>; clear(): Promise<void> }` — useDraft return type |
| `OperationExecutor` | Type | `(operation: IQueuedOperation) => Promise<void>` — consumer-supplied queue processor |
| `ISyncEngine` | Interface | Sync engine contract: `processQueue`, `triggerSync`, `startPolling`, `stopPolling`, `dispose` |
| `ISyncEngineOptions` | Interface | `{ executor, db, pollIntervalMs?, backoffBaseMs?, backoffMaxMs? }` |
| `IDraftEntryRecord` | Interface | IndexedDB record shape for the `drafts` object store |
| `SessionDbSchema` | Type | `idb` database schema for `drafts` and `queue` stores (D-01) |
| `EnqueueInput` | Interface | `{ type, payload, maxRetries? }` — input for `enqueue()` |
| `IConnectivityMonitor` | Interface | `{ status, subscribe, dispose }` — connectivity monitor contract |
| `ConnectivityListener` | Type | `(status: ConnectivityStatus) => void` — subscription callback |

### Constants

| Export | Kind | Value | Description |
|--------|------|-------|-------------|
| `SESSION_DB_NAME` | Constant | `'hbc-session-state'` | IndexedDB database name |
| `SESSION_DB_VERSION` | Constant | `1` | IndexedDB schema version |
| `DRAFT_STORE_NAME` | Constant | `'drafts'` | Draft object store name (D-01) |
| `QUEUE_STORE_NAME` | Constant | `'queue'` | Queue object store name (D-01) |
| `DRAFT_DEFAULT_TTL_HOURS` | Constant | `24` | Default draft TTL in hours (D-05) |
| `QUEUE_DEFAULT_MAX_RETRIES` | Constant | `5` | Default max retry count per operation (D-02) |
| `SPFX_SYNC_POLL_INTERVAL_MS` | Constant | `30000` | SPFx polling fallback interval (D-04) |
| `SYNC_BACKOFF_BASE_MS` | Constant | `1000` | Exponential backoff base delay |
| `SYNC_BACKOFF_MAX_MS` | Constant | `60000` | Exponential backoff ceiling |
| `CONNECTIVITY_PROBE_TIMEOUT_MS` | Constant | `5000` | Probe request timeout |
| `CONNECTIVITY_PROBE_INTERVAL_MS` | Constant | `10000` | Probe polling interval |

### DB Functions

| Export | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `openSessionDb` | Function | `() => Promise<IDBPDatabase<SessionDbSchema>>` | Opens (or creates) the IndexedDB database |
| `closeSessionDb` | Function | `(db: IDBPDatabase<SessionDbSchema>) => void` | Closes the database connection |
| `saveDraft` | Function | `(db, key: string, data: unknown, ttlHours?: number) => Promise<void>` | Persists a draft entry with TTL |
| `loadDraft` | Function | `(db, key: string) => Promise<unknown \| undefined>` | Loads a draft; returns `undefined` if expired or missing |
| `clearDraft` | Function | `(db, key: string) => Promise<void>` | Removes a draft entry |
| `purgeExpiredDrafts` | Function | `(db) => Promise<number>` | Removes all expired drafts; returns count purged |
| `enqueue` | Function | `(db, input: EnqueueInput) => Promise<IQueuedOperation>` | Adds an operation to the queue |
| `listPending` | Function | `(db) => Promise<IQueuedOperation[]>` | Returns all non-failed pending operations |
| `markAttempt` | Function | `(db, id: string) => Promise<void>` | Increments `retryCount` and updates `lastAttemptAt` |
| `removeOperation` | Function | `(db, id: string) => Promise<void>` | Removes a completed operation |
| `markFailed` | Function | `(db, id: string) => Promise<void>` | Marks an operation as permanently failed |

### Sync

| Export | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `createConnectivityMonitor` | Function | `(probeUrl?: string, probeTimeoutMs?: number) => IConnectivityMonitor` | Creates a connectivity monitor with online/offline/degraded detection and probe-based verification |
| `createSyncEngine` | Function | `(options: ISyncEngineOptions) => ISyncEngine` | Factory for the sync engine |
| `SyncEngine` | Class | `new SyncEngine(options: ISyncEngineOptions)` | Sync engine: processes queue with backoff, supports Background Sync API (PWA) and polling fallback (SPFx) (D-04) |

### Context & Provider

| Export | Kind | Props / Signature | Description |
|--------|------|-------------------|-------------|
| `SessionStateContext` | Context | `React.Context<ISessionStateContext \| null>` | React context for session state |
| `SessionStateProvider` | Component | `SessionStateProviderProps: { children, executor, probeUrl?, pollIntervalMs? }` | Mounts sync engine + connectivity monitor, purges expired drafts, exposes context (D-06) |

### Hooks

| Export | Kind | Params | Returns | Description |
|--------|------|--------|---------|-------------|
| `useSessionState` | Hook | None | `ISessionStateContext` | Consumes `SessionStateContext`; throws if used outside provider (D-07) |
| `useDraft<T>` | Hook | `(draftKey: string, ttlHours?: number)` | `IUseDraftResult<T>` | Async load on mount, save/clear with local state + IndexedDB persistence (D-07) |
| `useConnectivity` | Hook | None | `ConnectivityStatus` | Thin selector returning current connectivity status (D-07) |

### Components

| Export | Kind | Props | Description |
|--------|------|-------|-------------|
| `HbcConnectivityBar` | Component | `HbcConnectivityBarProps: { showWhenOnline?: boolean }` | Status banner: online/offline/degraded/syncing; `role="status"` + `aria-live="polite"`; inline CSS (D-08) |
| `HbcSyncStatusBadge` | Component | `HbcSyncStatusBadgeProps: {}` | Pending operation count badge with `<details>`/`<summary>` popover; keyboard-focusable (D-08) |

---

## Testing Sub-Path (`@hbc/session-state/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockQueuedOperation(overrides?)` | Factory | Minimal mock `IQueuedOperation` with defaults: type `'save'`, retryCount `0`, maxRetries `5` |
| `createMockDraftEntry(overrides?)` | Factory | Minimal mock `IDraftEntry` with defaults: key `'test-draft'`, 24h TTL |
| `createMockSessionContext(overrides?)` | Factory | Minimal mock `ISessionStateContext` with defaults: connectivity `'online'`, empty pending list |
| `mockConnectivityStates` | Constant | `readonly ['online', 'offline', 'degraded']` — all `ConnectivityStatus` values for parameterized tests |

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.

---

## References

- [ADR-0101 — Session State Offline Persistence Primitive](../../architecture/adr/ADR-0101-session-state-offline-persistence.md)
- [Adoption Guide](../../how-to/developer/session-state-adoption-guide.md)
- [SF12 Master Plan](../../architecture/plans/shared-features/SF12-Session-State.md)
