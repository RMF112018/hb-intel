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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF12-T08 completed: 2026-03-11

Factory defaults aligned to T08 plan signatures:
- createMockQueuedOperation: operationId→'op-001', type→'api-mutation', target→'/api/example', payload→{ id: 'abc' }
- createMockDraftEntry: draftKey→'form:001', value→{ name: 'Demo' }, savedAt→'2026-03-10T12:00:00Z'
- createMockSessionContext: triggerSync cosmetic alignment (async () => {})
- mockConnectivityStates: already matched — no changes

Storybook configuration added:
- .storybook/main.ts: @storybook/react-vite, essentials, a11y addons
- .storybook/preview.ts: minimal preview (inline styles, no theme provider)
- package.json: storybook ^8.6.0 devDependencies + scripts (port 6008)

Stories created (10 total):
- HbcConnectivityBar.stories.tsx: Online, OnlineVisible, Offline, Degraded, Syncing (5 stories)
- HbcSyncStatusBadge.stories.tsx: Synced, PendingOperations, ManyPending, Offline, DetailExpanded (5 stories)

Pre-existing fixes:
- .eslintrc.cjs created (was missing — lint gate could not run)
- Removed stale eslint-disable react-hooks/exhaustive-deps comment (plugin not installed)

Verification:
- build: zero errors ✓
- lint: zero errors (1 pre-existing warning) ✓
- check-types: zero errors ✓
- test: 91/91 pass ✓
- coverage: 98.83% stmts, 97.77% branches, 95.55% functions ✓
- consuming packages: sharepoint-docs (74), acknowledgment (104), workflow-handoff (113), query-hooks (8) — all pass ✓

Playwright e2e deferred to T09/post-MVP (requires full app with SessionStateProvider mounted)
Next: SF12-T09 (Testing & Deployment)
-->
