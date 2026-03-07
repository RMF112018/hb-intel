# PH6F-6 — Wire `useProvisioningSignalR` in the Provisioning UI

**Plan ID:** PH6F-6-Cleanup-ProvisioningSignalR
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §6b (Provisioning saga), §7a (SignalR real-time events)
**Foundation Plan Reference:** Phase 6 (useProvisioningSignalR, IProvisioningProgressEvent)
**Priority:** MEDIUM
**Execution Order:** 7th in sequence (after PH6F-7 — blocked on provisioning UI existing)
**Estimated Effort:** 2–3 hours
**Risk:** MEDIUM — depends on Azure Functions local emulator for testing; blocked until provisioning route exists

---

## Problem Statement

`useProvisioningSignalR` manages a SignalR connection that delivers real-time
`IProvisioningProgressEvent` messages during project provisioning. Without it, the provisioning
progress UI must either poll a REST endpoint or remain entirely static. Real-time progress
updates are a core part of the provisioning UX defined in the blueprint.

The hook is fully implemented in `@hbc/provisioning` (or equivalent package — verify the
actual package name). It has never been mounted in any component.

---

## Prerequisite / Blocked By

This task is **partially blocked** until the provisioning progress route/component exists in
the PWA router. Check whether a provisioning status page exists:

```bash
find apps/pwa/src/routes -name "*provision*" -o -name "*Provision*"
```

If the provisioning route does not yet exist, this task cannot be fully implemented.
The steps below define both the hook wiring and the stub provisioning component to create
if needed.

Additionally, this task requires the Azure Functions API to be running locally for full
end-to-end testing (the SignalR negotiate endpoint).

---

## Step 1 — Locate the Provisioning Hook Package

Verify the exact import path:

```bash
# Find the hook:
grep -r "useProvisioningSignalR" packages/ --include="*.ts" -l
```

Determine whether the hook lives in:
- `@hbc/provisioning` — a dedicated provisioning package
- `@hbc/shell` — part of the shell package
- `packages/query-hooks/` — part of query hooks

Update the import in Steps 3-4 to use the correct package name.

---

## Step 2 — Add `VITE_API_BASE_URL` to Dev Environment

**File:** `apps/pwa/.env.development` (create if it doesn't exist)

```env
# Local Azure Functions emulator base URL
VITE_API_BASE_URL=http://localhost:7071
```

This env var controls the SignalR negotiate endpoint URL. The negotiate endpoint is expected at:
`${VITE_API_BASE_URL}/api/provisioning-negotiate`

---

## Step 3 — Create the Provisioning Progress Component

If the provisioning route already exists, skip to Step 4.

**New file:** `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`

```typescript
// apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx
// D-PH6F-6: Provisioning progress UI with real-time SignalR connection.

import React from 'react';
import { useProvisioningSignalR } from '@hbc/provisioning'; // adjust import path
import { useAuthStore } from '@hbc/auth';
import { useParams } from '@tanstack/react-router';

// Placeholder — replace with actual provisioning store once available
function useProvisioningEvents() {
  const [events, setEvents] = React.useState<unknown[]>([]);
  return { events, addEvent: (e: unknown) => setEvents((prev) => [...prev, e]) };
}

export function ProvisioningProgressView() {
  const { projectId } = useParams({ from: '/provisioning/$projectId' });
  const { events } = useProvisioningEvents();

  // D-PH6F-6: Derive token getter from auth store.
  // In MSAL mode, the session will have an accessToken field.
  // In mock/dev mode, returns a dev placeholder token.
  const getToken = React.useCallback(async (): Promise<string> => {
    const session = useAuthStore.getState().session;
    // Adjust based on the actual NormalizedAuthSession shape
    return (session as unknown as { accessToken?: string })?.accessToken ?? 'dev-token';
  }, []);

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_API_BASE_URL}/api/provisioning-negotiate`,
    projectId,
    getToken,
    enabled: Boolean(projectId),
  });

  return (
    <div className="provisioning-progress">
      <div className="connection-status">
        {isConnected ? '🟢 Connected' : '🟡 Connecting...'}
      </div>
      <ul className="events-list">
        {events.map((event, i) => (
          <li key={i}>{JSON.stringify(event)}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Step 4 — Wire the Hook into the Existing Provisioning Component

If a provisioning component already exists, add the hook to it:

```typescript
// In the existing provisioning progress component:
import { useProvisioningSignalR } from '@hbc/provisioning';
import { useAuthStore } from '@hbc/auth';

function ProvisioningProgressView({ projectId }: { projectId: string }) {
  const getToken = React.useCallback(async () => {
    const session = useAuthStore.getState().session;
    return (session as unknown as { accessToken?: string })?.accessToken ?? '';
  }, []);

  const { isConnected } = useProvisioningSignalR({
    negotiateUrl: `${import.meta.env.VITE_API_BASE_URL}/api/provisioning-negotiate`,
    projectId,
    getToken,
    enabled: Boolean(projectId),
  });

  // isConnected drives connection status indicator
  // Progress events are populated in provisioningStore by the hook internally
  const events = useProvisioningStore((s) => s.progressEvents);
  // ...
}
```

---

## Step 5 — Verify `useProvisioningSignalR` Hook Signature

Before implementing, verify the exact hook signature:

```typescript
// Expected (verify against actual):
useProvisioningSignalR(params: {
  negotiateUrl: string;
  projectId: string;
  getToken: () => Promise<string>;
  enabled?: boolean;
}): {
  isConnected: boolean;
  // possibly other return values
}
```

Find the implementation and check whether `progressEvents` are dispatched to a Zustand store
automatically, or whether the hook returns them directly. Adjust Step 3/4 accordingly.

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `apps/pwa/.env.development` |
| Create/Modify | `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx` |
| Modify (if needed) | Provisioning router entry to mount the new component |

---

## Verification Commands

```bash
# 1. Build check
pnpm turbo run build

# 2. Start Azure Functions emulator (requires azurite + local.settings.json)
cd apps/api && func start

# 3. Start PWA dev server
pnpm --filter pwa dev

# 4. Manual verification
# a. Navigate to provisioning progress page for a project
# b. Verify: console shows "SignalR connected to provisioning-negotiate"
# c. Verify: isConnected === true in component
# d. Trigger a test provisioning event via the Functions API
# e. Verify: progressEvents array updates in real time (React DevTools)
# f. Unmount the component (navigate away)
# g. Verify: SignalR connection is cleaned up (no lingering connection in Network tab)
```

---

## Success Criteria

- [ ] PH6F-6.1 `useProvisioningSignalR` mounted in the provisioning progress component
- [ ] PH6F-6.2 `isConnected` reflects the actual SignalR connection state
- [ ] PH6F-6.3 `progressEvents` are populated from SignalR messages in real time
- [ ] PH6F-6.4 Connection auto-reconnects on disconnect (via `withAutomaticReconnect` config)
- [ ] PH6F-6.5 Hook cleans up the SignalR connection on component unmount
- [ ] PH6F-6.6 `VITE_API_BASE_URL` controls the negotiate endpoint base URL
- [ ] PH6F-6.7 Build passes with zero TypeScript errors

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: Partially blocked — requires provisioning route to exist
Execution: Seventh in sequence; implement when provisioning UI route is available
Key: Verify useProvisioningSignalR package location before implementing
-->
