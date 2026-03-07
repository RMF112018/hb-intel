# PH6.12 — Cross-App Notifications & Admin Failures Dashboard

**Version:** 2.0
**Purpose:** Build the start/finish notification banner component consumed by all seven HB Intel apps, implement role-based visibility logic, and build the Admin Provisioning Failures dashboard. The banner is a single component from `@hbc/ui-kit` driven by the `@hbc/provisioning` Zustand store. The Admin dashboard shows all failed and stalled provisioning runs.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** Every relevant user in every app sees the exact start and finish notification text when provisioning begins or completes for a project they belong to. The Admin dashboard gives system administrators a clear, actionable view of every failed or stuck provisioning run.

---

## Prerequisites

- PH6.1–PH6.11 complete and passing.
- `@hbc/provisioning` package available to all seven apps.
- Apps: Accounting, Admin, Business Development, Estimating, Operational Excellence, Project Hub, PWA.

---

## 6.12.1 — Notification Banner Component

The banner is a presentational component that lives in the consuming app (not in `@hbc/provisioning` per the package boundary rule). However, since the exact same banner is needed in six apps, create it once in `@hbc/ui-kit` as a generic notification component.

Create `packages/ui-kit/src/components/ProvisioningNotificationBanner/index.tsx`:

```typescript
import { useState } from 'react';
import type { ReactNode } from 'react';

export type ProvisioningNotificationVariant = 'started' | 'completed' | 'failed';

export interface IProvisioningNotificationBannerProps {
  variant: ProvisioningNotificationVariant;
  message: string;
  onDismiss: () => void;
  siteUrl?: string;
}

const VARIANT_STYLES: Record<ProvisioningNotificationVariant, string> = {
  started:   'bg-blue-50 border-blue-200 text-blue-900',
  completed: 'bg-green-50 border-green-200 text-green-900',
  failed:    'bg-red-50 border-red-200 text-red-900',
};

const VARIANT_ICONS: Record<ProvisioningNotificationVariant, string> = {
  started:   '🏗️',
  completed: '🎉',
  failed:    '⚠️',
};

export function ProvisioningNotificationBanner({
  variant, message, onDismiss, siteUrl,
}: IProvisioningNotificationBannerProps): ReactNode {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${VARIANT_STYLES[variant]}`}>
      <span className="text-xl">{VARIANT_ICONS[variant]}</span>
      <p className="flex-1 text-sm">{message}</p>
      {siteUrl && variant === 'completed' && (
        <a href={siteUrl} target="_blank" rel="noreferrer"
           className="text-sm underline font-medium">
          Open Site →
        </a>
      )}
      <button onClick={onDismiss} className="text-sm opacity-60 hover:opacity-100">✕</button>
    </div>
  );
}
```

---

## 6.12.2 — Banner Host Hook

Create a hook in each consuming app (or a shared pattern) that listens to the Zustand store for notification-level events and renders banners. Add this to each app's shell layout:

```typescript
// apps/[app-name]/src/hooks/useProvisioningNotifications.ts
import { useEffect, useState } from 'react';
import { useProvisioningStore, getProvisioningVisibility } from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';
import { NOTIFICATION_TEMPLATES } from '@hbc/provisioning';
import type { IProvisioningProgressEvent } from '@hbc/models';

interface IActiveNotification {
  id: string;
  variant: 'started' | 'completed' | 'failed';
  message: string;
  siteUrl?: string;
}

export function useProvisioningNotifications() {
  const session = useAuthSession();
  const { latestEventByProjectId, requests } = useProvisioningStore();
  const [notifications, setNotifications] = useState<IActiveNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    Object.values(latestEventByProjectId).forEach((event: IProvisioningProgressEvent) => {
      const request = requests.find((r) => r.projectId === event.projectId);
      const visibility = getProvisioningVisibility(session, request?.submittedBy ?? '');

      // Only show banners to 'notification' level users (full-checklist users see the checklist)
      if (visibility !== 'notification') return;

      const notifId = `${event.projectId}-${event.overallStatus}`;
      if (dismissed.has(notifId)) return;

      if (event.overallStatus === 'InProgress' && event.stepNumber === 1) {
        // Start notification — fires when Step 1 begins
        const msg = NOTIFICATION_TEMPLATES.ProvisioningStarted(
          event.projectNumber, event.projectName
        ).body;
        setNotifications((prev) => {
          if (prev.find((n) => n.id === notifId)) return prev;
          return [...prev, { id: notifId, variant: 'started', message: msg }];
        });
      }

      if (event.overallStatus === 'Completed' || event.overallStatus === 'WebPartsPending') {
        const msg = NOTIFICATION_TEMPLATES.ProvisioningCompleted(
          event.projectNumber, event.projectName
        ).body;
        const status = useProvisioningStore.getState().statusByProjectId[event.projectId];
        setNotifications((prev) => {
          if (prev.find((n) => n.id === notifId)) return prev;
          return [...prev, {
            id: notifId,
            variant: 'completed',
            message: msg,
            siteUrl: status?.siteUrl,
          }];
        });
      }
    });
  }, [latestEventByProjectId]);

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  return { notifications, dismiss };
}
```

---

## 6.12.3 — Integration in Each App Shell

For each of the six non-Estimating apps (Accounting, Admin, Business Development, Operational Excellence, Project Hub, PWA), add the following to their root layout component:

```typescript
// In the root layout / shell component of each app
import { ProvisioningNotificationBanner } from '@hbc/ui-kit';
import { useProvisioningNotifications } from '../hooks/useProvisioningNotifications.js';

// Inside the layout render:
const { notifications, dismiss } = useProvisioningNotifications();

// In JSX, above the main content area:
{notifications.map((n) => (
  <ProvisioningNotificationBanner
    key={n.id}
    variant={n.variant}
    message={n.message}
    siteUrl={n.siteUrl}
    onDismiss={() => dismiss(n.id)}
  />
))}
```

Each app must also call `useProvisioningSignalR` at the app level (not page level) to receive events regardless of which page the user is on. Connect with `projectId` from the user's current project context if available.

---

## 6.12.4 — Admin Provisioning Failures Dashboard

Create `apps/admin/src/pages/ProvisioningFailuresPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge, HbcButton } from '@hbc/ui-kit';
import { createProvisioningApiClient } from '@hbc/provisioning';
import { useAuthSession } from '@hbc/auth';
import type { IProvisioningStatus } from '@hbc/models';

export function ProvisioningFailuresPage(): ReactNode {
  const session = useAuthSession();
  const [failures, setFailures] = useState<IProvisioningStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session.getToken
    );
    // Load all statuses and filter for failed/stuck
    client.listFailedRuns?.().then(setFailures).finally(() => setLoading(false));
  }, [session]);

  async function handleRetry(projectId: string) {
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session!.getToken
    );
    await client.retryProvisioning(projectId);
    setFailures((prev) => prev.filter((f) => f.projectId !== projectId));
  }

  async function handleEscalate(projectId: string) {
    const client = createProvisioningApiClient(
      import.meta.env.VITE_FUNCTION_APP_URL, session!.getToken
    );
    await client.escalateProvisioning(projectId, session!.upn);
  }

  const columns = [
    { key: 'projectNumber', header: 'Project #' },
    { key: 'projectName', header: 'Project Name' },
    { key: 'overallStatus', header: 'Status',
      render: (r: IProvisioningStatus) => (
        <HbcStatusBadge variant={r.overallStatus === 'Failed' ? 'error' : 'warning'}>
          {r.overallStatus}
        </HbcStatusBadge>
      )},
    { key: 'failedStep', header: 'Failed at',
      render: (r: IProvisioningStatus) => {
        const failedStep = r.steps.find((s) => s.status === 'Failed');
        return failedStep ? `Step ${failedStep.stepNumber}: ${failedStep.stepName}` : '—';
      }},
    { key: 'failedAt', header: 'Failed At',
      render: (r: IProvisioningStatus) =>
        r.failedAt ? new Date(r.failedAt).toLocaleString() : '—' },
    { key: 'triggeredBy', header: 'Triggered By' },
    { key: 'actions', header: 'Actions',
      render: (r: IProvisioningStatus) => (
        <div className="flex gap-2">
          <HbcButton size="sm" onClick={() => handleRetry(r.projectId)}>Retry</HbcButton>
          <HbcButton size="sm" variant="secondary" onClick={() => handleEscalate(r.projectId)}>
            Escalate
          </HbcButton>
        </div>
      )},
  ];

  return (
    <WorkspacePageShell layout="list" title="Provisioning Failures">
      {loading && <p>Loading…</p>}
      {!loading && (
        <HbcDataTable
          rows={failures}
          columns={columns}
          emptyMessage="No failed or stuck provisioning runs."
          rowKey={(r) => r.projectId}
        />
      )}
    </WorkspacePageShell>
  );
}
```

Add `listFailedRuns` to the API client (returns runs where `overallStatus === 'Failed'` or stuck for > 30 minutes):

```typescript
// In api-client.ts
async listFailedRuns(): Promise<IProvisioningStatus[]> {
  const res = await authFetch('/provisioning-failures');
  return res.json();
}
```

Add the corresponding HTTP function to `backend/functions/src/functions/provisioningSaga/index.ts`:

```typescript
app.http('listFailedRuns', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'provisioning-failures',
  handler: async (request, context) => {
    let claims;
    try { claims = await validateToken(request); } catch { return unauthorizedResponse('Invalid token'); }
    // Only Admin role may call this endpoint
    if (!claims.roles.some((r) => ['Admin', 'HBIntelAdmin'].includes(r))) {
      return { status: 403, jsonBody: { error: 'Admin role required' } };
    }
    const services = createServiceFactory();
    const failed = await services.tableStorage.listFailedRuns();
    return { status: 200, jsonBody: failed };
  },
});
```

Add `listFailedRuns` to `ITableStorageService` and `RealTableStorageService` — returns entities where `overallStatus eq 'Failed'`.

---

## 6.12 Success Criteria Checklist

- [ ] 6.12.1 `ProvisioningNotificationBanner` component created in `@hbc/ui-kit` with started/completed/failed variants.
- [ ] 6.12.2 `useProvisioningNotifications` hook shows banners only to `'notification'` visibility level users.
- [ ] 6.12.3 Start notification fires when Step 1 begins; finish notification fires on `Completed`/`WebPartsPending`.
- [ ] 6.12.4 Notification text matches exactly: start and finish templates from Decision 9.
- [ ] 6.12.5 Banner dismissed state persists for current session (dismissed banners do not re-appear).
- [ ] 6.12.6 Admin Provisioning Failures dashboard lists all failed runs with Retry and Escalate actions.
- [ ] 6.12.7 `listFailedRuns` endpoint requires Admin role; returns 403 otherwise.
- [ ] 6.12.8 Banner integration instructions documented for each of the six non-Estimating apps.
- [ ] 6.12.9 `pnpm turbo run build --filter=@hb-intel/admin` passes.

## PH6.12 Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build` (full monorepo) → EXIT 0 — PASS / FAIL
- OpEx Manager user in Project Hub → start banner appears when provisioning begins — PASS / FAIL
- Admin user → no start banner (they see full checklist in Admin dashboard instead) — PASS / FAIL
- Admin dashboard → failed run appears with correct step, project name, triggered by — PASS / FAIL
- Retry from Admin dashboard → provisioning restarts — PASS / FAIL
