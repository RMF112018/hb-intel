# SF12-T08 — Testing Strategy: `@hbc/session-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-12-Shared-Feature-Session-State.md`
**Decisions Applied:** D-02, D-04, D-05, D-10
**Estimated Effort:** 0.45 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF12-T08 testing strategy task; sub-plan of `SF12-Session-State.md`.

---

## Objective

Define fixtures and tests for stores, sync engine, provider/hooks, UI components, and end-to-end reconnect flows.

---

## Testing Sub-Path

### `testing/createMockQueuedOperation.ts`

```typescript
export function createMockQueuedOperation(
  overrides: Partial<IQueuedOperation> = {}
): IQueuedOperation {
  return {
    operationId: 'op-001',
    type: 'api-mutation',
    target: '/api/example',
    payload: { id: 'abc' },
    retryCount: 0,
    maxRetries: 5,
    createdAt: '2026-03-10T12:00:00Z',
    lastAttemptAt: null,
    lastError: null,
    ...overrides,
  };
}
```

### `testing/createMockDraftEntry.ts`

```typescript
export function createMockDraftEntry(
  overrides: Partial<IDraftEntry> = {}
): IDraftEntry {
  return {
    draftKey: 'form:001',
    value: { name: 'Demo' },
    savedAt: '2026-03-10T12:00:00Z',
    ttlHours: 72,
    ...overrides,
  };
}
```

### `testing/createMockSessionContext.ts`

```typescript
export function createMockSessionContext(
  overrides: Partial<ISessionStateContext> = {}
): ISessionStateContext {
  return {
    connectivity: 'online',
    queuedOperations: [],
    pendingCount: 0,
    triggerSync: async () => {},
    saveDraft: () => {},
    loadDraft: () => null,
    clearDraft: () => {},
    queueOperation: () => {},
    ...overrides,
  };
}
```

### `testing/mockConnectivityStates.ts`

```typescript
export const mockConnectivityStates: ConnectivityStatus[] = [
  'online',
  'offline',
  'degraded',
];
```

---

## Required Test Coverage

- IndexedDB stores: save/load/clear/expire/enqueue/retry/fail paths
- SyncEngine: reconnect processing and retry ceiling behavior
- Provider/hooks: connectivity transitions and pending count updates
- Components: all connectivity states and badge detail behavior
- Storybook: states for online/offline/degraded + pending operations
- Playwright: offline draft restore + reconnect queue sync end-to-end

---

## Verification Commands

```bash
pnpm --filter @hbc/session-state test --coverage
pnpm --filter @hbc/session-state storybook
pnpm exec playwright test --grep "session-state"
```
