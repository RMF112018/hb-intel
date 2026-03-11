# @hbc/session-state

Offline-safe session persistence and sync for HB Intel modules.

## Overview

`@hbc/session-state` provides IndexedDB-backed session persistence, an offline operation queue, draft management with TTL expiration, and connectivity-aware sync — enabling HB Intel modules to function seamlessly in online, offline, and degraded network conditions (D-01, D-04).

## Quick Start

```tsx
import { SessionStateProvider } from '@hbc/session-state';
import { useSessionState, useDraft, useConnectivity } from '@hbc/session-state';

// Wrap your app with the provider
function App() {
  return (
    <SessionStateProvider>
      <MyModule />
    </SessionStateProvider>
  );
}

// Use hooks to access session state
function MyModule() {
  const { syncStatus, pendingOperations } = useSessionState();
  const { connectivity } = useConnectivity();
  const { draft, saveDraft } = useDraft('my-entity');

  return <div>Status: {connectivity}</div>;
}
```

> **Note:** Provider and hooks are placeholder stubs in T01. Implementation lands in T03–T05.

## Connectivity States

| State | Description |
|-------|-------------|
| `online` | Full network connectivity; sync active |
| `offline` | No network; operations queued locally |
| `degraded` | Partial connectivity; selective sync with retry (D-03) |

## Draft TTL Behavior

Drafts are persisted to IndexedDB with a configurable TTL (time-to-live). Expired drafts are automatically purged during the next sync cycle or on provider mount. Default TTL is 24 hours (D-05). Modules may override TTL per entity type (D-02).

## Exports

| Entry Point | Description |
|-------------|-------------|
| `@hbc/session-state` | Runtime API — provider, hooks, components |
| `@hbc/session-state/testing` | Test factories — mock operations, drafts, context, connectivity states |

## Architecture Boundaries

- **No direct SharePoint/Graph calls** — all network I/O goes through `@hbc/data-access` adapters.
- **No global state mutation** — session state is scoped to the `SessionStateProvider` context tree.
- **IndexedDB isolation** — each module uses a namespaced object store to prevent cross-module collisions.
- **Peer dependencies only** — `react` and `react-dom`; no bundled UI framework dependencies at scaffold.

## Related

- [SF12 Master Plan](../../docs/architecture/plans/shared-features/SF12-Session-State.md)
- [SF12-T09 — Testing and Deployment](../../docs/architecture/plans/shared-features/SF12-T09-Testing-and-Deployment.md)
- ADR-0101 (target path — to be created when session-state reaches production readiness)
