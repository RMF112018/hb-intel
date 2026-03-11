# @hbc/session-state

Offline-safe session persistence and sync for HB Intel modules.

## Overview

`@hbc/session-state` provides IndexedDB-backed session persistence, an offline operation queue, draft management with TTL expiration, and connectivity-aware sync — enabling HB Intel modules to function seamlessly in online, offline, and degraded network conditions (D-01, D-04).

The package follows a provider/hooks architecture (D-06, D-07): `SessionStateProvider` mounts at the app root, and three hooks (`useSessionState`, `useDraft<T>`, `useConnectivity`) provide typed access to the full session state surface.

## Quick Start

```tsx
import { SessionStateProvider, useSessionState, useDraft, useConnectivity } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';

// 1. Define an executor for queued operations
const executor: OperationExecutor = async (op) => {
  await MyApi.process(op.type, op.payload);
};

// 2. Wrap your app with the provider
function App() {
  return (
    <SessionStateProvider executor={executor}>
      <MyModule />
    </SessionStateProvider>
  );
}

// 3. Use hooks in your components
function MyModule() {
  const { queueOperation, pendingOperations } = useSessionState();
  const connectivity = useConnectivity();
  const { value, save, clear } = useDraft<{ name: string }>('my-draft');

  return (
    <div>
      <p>Status: {connectivity}</p>
      <p>Pending: {pendingOperations.length}</p>
      <p>Draft: {value?.name ?? 'none'}</p>
    </div>
  );
}
```

## Connectivity States

| State | Description |
|-------|-------------|
| `online` | Full network connectivity; sync active |
| `offline` | No network; operations queued locally |
| `degraded` | Partial connectivity; selective sync with retry (D-03) |

Transitions are detected via a combination of `navigator.onLine` events and active probe-based verification. The `HbcConnectivityBar` component renders a status banner with `aria-live="polite"` accessibility.

## Queue Behavior

Queued operations persist to the IndexedDB `queue` store and are processed on reconnect:

- **Retry:** Exponential backoff with base `SYNC_BACKOFF_BASE_MS` (1s), ceiling `SYNC_BACKOFF_MAX_MS` (60s)
- **Max retries:** `QUEUE_DEFAULT_MAX_RETRIES` (5) per operation (D-02)
- **Failure:** Operations exceeding max retries are marked `failed` and become user-visible
- **Sync trigger:** PWA uses Background Sync API; SPFx uses polling fallback at `SPFX_SYNC_POLL_INTERVAL_MS` (30s) (D-04)

## Draft TTL Behavior

Drafts are persisted to IndexedDB with a configurable TTL (time-to-live). Expired drafts are automatically purged on provider mount and during periodic sweep. Default TTL is 24 hours (D-05). Modules may override TTL per draft key via `useDraft<T>(key, ttlHours)`.

## Exports

| Entry Point | Contents |
|-------------|----------|
| `@hbc/session-state` | Types, constants, DB functions, sync engine, context/provider, hooks, components |
| `@hbc/session-state/testing` | `createMockQueuedOperation`, `createMockDraftEntry`, `createMockSessionContext`, `mockConnectivityStates` |

See the [full API reference](../../docs/reference/session-state/api.md) for complete export tables.

## Architecture Boundaries

- **No direct SharePoint/Graph calls** — all network I/O goes through the `executor` callback supplied by the consuming module.
- **No global state mutation** — session state is scoped to the `SessionStateProvider` context tree.
- **IndexedDB isolation** — each module uses a namespaced draft key to prevent cross-module collisions.
- **No prohibited imports** — `@hbc/session-state` must not import from `packages/features/*`, `@hbc/versioned-record`, or `@hbc/bic-next-move`.
- **App-shell-safe components** — `HbcConnectivityBar` and `HbcSyncStatusBadge` use inline CSS only; no `@hbc/ui-kit` dependency (D-08).
- **Peer dependencies only** — `react` and `react-dom`.

## Related

- [SF12 Master Plan](../../docs/architecture/plans/shared-features/SF12-Session-State.md)
- [SF12-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF12-T09-Testing-and-Deployment.md)
- [ADR-0101 — Session State Offline Persistence](../../docs/architecture/adr/ADR-0101-session-state-offline-persistence.md)
- [Adoption Guide](../../docs/how-to/developer/session-state-adoption-guide.md)
- [API Reference](../../docs/reference/session-state/api.md)
