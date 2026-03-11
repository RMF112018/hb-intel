# How to Add Session State to a Module

> **Doc Classification:** Living Reference (Diátaxis) — How-to quadrant; developer audience; session-state module adoption.

This guide walks you through wiring `@hbc/session-state` into a consuming module for offline-safe form persistence, operation queuing, and connectivity-aware sync.

**Locked ADR:** [ADR-0101](../../architecture/adr/ADR-0101-session-state-offline-persistence.md)
**API Reference:** [session-state/api.md](../../reference/session-state/api.md)

---

## 1. When to Use Session State

Add session state when your module needs any of these capabilities in unreliable connectivity environments:

- **Draft persistence** — save in-progress form data to IndexedDB so users don't lose work on navigation or disconnect
- **Operation queuing** — queue mutations (saves, uploads, acknowledgments) that execute after reconnect
- **Connectivity awareness** — adapt UI behavior based on `online`, `offline`, or `degraded` status

If your module only operates in always-online scenarios with no form persistence needs, you do not need `@hbc/session-state`.

---

## 2. Provider Setup

Wrap your app root (or SPFx shell) with `SessionStateProvider`. The provider requires an `executor` function that processes queued operations on reconnect:

```tsx
import { SessionStateProvider } from '@hbc/session-state';
import type { OperationExecutor } from '@hbc/session-state';

const executor: OperationExecutor = async (operation) => {
  // Route queued operations to the appropriate API
  switch (operation.type) {
    case 'save':
      await MyApi.save(operation.payload);
      break;
    case 'upload':
      await UploadService.upload(operation.payload);
      break;
  }
};

function App() {
  return (
    <SessionStateProvider executor={executor}>
      <MyModule />
    </SessionStateProvider>
  );
}
```

Optional props:
- `probeUrl` — custom URL for connectivity probing (default: `CONNECTIVITY_PROBE_URL`)
- `pollIntervalMs` — SPFx polling interval in ms (default: `SPFX_SYNC_POLL_INTERVAL_MS`)

---

## 3. Using `useDraft<T>` for Form Persistence

`useDraft<T>` persists form state to IndexedDB with automatic TTL expiration:

```tsx
import { useDraft } from '@hbc/session-state';

interface IBidFormData {
  projectName: string;
  amount: number;
  notes: string;
}

function BidForm() {
  const { value, save, clear } = useDraft<IBidFormData>('bid-form-123');

  const handleChange = (data: Partial<IBidFormData>) => {
    save({ ...value, ...data } as IBidFormData);
  };

  const handleSubmit = () => {
    // Submit to API, then clear the draft
    clear();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={value?.projectName ?? ''}
        onChange={(e) => handleChange({ projectName: e.target.value })}
      />
      {/* ... */}
    </form>
  );
}
```

- `value` is `T | undefined` — `undefined` when no draft exists or draft has expired
- `save(data: T)` persists to IndexedDB with TTL (default: `DRAFT_DEFAULT_TTL_HOURS`)
- `clear()` removes the draft from IndexedDB
- Pass a custom TTL as the second argument: `useDraft<T>('key', 48)` for 48-hour TTL

---

## 4. Queueing Operations with `queueOperation`

Access the queue through `useSessionState`:

```tsx
import { useSessionState } from '@hbc/session-state';

function SaveButton({ data }: { data: unknown }) {
  const { queueOperation, connectivity } = useSessionState();

  const handleSave = async () => {
    if (connectivity === 'online') {
      await MyApi.save(data);
    } else {
      await queueOperation({
        type: 'save',
        payload: data,
      });
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

Queued operations are:
- Persisted to IndexedDB `queue` store
- Retried with exponential backoff on reconnect (up to `QUEUE_DEFAULT_MAX_RETRIES`)
- Marked as `failed` after max retries are exhausted (user-visible)

---

## 5. Handling Reconnect Sync UX

Use the connectivity components to communicate sync status:

```tsx
import { HbcConnectivityBar, HbcSyncStatusBadge } from '@hbc/session-state';

function AppShell() {
  return (
    <>
      <HbcConnectivityBar />
      <nav>
        <HbcSyncStatusBadge />
      </nav>
      <main>{/* ... */}</main>
    </>
  );
}
```

- **`HbcConnectivityBar`** — banner showing `online`/`offline`/`degraded`/`syncing` states with `role="status"` and `aria-live="polite"`. Pass `showWhenOnline={false}` to hide when connected.
- **`HbcSyncStatusBadge`** — pending operation count badge with expandable details popover.

Both components use inline CSS-in-JS (no `@hbc/ui-kit` dependency) and are app-shell-safe for SPFx.

---

## 6. Using Testing Fixtures

In your module's tests, use the canonical testing sub-path:

```tsx
import {
  createMockDraftEntry,
  createMockQueuedOperation,
  createMockSessionContext,
  mockConnectivityStates,
} from '@hbc/session-state/testing';

describe('MyOfflineFeature', () => {
  it('renders with mock context', () => {
    const ctx = createMockSessionContext({ connectivity: 'offline' });
    // ... test with mock context
  });

  it('handles queued operation', () => {
    const op = createMockQueuedOperation({ type: 'save' });
    // ... test queue behavior
  });

  it('handles all connectivity states', () => {
    for (const status of mockConnectivityStates) {
      const ctx = createMockSessionContext({ connectivity: status });
      // ... parameterized test
    }
  });
});
```

---

## Architecture Boundaries

`@hbc/session-state` must **not** import from:
- `@hbc/versioned-record`
- `@hbc/bic-next-move`
- `@hbc/notification-intelligence`
- Any `packages/features/*` module

IndexedDB access is isolated to `src/db/`. No direct SharePoint/Graph calls — all network I/O goes through the `executor` callback supplied by the consuming module.
