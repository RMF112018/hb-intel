# PH6.9 — `@hbc/provisioning` Package

**Version:** 2.0
**Purpose:** Complete the `@hbc/provisioning` package scaffolded in PH6.1. Implement the API client functions, `useProvisioningSignalR` hook, Zustand store slice, and all shared TypeScript types. This package is the single source of truth for provisioning headless logic consumed by all seven HB Intel apps.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A fully tested, type-safe headless provisioning package with zero visual component exports. Every consuming app gets identical API call semantics, SignalR connection behavior, and store structure by importing from `@hbc/provisioning`.

---

## Prerequisites

- PH6.1–PH6.8 complete and passing.
- `packages/provisioning` directory scaffolded (PH6.1).

---

## 6.9.1 — API Client

Create `packages/provisioning/src/api-client.ts`:

```typescript
import type {
  IProjectSetupRequest,
  IProvisioningStatus,
  ProjectSetupRequestState,
} from '@hbc/models';

export interface IProvisioningApiClient {
  submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  advanceState(
    requestId: string,
    newState: ProjectSetupRequestState,
    extras?: { projectNumber?: string; clarificationNote?: string }
  ): Promise<IProjectSetupRequest>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  retryProvisioning(projectId: string): Promise<void>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}

/**
 * Creates an API client bound to the given base URL and token factory.
 * The token factory is called on each request to get the current Bearer token.
 */
export function createProvisioningApiClient(
  baseUrl: string,
  getToken: () => Promise<string>
): IProvisioningApiClient {
  async function authFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await getToken();
    const response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error((error as { error: string }).error ?? `HTTP ${response.status}`);
    }
    return response;
  }

  return {
    async submitRequest(data) {
      const res = await authFetch('/project-setup-requests', {
        method: 'POST', body: JSON.stringify(data),
      });
      return res.json();
    },
    async listRequests(state) {
      const qs = state ? `?state=${state}` : '';
      const res = await authFetch(`/project-setup-requests${qs}`);
      return res.json();
    },
    async advanceState(requestId, newState, extras = {}) {
      const res = await authFetch(`/project-setup-requests/${requestId}/state`, {
        method: 'PATCH', body: JSON.stringify({ newState, ...extras }),
      });
      return res.json();
    },
    async getProvisioningStatus(projectId) {
      const res = await authFetch(`/provisioning-status/${projectId}`);
      if (res.status === 404) return null;
      return res.json();
    },
    async retryProvisioning(projectId) {
      await authFetch(`/provisioning-retry/${projectId}`, { method: 'POST' });
    },
    async escalateProvisioning(projectId, escalatedBy) {
      await authFetch(`/provisioning-escalate/${projectId}`, {
        method: 'POST', body: JSON.stringify({ escalatedBy }),
      });
    },
  };
}
```

---

## 6.9.2 — Zustand Store Slice

Create `packages/provisioning/src/store.ts`:

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  IProjectSetupRequest,
  IProvisioningStatus,
  IProvisioningProgressEvent,
  ProjectSetupRequestState,
} from '@hbc/models';

interface IProvisioningStore {
  // Request lifecycle
  requests: IProjectSetupRequest[];
  requestsLoading: boolean;
  requestsError: string | null;
  setRequests: (requests: IProjectSetupRequest[]) => void;
  setRequestsLoading: (loading: boolean) => void;
  setRequestsError: (error: string | null) => void;
  upsertRequest: (request: IProjectSetupRequest) => void;

  // Provisioning status per projectId
  statusByProjectId: Record<string, IProvisioningStatus>;
  setProvisioningStatus: (status: IProvisioningStatus) => void;

  // Real-time progress events (last event per projectId)
  latestEventByProjectId: Record<string, IProvisioningProgressEvent>;
  handleProgressEvent: (event: IProvisioningProgressEvent) => void;

  // SignalR connection state
  signalRConnected: boolean;
  setSignalRConnected: (connected: boolean) => void;
}

export const useProvisioningStore = create<IProvisioningStore>()(
  immer((set) => ({
    requests: [],
    requestsLoading: false,
    requestsError: null,
    statusByProjectId: {},
    latestEventByProjectId: {},
    signalRConnected: false,

    setRequests: (requests) => set((s) => { s.requests = requests; }),
    setRequestsLoading: (loading) => set((s) => { s.requestsLoading = loading; }),
    setRequestsError: (error) => set((s) => { s.requestsError = error; }),

    upsertRequest: (request) => set((s) => {
      const idx = s.requests.findIndex((r) => r.requestId === request.requestId);
      if (idx >= 0) s.requests[idx] = request;
      else s.requests.push(request);
    }),

    setProvisioningStatus: (status) => set((s) => {
      s.statusByProjectId[status.projectId] = status;
    }),

    handleProgressEvent: (event) => set((s) => {
      s.latestEventByProjectId[event.projectId] = event;
      // Update the relevant step in the status record
      const existing = s.statusByProjectId[event.projectId];
      if (existing) {
        existing.overallStatus = event.overallStatus;
        const stepIdx = existing.steps.findIndex((step) => step.stepNumber === event.stepNumber);
        if (stepIdx >= 0) {
          existing.steps[stepIdx].status = event.status;
          if (event.status === 'Completed') existing.steps[stepIdx].completedAt = event.timestamp;
          if (event.status === 'Failed') existing.steps[stepIdx].errorMessage = event.errorMessage;
        }
      }
    }),

    setSignalRConnected: (connected) => set((s) => { s.signalRConnected = connected; }),
  }))
);
```

---

## 6.9.3 — `useProvisioningSignalR` Hook

Create `packages/provisioning/src/hooks/useProvisioningSignalR.ts`:

```typescript
import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import type { IProvisioningProgressEvent } from '@hbc/models';
import { useProvisioningStore } from '../store.js';

export interface IUseProvisioningSignalROptions {
  /** The negotiate endpoint URL (Function App base URL + /api/provisioning-negotiate) */
  negotiateUrl: string;
  /** The projectId to connect to */
  projectId: string;
  /** Factory function that returns the current Bearer token for the Function App */
  getToken: () => Promise<string>;
  /** Whether the connection should be active (e.g. false when no projectId) */
  enabled?: boolean;
}

/**
 * Establishes and manages a SignalR connection for provisioning progress.
 * Adds the user to the per-project group and dispatches events to the Zustand store.
 * Handles automatic reconnection with exponential backoff.
 */
export function useProvisioningSignalR({
  negotiateUrl,
  projectId,
  getToken,
  enabled = true,
}: IUseProvisioningSignalROptions): { isConnected: boolean } {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const { handleProgressEvent, setSignalRConnected } = useProvisioningStore();

  useEffect(() => {
    if (!enabled || !projectId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${negotiateUrl}?projectId=${projectId}`, {
        accessTokenFactory: getToken,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000, 60000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('provisioningProgress', (event: IProvisioningProgressEvent) => {
      handleProgressEvent(event);
    });

    connection.onclose(() => setSignalRConnected(false));
    connection.onreconnecting(() => setSignalRConnected(false));
    connection.onreconnected(() => setSignalRConnected(true));

    connectionRef.current = connection;

    connection.start()
      .then(() => setSignalRConnected(true))
      .catch((err) => {
        console.warn('[useProvisioningSignalR] Failed to connect:', err);
        setSignalRConnected(false);
      });

    return () => {
      connection.stop().catch(() => {/* ignore cleanup errors */});
      setSignalRConnected(false);
    };
  }, [enabled, projectId, negotiateUrl]);

  return { isConnected: useProvisioningStore((s) => s.signalRConnected) };
}
```

---

## 6.9.4 — Role-Based Visibility Helper

Create `packages/provisioning/src/visibility.ts`:

```typescript
import type { IAuthSession } from '@hbc/auth';

const FULL_CHECKLIST_ROLES = ['Admin', 'HBIntelAdmin'];
const NO_NOTIFICATION_ROLES = ['Leadership', 'SharedServices'];

/**
 * Returns the visibility level for the current user and a specific project.
 * - 'full': show the 7-step real-time checklist
 * - 'notification': show start/finish banner only
 * - 'none': no provisioning visibility
 */
export function getProvisioningVisibility(
  session: IAuthSession | null,
  submittedBy: string
): 'full' | 'notification' | 'none' {
  if (!session) return 'none';

  const roles = session.roles ?? [];

  if (roles.some((r) => FULL_CHECKLIST_ROLES.includes(r))) return 'full';
  if (session.upn === submittedBy) return 'full'; // Request submitter gets full view

  if (roles.some((r) => NO_NOTIFICATION_ROLES.includes(r))) return 'none';

  return 'notification'; // OpEx, Pursuit Team, Project Team
}
```

---

## 6.9.5 — Public Exports

Update `packages/provisioning/src/index.ts`:

```typescript
export * from './types.js';
export * from './api-client.js';
export * from './store.js';
export * from './visibility.js';
export * from './notification-templates.js';
export { useProvisioningSignalR } from './hooks/useProvisioningSignalR.js';
export { isValidTransition, STATE_TRANSITIONS, STATE_NOTIFICATION_TARGETS } from './state-machine.js';
```

---

## 6.9 Success Criteria Checklist

- [ ] 6.9.1 `createProvisioningApiClient` covers all six API operations with auth.
- [ ] 6.9.2 Zustand store handles `handleProgressEvent` — updates both `latestEventByProjectId` and `statusByProjectId` steps.
- [ ] 6.9.3 `useProvisioningSignalR` hook establishes connection, handles reconnection, and cleans up on unmount.
- [ ] 6.9.4 `getProvisioningVisibility` correctly returns `'full'` for Admin, submitter; `'notification'` for OpEx/team members; `'none'` for Leadership/SharedServices.
- [ ] 6.9.5 `packages/provisioning/src/index.ts` exports all public API surface.
- [ ] 6.9.6 No React component exports in the package.
- [ ] 6.9.7 `pnpm turbo run build --filter=@hbc/provisioning` passes.
- [ ] 6.9.8 All unit tests for store, visibility helper, and state machine pass.

## PH6.9 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=@hbc/provisioning` → EXIT 0 — PASS / FAIL
- `pnpm turbo run test --filter=@hbc/provisioning` → all tests pass — PASS / FAIL
- `getProvisioningVisibility` unit tests: Admin → 'full', submitter → 'full', OpEx → 'notification', Leadership → 'none' — PASS / FAIL
