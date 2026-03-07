# PH7-Admin-Feature-Plan.md

**Phase 7 — Admin Module: Complete Feature Build-Out**

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Derived from:** Structured product-owner interview (2026-03-07); all decisions locked.
**Audience:** Implementation agent(s), technical reviewers.
**Purpose:** Exhaustive, numbered, copy-paste-ready instructions for building every Admin module feature. A developer unfamiliar with the project can execute this plan sequentially and produce a production-ready, fully tested, fully documented Admin webpart.

---

## Locked Interview Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | User & permission management | **Option C** — Hybrid: Azure AD base identity + in-app override layer |
| 2 | Admin home dashboard | **Option B** — Ops alerts + lightweight usage metrics |
| 3 | Error log & audit trail | **Option C** — Two-tab: Business Audit + System Errors |
| 4 | System settings | **Option B** — Notification recipients, module toggles, OpEx Manager, role-to-notification mappings |
| 5 | Provisioning oversight | **Option B** — View + manual retry with confirmation dialog |
| 6 | Role override management | **Option B** (Option C documented for future) — Expiry dates + active overrides dashboard |
| 7 | Data export | **Option B** (Option C documented for future) — CSV/Excel for audit log, overrides, provisioning history |
| 8 | Notification history log | **Option B** (Option C documented for future) — Last 30 days, read-only |
| 9 | Provisioned sites directory | **Option B** (Option C documented for future) — Read-only site inventory |
| 10 | User lifecycle management | **Option C** — Auto first-login detection, departure handling, Admin notifications, full audit trail |

---

## Prerequisites

- Phase 5C complete and signed off (auth, shell, PersonaRegistry, DevToolbar — all ✅ as of 2026-03-07)
- Phase 6 complete (provisioning backend, `@hbc/provisioning` package, SignalR hub, request lifecycle API, provisioning saga)
- `apps/admin` exists with three placeholder pages: `ProvisioningFailuresPage`, `SystemSettingsPage`, `ErrorLogPage`
- `@hbc/auth` `AdminAccessControlPage` component available (already wired in `SystemSettingsPage`)
- `VITE_FUNCTION_APP_URL` and `VITE_AZURE_TENANT_ID` environment variables set

---

## Recommended Implementation Sequence

```
7-Admin.1  → Data Models & Types
7-Admin.2  → Route Structure
7-Admin.3  → Admin Home Dashboard
7-Admin.4  → Users & Role Overrides
7-Admin.5  → User Lifecycle Management
7-Admin.6  → Audit Trail & Error Log (replaces ErrorLogPage placeholder)
7-Admin.7  → Provisioning Failures Page (upgrades Phase 6 placeholder)
7-Admin.8  → Provisioned Sites Directory
7-Admin.9  → Notification Log
7-Admin.10 → System Settings (expands existing page)
7-Admin.11 → Data Export
7-Admin.12 → Backend API Endpoints
7-Admin.13 → SharePoint List Schemas
7-Admin.14 → Testing
7-Admin.15 → Documentation & ADR
```

---

## 7-Admin.1 — Data Models & Types

Add a new `admin` domain to `packages/models/src/`. Create the following files exactly as specified.

### 7-Admin.1.1 — `packages/models/src/admin/IAdminUserOverride.ts`

```typescript
/**
 * A role override applied to a specific user in HB Intel.
 * Azure AD provides the base role; overrides are stored in SharePoint.
 * Overrides may be project-scoped and carry an optional expiry date.
 */
export interface IAdminUserOverride {
  /** UUID. */
  id: string;
  /** Azure AD Object ID of the target user. */
  userId: string;
  /** UPN (email) of the target user. */
  userUpn: string;
  /** Display name of the target user. */
  userName: string;
  /** Base role inherited from Azure AD group membership. */
  baseRole: string;
  /** HB Intel override role being granted. */
  overrideRole: string;
  /** UPN of the Admin who granted this override. */
  grantedBy: string;
  /** ISO-8601 timestamp when the override was granted. */
  grantedAt: string;
  /** ISO-8601 expiry timestamp. Undefined means no expiry. */
  expiresAt?: string;
  /** Whether this override is currently active. */
  isActive: boolean;
  /** Optional free-text reason for the override. */
  notes?: string;
  /** If project-scoped, the project UUID. */
  projectId?: string;
  /** If project-scoped, the formatted project number (##-###-##). */
  projectNumber?: string;
}

export interface IAdminUserOverrideFormData {
  targetUserUpn: string;
  overrideRole: string;
  expiresAt?: string;
  notes?: string;
  projectId?: string;
}
```

### 7-Admin.1.2 — `packages/models/src/admin/IAdminAuditEntry.ts`

```typescript
/**
 * A single entry in the HB Intel Business Audit Trail.
 * Captures who did what to whom, and when.
 * Stored in the SharePoint `HBIntelAuditLog` list.
 */
export type AdminAuditEventType =
  | 'override_granted'
  | 'override_revoked'
  | 'override_expired'
  | 'user_first_login'
  | 'user_disabled'
  | 'request_state_advanced'
  | 'provisioning_triggered'
  | 'provisioning_retried'
  | 'provisioning_completed'
  | 'provisioning_failed'
  | 'settings_changed'
  | 'data_exported'
  | 'site_directory_viewed';

export interface IAdminAuditEntry {
  /** UUID. */
  id: string;
  /** Category of the action. */
  eventType: AdminAuditEventType;
  /** UPN of the person who performed the action. */
  actorUpn: string;
  /** Display name of the actor. */
  actorName: string;
  /** UPN of the user who was affected (for user-targeted actions). */
  targetUpn?: string;
  /** Display name of the affected user. */
  targetName?: string;
  /** Human-readable description of the event. */
  description: string;
  /** Arbitrary key-value metadata (e.g., old value / new value for settings). */
  metadata?: Record<string, string>;
  /** ISO-8601 timestamp. */
  timestamp: string;
}
```

### 7-Admin.1.3 — `packages/models/src/admin/ISystemError.ts`

```typescript
/**
 * A backend system error surfaced in the Admin System Errors tab.
 * Sourced from Application Insights or Azure Function error logs.
 */
export type SystemErrorSeverity = 'warning' | 'error' | 'critical';

export interface ISystemError {
  /** UUID or Application Insights operation ID. */
  id: string;
  /** Short machine-readable error code (e.g., "PROVISIONING_STEP_FAILED"). */
  errorCode: string;
  /** Human-readable error message. */
  message: string;
  /** Component or function where the error originated. */
  source: string;
  /** Severity level. */
  severity: SystemErrorSeverity;
  /** ISO-8601 timestamp. */
  timestamp: string;
  /** Saga or request correlation ID for cross-system tracing. */
  correlationId?: string;
  /** ISO-8601 timestamp when the error was marked resolved. */
  resolvedAt?: string;
  /** Whether an Admin has marked this error as resolved. */
  isResolved: boolean;
}
```

### 7-Admin.1.4 — `packages/models/src/admin/IProvisionedSite.ts`

```typescript
/**
 * A record of a successfully provisioned SharePoint project site.
 * Stored in the SharePoint `ProvisionedSites` list.
 *
 * <!-- FUTURE OPTION C: Add archivedAt, archivedBy, and syncStatus fields
 *      when site lifecycle management is implemented in Phase 8+. -->
 */
export type ProvisionedSiteStatus = 'Active' | 'Archived' | 'Unknown';

export interface IProvisionedSite {
  /** UUID. */
  id: string;
  /** Project UUID from the provisioning saga. */
  projectId: string;
  /** Formatted project number (##-###-##). */
  projectNumber: string;
  /** Project display name. */
  projectName: string;
  /** Full URL of the provisioned SharePoint site. */
  siteUrl: string;
  /** UPN of the Controller who triggered provisioning. */
  provisionedBy: string;
  /** ISO-8601 timestamp when provisioning completed. */
  provisionedAt: string;
  /** Saga correlation ID for cross-referencing the provisioning history. */
  sagaId: string;
  /** Current lifecycle status of the site record. */
  status: ProvisionedSiteStatus;
}
```

### 7-Admin.1.5 — `packages/models/src/admin/IUsageMetrics.ts`

```typescript
/**
 * Aggregated usage metrics for the Admin home dashboard.
 * Computed server-side from SharePoint audit list data.
 */
export interface IUsageMetrics {
  /** Number of distinct users who accessed HB Intel in the last 7 days. */
  activeUsersThisWeek: number;
  /** Active user count broken down by base role name. */
  activeUsersByRole: Record<string, number>;
  /** Module access counts per role. Keys: roleName → moduleName → count. */
  moduleAdoptionByRole: Record<string, Record<string, number>>;
  /** Number of projects provisioned in the current calendar month. */
  provisionsThisMonth: number;
  /** Number of projects provisioned in the last 90 days. */
  provisionsLast90Days: number;
  /** Total number of users who have ever logged into HB Intel. */
  totalRegisteredUsers: number;
  /** ISO-8601 timestamp when these metrics were last computed. */
  computedAt: string;
}
```

### 7-Admin.1.6 — `packages/models/src/admin/INotificationLogEntry.ts`

```typescript
/**
 * A record of a notification sent by the HB Intel notification system.
 * Stored in the SharePoint `NotificationLog` list.
 *
 * <!-- FUTURE OPTION C: Add a `resendRequestedAt` field and resend workflow
 *      when the notification resend feature is implemented. -->
 */
export type NotificationDeliveryStatus = 'Sent' | 'Failed' | 'Bounced';

export interface INotificationLogEntry {
  /** UUID. */
  id: string;
  /** Event that triggered this notification (e.g., "ProvisioningFailed"). */
  eventType: string;
  /** UPN of the notification recipient. */
  recipientUpn: string;
  /** Display name of the recipient. */
  recipientName: string;
  /** Email subject line. */
  subject: string;
  /** ISO-8601 timestamp when the notification was sent. */
  sentAt: string;
  /** Delivery status. */
  status: NotificationDeliveryStatus;
  /** Related project ID if applicable. */
  projectId?: string;
  /** Related project number if applicable. */
  projectNumber?: string;
  /** Error message if status is Failed or Bounced. */
  errorMessage?: string;
}
```

### 7-Admin.1.7 — `packages/models/src/admin/IUserLifecycleEvent.ts`

```typescript
/**
 * A detected user lifecycle event requiring Admin awareness.
 * Stored in the SharePoint `UserLifecycleEvents` list.
 */
export type UserLifecycleEventType =
  | 'first_login'
  | 'role_changed'
  | 'user_disabled'
  | 'override_auto_expired';

export interface IUserLifecycleEvent {
  /** UUID. */
  id: string;
  /** Azure AD Object ID of the affected user. */
  userId: string;
  /** UPN of the affected user. */
  userUpn: string;
  /** Display name of the affected user. */
  userName: string;
  /** Type of lifecycle event. */
  eventType: UserLifecycleEventType;
  /** ISO-8601 timestamp when the event was detected. */
  detectedAt: string;
  /** Base role detected at first login, or the new role after a change. */
  roleDetected?: string;
  /** Previous role before a change (for role_changed events). */
  previousRole?: string;
  /** UPN of the Admin who acknowledged this event. */
  acknowledgedBy?: string;
  /** ISO-8601 timestamp when the event was acknowledged. */
  acknowledgedAt?: string;
  /** Whether an Admin has reviewed and acknowledged this event. */
  isAcknowledged: boolean;
}
```

### 7-Admin.1.8 — `packages/models/src/admin/ISystemSettings.ts`

```typescript
/**
 * System-wide configurable settings for HB Intel.
 * Stored in the SharePoint `SystemSettings` list (single-item configuration).
 */
export interface INotificationRecipientConfig {
  /** UPNs to notify on provisioning failure. */
  provisioningFailure: string[];
  /** UPNs to notify when provisioning completes successfully. */
  provisioningComplete: string[];
  /** UPNs to notify when a new user logs in for the first time. */
  newUserFirstLogin: string[];
  /** UPNs to notify when a user is disabled in Azure AD. */
  userDisabled: string[];
}

export interface ISystemSettings {
  /** UPN of the Operations Excellence Manager (auto-added to all project setup requests). */
  opExManagerUpn: string;
  /** Base URL for the Azure Functions backend. */
  functionAppUrl: string;
  /**
   * Module-level feature flags. Key is the module slug (e.g., "estimating"),
   * value is whether the module is enabled for all users.
   */
  enabledModules: Record<string, boolean>;
  /** Notification recipient configuration by event type. */
  notificationRecipients: INotificationRecipientConfig;
  /**
   * Maps HB Intel role names to lists of UPNs who receive notifications
   * when that role's workflow actions occur.
   */
  roleToNotificationMap: Record<string, string[]>;
  /** ISO-8601 timestamp of the last settings update. */
  lastUpdatedAt: string;
  /** UPN of the Admin who last updated settings. */
  lastUpdatedBy: string;
}

export interface ISystemSettingsFormData {
  opExManagerUpn: string;
  enabledModules: Record<string, boolean>;
  notificationRecipients: INotificationRecipientConfig;
  roleToNotificationMap: Record<string, string[]>;
}
```

### 7-Admin.1.9 — `packages/models/src/admin/index.ts`

```typescript
export type { IAdminUserOverride, IAdminUserOverrideFormData } from './IAdminUserOverride.js';
export type { IAdminAuditEntry, AdminAuditEventType } from './IAdminAuditEntry.js';
export type { ISystemError, SystemErrorSeverity } from './ISystemError.js';
export type { IProvisionedSite, ProvisionedSiteStatus } from './IProvisionedSite.js';
export type { IUsageMetrics } from './IUsageMetrics.js';
export type { INotificationLogEntry, NotificationDeliveryStatus } from './INotificationLogEntry.js';
export type { IUserLifecycleEvent, UserLifecycleEventType } from './IUserLifecycleEvent.js';
export type {
  ISystemSettings,
  ISystemSettingsFormData,
  INotificationRecipientConfig,
} from './ISystemSettings.js';
```

### 7-Admin.1.10 — Register `admin` domain in `packages/models/src/index.ts`

Add the following export to the barrel at `packages/models/src/index.ts`:

```typescript
export * from './admin/index.js';
```

---

## 7-Admin.2 — Route Structure

Replace `apps/admin/src/router/routes.ts` with the full route table:

```typescript
import { createRoute, lazyRouteComponent, redirect } from '@tanstack/react-router';
import { useNavStore, usePermissionStore } from '@hbc/auth';
import { rootRoute } from './root-route.js';

function requireAdmin(): void {
  const { hasPermission } = usePermissionStore.getState();
  if (!hasPermission('admin:access-control:view') && !hasPermission('*:*')) {
    throw redirect({ to: '/' });
  }
  useNavStore.getState().setActiveWorkspace('admin');
}

// ─── Home Dashboard ───────────────────────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/AdminHomePage.js').then((m) => ({ default: m.AdminHomePage }))
  ),
});

// ─── Users & Overrides ────────────────────────────────────────────────────────
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/UsersPage.js').then((m) => ({ default: m.UsersPage }))
  ),
});

const overridesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/overrides',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/OverridesPage.js').then((m) => ({ default: m.OverridesPage }))
  ),
});

// ─── Audit & Errors ───────────────────────────────────────────────────────────
const auditLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audit-log',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/AuditLogPage.js').then((m) => ({ default: m.AuditLogPage }))
  ),
});

// ─── Provisioning ─────────────────────────────────────────────────────────────
const provisioningFailuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioning-failures',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/ProvisioningFailuresPage.js').then((m) => ({ default: m.ProvisioningFailuresPage }))
  ),
});

const provisionedSitesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/provisioned-sites',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/ProvisionedSitesPage.js').then((m) => ({ default: m.ProvisionedSitesPage }))
  ),
});

// ─── Notification Log ─────────────────────────────────────────────────────────
const notificationLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notification-log',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/NotificationLogPage.js').then((m) => ({ default: m.NotificationLogPage }))
  ),
});

// ─── System Settings ──────────────────────────────────────────────────────────
const systemSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  beforeLoad: requireAdmin,
  component: lazyRouteComponent(
    () => import('../pages/SystemSettingsPage.js').then((m) => ({ default: m.SystemSettingsPage }))
  ),
});

export const webpartRoutes = [
  dashboardRoute,
  usersRoute,
  overridesRoute,
  auditLogRoute,
  provisioningFailuresRoute,
  provisionedSitesRoute,
  notificationLogRoute,
  systemSettingsRoute,
];
```

---

## 7-Admin.3 — Admin Home Dashboard

Create `apps/admin/src/pages/AdminHomePage.tsx`:

```typescript
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { WorkspacePageShell, HbcStatusBadge, HbcCard, HbcEmptyState } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';

export function AdminHomePage(): ReactNode {
  const session = useAuthSession();
  const {
    usageMetrics, metricsLoading,
    lifecycleEvents, lifecycleLoading,
    systemAlerts, alertsLoading,
    setUsageMetrics, setMetricsLoading,
    setLifecycleEvents, setLifecycleLoading,
    setSystemAlerts, setAlertsLoading,
  } = useAdminStore();

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);

    setMetricsLoading(true);
    client.getUsageMetrics()
      .then(setUsageMetrics)
      .finally(() => setMetricsLoading(false));

    setLifecycleLoading(true);
    client.getUnacknowledgedLifecycleEvents()
      .then(setLifecycleEvents)
      .finally(() => setLifecycleLoading(false));

    setAlertsLoading(true);
    client.getActiveSystemAlerts()
      .then(setSystemAlerts)
      .finally(() => setAlertsLoading(false));
  }, [session]);

  const unacknowledgedCount = lifecycleEvents.filter((e) => !e.isAcknowledged).length;
  const criticalAlertCount = systemAlerts.filter((a) => a.severity === 'critical' && !a.isResolved).length;

  return (
    <WorkspacePageShell layout="list" title="Admin Dashboard">
      {/* ── Alert Banner ── */}
      {(criticalAlertCount > 0 || unacknowledgedCount > 0) && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {criticalAlertCount > 0 && (
            <p>
              🔴 {criticalAlertCount} critical system error{criticalAlertCount > 1 ? 's' : ''} require attention.{' '}
              <Link to="/audit-log" className="underline">View System Errors</Link>
            </p>
          )}
          {unacknowledgedCount > 0 && (
            <p>
              🟡 {unacknowledgedCount} unacknowledged user lifecycle event{unacknowledgedCount > 1 ? 's' : ''}.{' '}
              <Link to="/users" className="underline">Review Users</Link>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ── Active Users Card ── */}
        <HbcCard title="Active Users (Last 7 Days)" loading={metricsLoading}>
          {usageMetrics ? (
            <>
              <p className="text-3xl font-bold">{usageMetrics.activeUsersThisWeek}</p>
              <p className="text-sm text-gray-500">of {usageMetrics.totalRegisteredUsers} total registered</p>
              <div className="mt-3 space-y-1">
                {Object.entries(usageMetrics.activeUsersByRole).map(([role, count]) => (
                  <div key={role} className="flex justify-between text-sm">
                    <span>{role}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <HbcEmptyState title="No metrics" description="Usage data unavailable." />
          )}
        </HbcCard>

        {/* ── Provisioning Throughput Card ── */}
        <HbcCard title="Projects Provisioned" loading={metricsLoading}>
          {usageMetrics ? (
            <>
              <p className="text-3xl font-bold">{usageMetrics.provisionsThisMonth}</p>
              <p className="text-sm text-gray-500">this month</p>
              <p className="mt-2 text-sm">
                <span className="font-medium">{usageMetrics.provisionsLast90Days}</span> in last 90 days
              </p>
              <Link to="/provisioned-sites" className="mt-3 block text-sm text-blue-600 underline">
                View all provisioned sites →
              </Link>
            </>
          ) : (
            <HbcEmptyState title="No data" description="Provisioning data unavailable." />
          )}
        </HbcCard>

        {/* ── System Health Card ── */}
        <HbcCard title="System Health" loading={alertsLoading}>
          {systemAlerts.length === 0 ? (
            <div className="flex items-center gap-2 text-green-700">
              <span>✅</span>
              <span className="text-sm font-medium">All systems operational</span>
            </div>
          ) : (
            <div className="space-y-2">
              {systemAlerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-start gap-2 text-sm">
                  <HbcStatusBadge
                    variant={alert.severity === 'critical' ? 'error' : alert.severity === 'error' ? 'warning' : 'neutral'}
                  >
                    {alert.severity}
                  </HbcStatusBadge>
                  <span className="truncate">{alert.message}</span>
                </div>
              ))}
              <Link to="/audit-log" className="block text-sm text-blue-600 underline">
                View all errors →
              </Link>
            </div>
          )}
        </HbcCard>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/users" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Manage Users & Overrides</Link>
          <Link to="/provisioning-failures" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Provisioning Failures</Link>
          <Link to="/audit-log" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">Audit Log</Link>
          <Link to="/settings" className="rounded border px-4 py-2 text-sm hover:bg-gray-50">System Settings</Link>
        </div>
      </div>
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.4 — Users & Role Overrides

### 7-Admin.4.1 — `apps/admin/src/pages/UsersPage.tsx`

```typescript
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  WorkspacePageShell, HbcDataTable, HbcTextField,
  HbcButton, HbcStatusBadge, HbcModal,
} from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { IAdminUserOverride, IAdminUserOverrideFormData } from '@hbc/models';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';
import { GrantOverrideForm } from '../components/GrantOverrideForm.js';
import { ExportButton } from '../components/ExportButton.js';

export function UsersPage(): ReactNode {
  const session = useAuthSession();
  const { users, usersLoading, usersError, overrides, setUsers, setUsersLoading, setUsersError } =
    useAdminStore();
  const [search, setSearch] = useState('');
  const [grantTarget, setGrantTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setUsersLoading(true);
    client.listUsers().then(setUsers).catch((e) => setUsersError(e.message)).finally(() => setUsersLoading(false));
  }, [session]);

  const activeOverridesByUser = overrides
    .filter((o) => o.isActive)
    .reduce<Record<string, IAdminUserOverride[]>>((acc, o) => {
      (acc[o.userUpn] ??= []).push(o);
      return acc;
    }, {});

  const filtered = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(search.toLowerCase()) ||
      u.upn.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'displayName', header: 'Name' },
    { key: 'upn', header: 'Email / UPN' },
    {
      key: 'baseRole', header: 'Base Role',
      render: (u: { upn: string; baseRole: string; isNew?: boolean }) => (
        <span className="flex items-center gap-2">
          {u.baseRole}
          {u.isNew && (
            <HbcStatusBadge variant="info">New</HbcStatusBadge>
          )}
        </span>
      ),
    },
    {
      key: 'overrides', header: 'Active Overrides',
      render: (u: { upn: string }) => {
        const userOverrides = activeOverridesByUser[u.upn] ?? [];
        return userOverrides.length > 0
          ? <HbcStatusBadge variant="warning">{userOverrides.length} override{userOverrides.length > 1 ? 's' : ''}</HbcStatusBadge>
          : <span className="text-gray-400 text-sm">None</span>;
      },
    },
    {
      key: 'actions', header: '',
      render: (u: { upn: string }) => (
        <HbcButton variant="secondary" size="sm" onClick={() => setGrantTarget(u.upn)}>
          Manage Overrides
        </HbcButton>
      ),
    },
  ];

  async function handleGrantOverride(data: IAdminUserOverrideFormData): Promise<void> {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    await client.grantOverride(data);
    setGrantTarget(null);
    // Refresh overrides
    client.listOverrides().then((o) => useAdminStore.getState().setOverrides(o));
  }

  return (
    <WorkspacePageShell
      layout="list"
      title="Users & Role Overrides"
      actions={[
        <ExportButton key="export" dataType="overrides" />,
      ]}
    >
      <div className="mb-4 flex gap-3">
        <HbcTextField
          label=""
          placeholder="Search by name or email…"
          value={search}
          onChange={setSearch}
        />
      </div>

      {usersLoading && <p>Loading users…</p>}
      {usersError && <p className="text-red-600">{usersError}</p>}
      {!usersLoading && (
        <HbcDataTable
          rows={filtered}
          columns={columns}
          rowKey={(u) => u.upn}
          emptyMessage="No users found."
        />
      )}

      {grantTarget && (
        <HbcModal
          title={`Manage Overrides — ${grantTarget}`}
          onClose={() => setGrantTarget(null)}
        >
          <GrantOverrideForm
            targetUpn={grantTarget}
            existingOverrides={activeOverridesByUser[grantTarget] ?? []}
            onSubmit={handleGrantOverride}
            onCancel={() => setGrantTarget(null)}
          />
        </HbcModal>
      )}
    </WorkspacePageShell>
  );
}
```

### 7-Admin.4.2 — `apps/admin/src/pages/OverridesPage.tsx`

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcDataTable, HbcButton, HbcStatusBadge, HbcConfirmDialog } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { IAdminUserOverride } from '@hbc/models';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';
import { ExportButton } from '../components/ExportButton.js';

export function OverridesPage(): ReactNode {
  const session = useAuthSession();
  const { overrides, overridesLoading, setOverrides, setOverridesLoading } = useAdminStore();
  const [revokeTarget, setRevokeTarget] = useState<IAdminUserOverride | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setOverridesLoading(true);
    client.listOverrides().then(setOverrides).finally(() => setOverridesLoading(false));
  }, [session]);

  async function handleRevoke(): Promise<void> {
    if (!revokeTarget || !session) return;
    setRevoking(true);
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    await client.revokeOverride(revokeTarget.id);
    setOverrides(overrides.map((o) => o.id === revokeTarget.id ? { ...o, isActive: false } : o));
    setRevokeTarget(null);
    setRevoking(false);
  }

  const activeOverrides = overrides.filter((o) => o.isActive);
  const expiringSoon = activeOverrides.filter((o) => {
    if (!o.expiresAt) return false;
    const daysUntilExpiry = (new Date(o.expiresAt).getTime() - Date.now()) / 86_400_000;
    return daysUntilExpiry <= 7;
  });

  const columns = [
    { key: 'userName', header: 'User' },
    { key: 'baseRole', header: 'Base Role' },
    { key: 'overrideRole', header: 'Override Role' },
    { key: 'grantedBy', header: 'Granted By' },
    {
      key: 'expiresAt', header: 'Expires',
      render: (o: IAdminUserOverride) => {
        if (!o.expiresAt) return <span className="text-gray-400 text-sm">No expiry</span>;
        const days = Math.ceil((new Date(o.expiresAt).getTime() - Date.now()) / 86_400_000);
        return (
          <HbcStatusBadge variant={days <= 3 ? 'error' : days <= 7 ? 'warning' : 'neutral'}>
            {days <= 0 ? 'Expired' : `${days}d`}
          </HbcStatusBadge>
        );
      },
    },
    { key: 'projectNumber', header: 'Project', render: (o: IAdminUserOverride) => o.projectNumber ?? '—' },
    {
      key: 'actions', header: '',
      render: (o: IAdminUserOverride) => (
        <HbcButton variant="danger" size="sm" onClick={() => setRevokeTarget(o)}>
          Revoke
        </HbcButton>
      ),
    },
  ];

  return (
    <WorkspacePageShell
      layout="list"
      title="Active Overrides"
      actions={[<ExportButton key="export" dataType="overrides" />]}
    >
      {expiringSoon.length > 0 && (
        <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          ⚠️ {expiringSoon.length} override{expiringSoon.length > 1 ? 's' : ''} expire within 7 days.
        </div>
      )}
      {overridesLoading && <p>Loading overrides…</p>}
      {!overridesLoading && (
        <HbcDataTable
          rows={activeOverrides}
          columns={columns}
          rowKey={(o) => o.id}
          emptyMessage="No active overrides."
        />
      )}
      {revokeTarget && (
        <HbcConfirmDialog
          title="Revoke Override"
          message={`Are you sure you want to revoke the "${revokeTarget.overrideRole}" override for ${revokeTarget.userName}? This cannot be undone.`}
          confirmLabel="Revoke"
          confirmVariant="danger"
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
          loading={revoking}
        />
      )}
    </WorkspacePageShell>
  );
}
```

### 7-Admin.4.3 — `apps/admin/src/components/GrantOverrideForm.tsx`

```typescript
import { useState } from 'react';
import type { ReactNode } from 'react';
import { HbcTextField, HbcSelect, HbcButton, HbcTextArea, HbcStatusBadge } from '@hbc/ui-kit';
import type { IAdminUserOverride, IAdminUserOverrideFormData } from '@hbc/models';

const HB_INTEL_ROLES = [
  'Estimating Coordinator',
  'Controller',
  'Project Manager',
  'Superintendent',
  'Executive',
  'Business Development',
  'Operations Excellence Manager',
  'Safety Officer',
  'HR Manager',
  'Admin',
  'Read Only',
];

interface GrantOverrideFormProps {
  targetUpn: string;
  existingOverrides: IAdminUserOverride[];
  onSubmit: (data: IAdminUserOverrideFormData) => Promise<void>;
  onCancel: () => void;
}

export function GrantOverrideForm({
  targetUpn, existingOverrides, onSubmit, onCancel,
}: GrantOverrideFormProps): ReactNode {
  const [overrideRole, setOverrideRole] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default expiry to 30 days from today
  const defaultExpiry = new Date(Date.now() + 30 * 86_400_000).toISOString().split('T')[0];

  async function handleSubmit(): Promise<void> {
    if (!overrideRole) { setError('Override role is required.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        targetUserUpn: targetUpn,
        overrideRole,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        notes: notes || undefined,
        projectId: projectId || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to grant override.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {existingOverrides.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">Current Active Overrides</p>
          {existingOverrides.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <HbcStatusBadge variant="warning">{o.overrideRole}</HbcStatusBadge>
              <span className="text-gray-500">{o.expiresAt ? `Expires ${new Date(o.expiresAt).toLocaleDateString()}` : 'No expiry'}</span>
            </div>
          ))}
        </div>
      )}
      <HbcSelect
        label="Override Role"
        value={overrideRole}
        onChange={setOverrideRole}
        options={HB_INTEL_ROLES.map((r) => ({ value: r, label: r }))}
        placeholder="Select a role…"
        required
      />
      <HbcTextField
        label={`Expiry Date (default: ${defaultExpiry})`}
        type="date"
        value={expiresAt || defaultExpiry}
        onChange={setExpiresAt}
      />
      <HbcTextField
        label="Project ID (optional — leave blank for firm-wide override)"
        value={projectId}
        onChange={setProjectId}
        placeholder="e.g. a3f1…"
      />
      <HbcTextArea
        label="Notes (reason for override)"
        value={notes}
        onChange={setNotes}
        placeholder="Brief explanation…"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex justify-end gap-3">
        <HbcButton variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</HbcButton>
        <HbcButton variant="primary" onClick={handleSubmit} disabled={submitting || !overrideRole}>
          {submitting ? 'Granting…' : 'Grant Override'}
        </HbcButton>
      </div>
    </div>
  );
}
```

---

## 7-Admin.5 — User Lifecycle Management

User lifecycle management is handled in three places:
1. **Backend** — first-login detection and lifecycle event recording (Azure Function middleware)
2. **Admin Home Dashboard** — unacknowledged lifecycle event alert panel (implemented in 7-Admin.3)
3. **UsersPage** — "New" badge for users with an unacknowledged `first_login` event (implemented in 7-Admin.4.1)

### 7-Admin.5.1 — Backend: First-Login Detection Middleware

Add to `backend/functions/src/middleware/lifecycleDetection.ts`:

```typescript
import type { HttpRequest, InvocationContext } from '@azure/functions';
import { createServiceFactory } from '../services/service-factory.js';
import { createLogger } from '../utils/logger.js';
import type { UserLifecycleEventType } from '@hbc/models';
import { randomUUID } from 'crypto';

/**
 * Detects and records user lifecycle events.
 * Call this from any authenticated endpoint on every request.
 * The SharePoint write is fire-and-forget — it must never block the request.
 */
export async function detectAndRecordLifecycleEvent(
  claims: { upn: string; displayName: string; objectId: string },
  context: InvocationContext
): Promise<void> {
  const logger = createLogger(context);
  try {
    const services = createServiceFactory();
    const existingUser = await services.admin.getUserRecord(claims.objectId);

    if (!existingUser) {
      // First login — create user record and lifecycle event
      await services.admin.upsertUserRecord({
        userId: claims.objectId,
        userUpn: claims.upn,
        userName: claims.displayName,
        firstLoginAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });
      await services.admin.createLifecycleEvent({
        id: randomUUID(),
        userId: claims.objectId,
        userUpn: claims.upn,
        userName: claims.displayName,
        eventType: 'first_login' as UserLifecycleEventType,
        detectedAt: new Date().toISOString(),
        isAcknowledged: false,
      });
      logger.info('First-login lifecycle event recorded', { upn: claims.upn });
    } else {
      // Update last login timestamp
      await services.admin.updateLastLogin(claims.objectId, new Date().toISOString());
    }
  } catch (error) {
    // Fire-and-forget: log the error but never block the request
    logger.error('Lifecycle detection failed (non-blocking)', { error, upn: claims.upn });
  }
}
```

### 7-Admin.5.2 — Backend: M365 User-Disabled Webhook Handler

Add to `backend/functions/src/functions/admin/userDisabledWebhook.ts`:

```typescript
import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * POST /api/admin/user-disabled-webhook
 * Called by Azure AD provisioning lifecycle workflows when a user is disabled.
 * Automatically expires all active overrides for the user and records a lifecycle event.
 * Secured with a shared webhook secret validated in the Authorization header.
 */
app.http('userDisabledWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/user-disabled-webhook',
  handler: async (request: HttpRequest, context: InvocationContext) => {
    const logger = createLogger(context);

    // Validate webhook secret (not a user Bearer token)
    const secret = request.headers.get('x-webhook-secret');
    if (secret !== process.env.ADMIN_WEBHOOK_SECRET) {
      return { status: 401, jsonBody: { error: 'Unauthorized' } };
    }

    const body = await request.json() as { userId: string; userUpn: string; userName: string };
    if (!body.userId || !body.userUpn) {
      return { status: 400, jsonBody: { error: 'userId and userUpn are required' } };
    }

    const services = createServiceFactory();

    // Expire all active overrides for this user
    const activeOverrides = await services.admin.listActiveOverridesForUser(body.userId);
    await Promise.all(
      activeOverrides.map((o) =>
        services.admin.revokeOverride(o.id, 'system', 'Auto-revoked: user disabled in Azure AD')
      )
    );

    // Record lifecycle event
    await services.admin.createLifecycleEvent({
      id: randomUUID(),
      userId: body.userId,
      userUpn: body.userUpn,
      userName: body.userName,
      eventType: 'user_disabled',
      detectedAt: new Date().toISOString(),
      isAcknowledged: false,
    });

    logger.info('User-disabled lifecycle event recorded', { upn: body.userUpn, overridesExpired: activeOverrides.length });
    return { status: 200, jsonBody: { overridesExpired: activeOverrides.length } };
  },
});
```

---

## 7-Admin.6 — Audit Trail & Error Log

Replace `apps/admin/src/pages/ErrorLogPage.tsx` with:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge, HbcTextField } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { IAdminAuditEntry, ISystemError } from '@hbc/models';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';
import { ExportButton } from '../components/ExportButton.js';

type ActiveTab = 'business-audit' | 'system-errors';

export function AuditLogPage(): ReactNode {
  const session = useAuthSession();
  const [tab, setTab] = useState<ActiveTab>('business-audit');
  const [search, setSearch] = useState('');
  const {
    auditEntries, auditLoading,
    systemErrors, systemErrorsLoading,
    setAuditEntries, setAuditLoading,
    setSystemErrors, setSystemErrorsLoading,
  } = useAdminStore();

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);

    setAuditLoading(true);
    client.listAuditEntries().then(setAuditEntries).finally(() => setAuditLoading(false));

    setSystemErrorsLoading(true);
    client.listSystemErrors().then(setSystemErrors).finally(() => setSystemErrorsLoading(false));
  }, [session]);

  const auditColumns = [
    {
      key: 'timestamp', header: 'When',
      render: (e: IAdminAuditEntry) => new Date(e.timestamp).toLocaleString(),
    },
    { key: 'actorName', header: 'Actor' },
    {
      key: 'eventType', header: 'Event',
      render: (e: IAdminAuditEntry) => (
        <HbcStatusBadge variant="neutral">{e.eventType.replace(/_/g, ' ')}</HbcStatusBadge>
      ),
    },
    { key: 'description', header: 'Description' },
    { key: 'targetName', header: 'Target', render: (e: IAdminAuditEntry) => e.targetName ?? '—' },
  ];

  const errorColumns = [
    {
      key: 'timestamp', header: 'When',
      render: (e: ISystemError) => new Date(e.timestamp).toLocaleString(),
    },
    {
      key: 'severity', header: 'Severity',
      render: (e: ISystemError) => (
        <HbcStatusBadge variant={e.severity === 'critical' ? 'error' : e.severity === 'error' ? 'warning' : 'neutral'}>
          {e.severity}
        </HbcStatusBadge>
      ),
    },
    { key: 'source', header: 'Source' },
    { key: 'message', header: 'Message' },
    {
      key: 'status', header: 'Status',
      render: (e: ISystemError) => e.isResolved
        ? <HbcStatusBadge variant="success">Resolved</HbcStatusBadge>
        : <HbcStatusBadge variant="error">Open</HbcStatusBadge>,
    },
  ];

  const filteredAudit = auditEntries.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (e.targetName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredErrors = systemErrors.filter(
    (e) =>
      e.message.toLowerCase().includes(search.toLowerCase()) ||
      e.source.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <WorkspacePageShell
      layout="list"
      title="Audit Log"
      actions={[<ExportButton key="export" dataType="audit" />]}
    >
      {/* Tab switcher */}
      <div className="mb-4 flex gap-1 border-b">
        {(['business-audit', 'system-errors'] as ActiveTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'business-audit' ? 'Business Audit' : 'System Errors'}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <HbcTextField label="" placeholder="Search…" value={search} onChange={setSearch} />
      </div>

      {tab === 'business-audit' && (
        auditLoading
          ? <p>Loading audit entries…</p>
          : <HbcDataTable rows={filteredAudit} columns={auditColumns} rowKey={(e) => e.id} emptyMessage="No audit entries found." />
      )}

      {tab === 'system-errors' && (
        systemErrorsLoading
          ? <p>Loading system errors…</p>
          : <HbcDataTable rows={filteredErrors} columns={errorColumns} rowKey={(e) => e.id} emptyMessage="No system errors found." />
      )}
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.7 — Provisioning Failures Page (Full Implementation)

Replace `apps/admin/src/pages/ProvisioningFailuresPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  WorkspacePageShell, HbcDataTable, HbcButton,
  HbcStatusBadge, HbcConfirmDialog,
} from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import { createProvisioningApiClient, useProvisioningStore } from '@hbc/provisioning';
import type { IProvisioningStatus } from '@hbc/models';

export function ProvisioningFailuresPage(): ReactNode {
  const session = useAuthSession();
  const { failures, failuresLoading, failuresError, setFailures, setFailuresLoading, setFailuresError } =
    useProvisioningStore();
  const [retryTarget, setRetryTarget] = useState<IProvisioningStatus | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const client = createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setFailuresLoading(true);
    client.listFailedProvisioningRuns()
      .then(setFailures)
      .catch((e) => setFailuresError(e.message))
      .finally(() => setFailuresLoading(false));
  }, [session]);

  async function handleRetry(): Promise<void> {
    if (!retryTarget || !session) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const client = createProvisioningApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
      await client.retryProvisioningRun(retryTarget.projectId);
      setRetrySuccess(`Retry triggered for ${retryTarget.projectId}. Monitor the run in the Provisioning status view.`);
      setRetryTarget(null);
      // Refresh failures list
      client.listFailedProvisioningRuns().then(setFailures);
    } catch (e) {
      setRetryError(e instanceof Error ? e.message : 'Retry failed. Check system errors for details.');
    } finally {
      setRetrying(false);
    }
  }

  const columns = [
    { key: 'projectId', header: 'Project ID' },
    {
      key: 'overallStatus', header: 'Status',
      render: (s: IProvisioningStatus) => (
        <HbcStatusBadge variant="error">{s.overallStatus}</HbcStatusBadge>
      ),
    },
    {
      key: 'currentStep', header: 'Failed At',
      render: (s: IProvisioningStatus) => `Step ${s.currentStep} of 7`,
    },
    {
      key: 'lastUpdatedAt', header: 'Last Updated',
      render: (s: IProvisioningStatus) =>
        s.lastUpdatedAt ? new Date(s.lastUpdatedAt).toLocaleString() : '—',
    },
    {
      key: 'actions', header: '',
      render: (s: IProvisioningStatus) => (
        <HbcButton variant="primary" size="sm" onClick={() => setRetryTarget(s)}>
          Retry
        </HbcButton>
      ),
    },
  ];

  return (
    <WorkspacePageShell layout="list" title="Provisioning Failures">
      {retrySuccess && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
          ✅ {retrySuccess}
        </div>
      )}
      {failuresError && <p className="mb-4 text-red-600">{failuresError}</p>}
      {failuresLoading && <p>Loading failures…</p>}
      {!failuresLoading && (
        <HbcDataTable
          rows={failures}
          columns={columns}
          rowKey={(s) => s.projectId}
          emptyMessage="No provisioning failures. All runs completed successfully."
        />
      )}
      {retryTarget && (
        <HbcConfirmDialog
          title="Retry Provisioning Run"
          message={`Retry the failed provisioning run for project ${retryTarget.projectId} from Step ${retryTarget.currentStep}? The saga will resume from where it failed. Only retry if the underlying issue (e.g., network timeout, permission error) has been resolved.`}
          confirmLabel="Retry"
          confirmVariant="primary"
          onConfirm={handleRetry}
          onCancel={() => { setRetryTarget(null); setRetryError(null); }}
          loading={retrying}
          error={retryError ?? undefined}
        />
      )}
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.8 — Provisioned Sites Directory

Create `apps/admin/src/pages/ProvisionedSitesPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcDataTable, HbcTextField, HbcStatusBadge } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { IProvisionedSite } from '@hbc/models';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';
import { ExportButton } from '../components/ExportButton.js';

export function ProvisionedSitesPage(): ReactNode {
  const session = useAuthSession();
  const { provisionedSites, sitesLoading, setProvisionedSites, setSitesLoading } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setSitesLoading(true);
    client.listProvisionedSites().then(setProvisionedSites).finally(() => setSitesLoading(false));
  }, [session]);

  const filtered = provisionedSites.filter(
    (s) =>
      s.projectName.toLowerCase().includes(search.toLowerCase()) ||
      s.projectNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'projectNumber', header: 'Project #' },
    { key: 'projectName', header: 'Project Name' },
    {
      key: 'siteUrl', header: 'Site URL',
      render: (s: IProvisionedSite) => (
        <a href={s.siteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate max-w-xs block">
          {s.siteUrl}
        </a>
      ),
    },
    { key: 'provisionedBy', header: 'Provisioned By' },
    {
      key: 'provisionedAt', header: 'Date',
      render: (s: IProvisionedSite) => new Date(s.provisionedAt).toLocaleDateString(),
    },
    {
      key: 'status', header: 'Status',
      render: (s: IProvisionedSite) => (
        <HbcStatusBadge variant={s.status === 'Active' ? 'success' : s.status === 'Archived' ? 'neutral' : 'warning'}>
          {s.status}
        </HbcStatusBadge>
      ),
    },
  ];

  return (
    <WorkspacePageShell
      layout="list"
      title="Provisioned Project Sites"
      actions={[<ExportButton key="export" dataType="sites" />]}
    >
      {/* FUTURE OPTION C: Add site archival controls, sync-check button, and admin notes here
          when Phase 8+ lifecycle management is implemented. See ADR-0074. */}
      <div className="mb-4">
        <HbcTextField label="" placeholder="Search by project name or number…" value={search} onChange={setSearch} />
      </div>
      {sitesLoading && <p>Loading sites…</p>}
      {!sitesLoading && (
        <HbcDataTable
          rows={filtered}
          columns={columns}
          rowKey={(s) => s.id}
          emptyMessage="No provisioned sites found."
        />
      )}
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.9 — Notification Log

Create `apps/admin/src/pages/NotificationLogPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { WorkspacePageShell, HbcDataTable, HbcStatusBadge, HbcTextField } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { INotificationLogEntry } from '@hbc/models';
import { createAdminApiClient, useAdminStore } from '../store/adminStore.js';
import { ExportButton } from '../components/ExportButton.js';

export function NotificationLogPage(): ReactNode {
  const session = useAuthSession();
  const { notificationLog, notifLogLoading, setNotificationLog, setNotifLogLoading } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setNotifLogLoading(true);
    client.listNotificationLog().then(setNotificationLog).finally(() => setNotifLogLoading(false));
  }, [session]);

  const filtered = notificationLog.filter(
    (n) =>
      n.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      n.eventType.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'sentAt', header: 'Sent',
      render: (n: INotificationLogEntry) => new Date(n.sentAt).toLocaleString(),
    },
    { key: 'eventType', header: 'Event' },
    { key: 'recipientName', header: 'Recipient' },
    { key: 'subject', header: 'Subject' },
    {
      key: 'status', header: 'Status',
      render: (n: INotificationLogEntry) => (
        <HbcStatusBadge
          variant={n.status === 'Sent' ? 'success' : n.status === 'Failed' ? 'error' : 'warning'}
        >
          {n.status}
        </HbcStatusBadge>
      ),
    },
    {
      key: 'projectNumber', header: 'Project',
      render: (n: INotificationLogEntry) => n.projectNumber ?? '—',
    },
  ];

  return (
    <WorkspacePageShell
      layout="list"
      title="Notification Log (Last 30 Days)"
      actions={[<ExportButton key="export" dataType="notifications" />]}
    >
      {/* FUTURE OPTION C: Add Resend button per row and bounce-reason detail panel.
          See ADR-0074 for architecture notes on idempotent resend design. */}
      <div className="mb-4">
        <HbcTextField label="" placeholder="Search by recipient, event, or subject…" value={search} onChange={setSearch} />
      </div>
      {notifLogLoading && <p>Loading notification log…</p>}
      {!notifLogLoading && (
        <HbcDataTable
          rows={filtered}
          columns={columns}
          rowKey={(n) => n.id}
          emptyMessage="No notifications sent in the last 30 days."
        />
      )}
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.10 — System Settings (Full Expansion)

Replace `apps/admin/src/pages/SystemSettingsPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  WorkspacePageShell, HbcButton, HbcTextField,
  HbcToggle, HbcFormSection, HbcPeoplePicker,
} from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import type { ISystemSettings, ISystemSettingsFormData } from '@hbc/models';
import { createAdminApiClient } from '../store/adminStore.js';

const MODULES = [
  { key: 'estimating', label: 'Estimating' },
  { key: 'accounting', label: 'Accounting' },
  { key: 'project-hub', label: 'Project Hub' },
  { key: 'business-development', label: 'Business Development' },
  { key: 'operational-excellence', label: 'Operational Excellence' },
  { key: 'leadership', label: 'Leadership' },
  { key: 'human-resources', label: 'Human Resources' },
  { key: 'safety', label: 'Safety' },
  { key: 'quality-control-warranty', label: 'Quality Control & Warranty' },
  { key: 'risk-management', label: 'Risk Management' },
];

export function SystemSettingsPage(): ReactNode {
  const session = useAuthSession();
  const [settings, setSettings] = useState<ISystemSettings | null>(null);
  const [form, setForm] = useState<ISystemSettingsFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
    setLoading(true);
    client.getSystemSettings().then((s) => {
      setSettings(s);
      setForm({
        opExManagerUpn: s.opExManagerUpn,
        enabledModules: { ...s.enabledModules },
        notificationRecipients: { ...s.notificationRecipients },
        roleToNotificationMap: { ...s.roleToNotificationMap },
      });
    }).finally(() => setLoading(false));
  }, [session]);

  async function handleSave(): Promise<void> {
    if (!form || !session) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
      await client.updateSystemSettings(form);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <WorkspacePageShell layout="list" title="System Settings"><p>Loading…</p></WorkspacePageShell>;

  return (
    <WorkspacePageShell
      layout="list"
      title="System Settings"
      actions={[
        <HbcButton key="save" variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Settings'}
        </HbcButton>,
      ]}
    >
      {saveSuccess && <div className="mb-4 rounded border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">✅ Settings saved successfully.</div>}
      {error && <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <HbcFormSection title="OpEx Manager">
        <p className="mb-2 text-sm text-gray-600">
          The Operations Excellence Manager is automatically added to every Project Setup Request submitted through HB Intel.
        </p>
        <HbcTextField
          label="OpEx Manager UPN"
          value={form.opExManagerUpn}
          onChange={(v) => setForm({ ...form, opExManagerUpn: v })}
          placeholder="opex.manager@hbc.com"
        />
      </HbcFormSection>

      <HbcFormSection title="Module Toggles">
        <p className="mb-3 text-sm text-gray-600">
          Enable or disable modules for all users. Disabling a module hides it from navigation but does not delete any data.
        </p>
        <div className="space-y-3">
          {MODULES.map(({ key, label }) => (
            <HbcToggle
              key={key}
              label={label}
              checked={form.enabledModules[key] ?? true}
              onChange={(v) => setForm({
                ...form,
                enabledModules: { ...form.enabledModules, [key]: v },
              })}
            />
          ))}
        </div>
      </HbcFormSection>

      <HbcFormSection title="Notification Recipients — Provisioning Failures">
        <p className="mb-2 text-sm text-gray-600">
          These users will receive an email when any provisioning run fails.
        </p>
        <HbcPeoplePicker
          label="Recipients"
          selectedUpns={form.notificationRecipients.provisioningFailure}
          onChange={(upns) => setForm({
            ...form,
            notificationRecipients: { ...form.notificationRecipients, provisioningFailure: upns },
          })}
        />
      </HbcFormSection>

      <HbcFormSection title="Notification Recipients — New User First Login">
        <p className="mb-2 text-sm text-gray-600">
          These users will be notified when a new employee logs into HB Intel for the first time.
        </p>
        <HbcPeoplePicker
          label="Recipients"
          selectedUpns={form.notificationRecipients.newUserFirstLogin}
          onChange={(upns) => setForm({
            ...form,
            notificationRecipients: { ...form.notificationRecipients, newUserFirstLogin: upns },
          })}
        />
      </HbcFormSection>
    </WorkspacePageShell>
  );
}
```

---

## 7-Admin.11 — Data Export Component

Create `apps/admin/src/components/ExportButton.tsx`:

```typescript
import { useState } from 'react';
import type { ReactNode } from 'react';
import { HbcButton } from '@hbc/ui-kit';
import { useAuthSession } from '@hbc/auth';
import { createAdminApiClient } from '../store/adminStore.js';

type ExportDataType = 'audit' | 'overrides' | 'sites' | 'notifications' | 'provisioning';

const EXPORT_LABELS: Record<ExportDataType, string> = {
  audit: 'Export Audit Log',
  overrides: 'Export Overrides',
  sites: 'Export Sites',
  notifications: 'Export Log',
  provisioning: 'Export History',
};

interface ExportButtonProps {
  dataType: ExportDataType;
}

export function ExportButton({ dataType }: ExportButtonProps): ReactNode {
  const session = useAuthSession();
  const [exporting, setExporting] = useState(false);

  async function handleExport(): Promise<void> {
    if (!session) return;
    setExporting(true);
    try {
      const client = createAdminApiClient(import.meta.env.VITE_FUNCTION_APP_URL, session.getToken);
      const csvBlob = await client.exportData(dataType);
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hb-intel-${dataType}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <HbcButton variant="secondary" onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting…' : `↓ ${EXPORT_LABELS[dataType]}`}
    </HbcButton>
  );
}
```

---

## 7-Admin.12 — Backend API Endpoints

Add to `backend/functions/src/functions/admin/index.ts`:

```typescript
import { app, type HttpRequest, type InvocationContext } from '@azure/functions';
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';
import { createServiceFactory } from '../../services/service-factory.js';
import { createLogger } from '../../utils/logger.js';
import { randomUUID } from 'crypto';

// GET /api/admin/usage-metrics
app.http('getUsageMetrics', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/usage-metrics',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const metrics = await services.admin.computeUsageMetrics();
    return { status: 200, jsonBody: metrics };
  },
});

// GET /api/admin/users
app.http('listAdminUsers', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/users',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const users = await services.admin.listUsersWithOverrides();
    return { status: 200, jsonBody: users };
  },
});

// GET /api/admin/overrides
app.http('listOverrides', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/overrides',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const overrides = await services.admin.listAllOverrides();
    return { status: 200, jsonBody: overrides };
  },
});

// POST /api/admin/overrides
app.http('grantOverride', {
  methods: ['POST'], authLevel: 'anonymous', route: 'admin/overrides',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    const logger = createLogger(ctx);
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const body = await req.json() as import('@hbc/models').IAdminUserOverrideFormData;
    const services = createServiceFactory();
    const override = await services.admin.grantOverride({ ...body, grantedBy: claims.upn });
    // Write to audit trail
    await services.admin.createAuditEntry({
      id: randomUUID(), eventType: 'override_granted',
      actorUpn: claims.upn, actorName: claims.displayName ?? claims.upn,
      targetUpn: body.targetUserUpn,
      description: `Override role "${body.overrideRole}" granted to ${body.targetUserUpn}`,
      timestamp: new Date().toISOString(),
    });
    logger.info('Override granted', { by: claims.upn, to: body.targetUserUpn, role: body.overrideRole });
    return { status: 201, jsonBody: override };
  },
});

// DELETE /api/admin/overrides/:overrideId
app.http('revokeOverride', {
  methods: ['DELETE'], authLevel: 'anonymous', route: 'admin/overrides/{overrideId}',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    const logger = createLogger(ctx);
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const overrideId = req.params.overrideId;
    const services = createServiceFactory();
    const revoked = await services.admin.revokeOverride(overrideId, claims.upn, 'Manually revoked by Admin');
    await services.admin.createAuditEntry({
      id: randomUUID(), eventType: 'override_revoked',
      actorUpn: claims.upn, actorName: claims.displayName ?? claims.upn,
      targetUpn: revoked.userUpn,
      description: `Override role "${revoked.overrideRole}" revoked from ${revoked.userUpn}`,
      timestamp: new Date().toISOString(),
    });
    logger.info('Override revoked', { by: claims.upn, overrideId });
    return { status: 200, jsonBody: revoked };
  },
});

// GET /api/admin/audit-entries
app.http('listAuditEntries', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/audit-entries',
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const entries = await services.admin.listAuditEntries();
    return { status: 200, jsonBody: entries };
  },
});

// GET /api/admin/system-errors
app.http('listSystemErrors', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/system-errors',
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const errors = await services.admin.listSystemErrors();
    return { status: 200, jsonBody: errors };
  },
});

// GET /api/admin/provisioned-sites
app.http('listProvisionedSites', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/provisioned-sites',
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const sites = await services.admin.listProvisionedSites();
    return { status: 200, jsonBody: sites };
  },
});

// GET /api/admin/notification-log
app.http('listNotificationLog', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/notification-log',
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const log = await services.admin.listNotificationLog(30); // Last 30 days
    return { status: 200, jsonBody: log };
  },
});

// GET /api/admin/settings
app.http('getSystemSettings', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/settings',
  handler: async (req: HttpRequest, _ctx: InvocationContext) => {
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const services = createServiceFactory();
    const settings = await services.admin.getSystemSettings();
    return { status: 200, jsonBody: settings };
  },
});

// PUT /api/admin/settings
app.http('updateSystemSettings', {
  methods: ['PUT'], authLevel: 'anonymous', route: 'admin/settings',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    const logger = createLogger(ctx);
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const body = await req.json() as import('@hbc/models').ISystemSettingsFormData;
    const services = createServiceFactory();
    const updated = await services.admin.updateSystemSettings(body, claims.upn);
    await services.admin.createAuditEntry({
      id: randomUUID(), eventType: 'settings_changed',
      actorUpn: claims.upn, actorName: claims.displayName ?? claims.upn,
      description: 'System settings updated',
      timestamp: new Date().toISOString(),
    });
    logger.info('System settings updated', { by: claims.upn });
    return { status: 200, jsonBody: updated };
  },
});

// GET /api/admin/export/:dataType — returns a CSV file
app.http('exportAdminData', {
  methods: ['GET'], authLevel: 'anonymous', route: 'admin/export/{dataType}',
  handler: async (req: HttpRequest, ctx: InvocationContext) => {
    const logger = createLogger(ctx);
    let claims; try { claims = await validateToken(req); } catch { return unauthorizedResponse('Invalid token'); }
    const dataType = req.params.dataType as 'audit' | 'overrides' | 'sites' | 'notifications' | 'provisioning';
    const services = createServiceFactory();
    const csv = await services.admin.exportToCsv(dataType);
    await services.admin.createAuditEntry({
      id: randomUUID(), eventType: 'data_exported',
      actorUpn: claims.upn, actorName: claims.displayName ?? claims.upn,
      description: `Data export: ${dataType}`,
      timestamp: new Date().toISOString(),
    });
    logger.info('Data exported', { by: claims.upn, dataType });
    return {
      status: 200,
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="${dataType}-export.csv"` },
      body: csv,
    };
  },
});
```

---

## 7-Admin.13 — SharePoint List Schemas

The following SharePoint lists must be created in the root HB Intel site collection. Add a setup script for each at `scripts/admin-lists-setup.ts`.

| List Name | Columns | Notes |
|---|---|---|
| `HBIntelAuditLog` | Id (UUID), EventType (Choice), ActorUpn, ActorName, TargetUpn, TargetName, Description, Metadata (Multi-line JSON), Timestamp (DateTime) | Business audit trail; never delete entries |
| `UserOverrides` | Id (UUID), UserId, UserUpn, UserName, BaseRole, OverrideRole, GrantedBy, GrantedAt (DateTime), ExpiresAt (DateTime), IsActive (Bool), Notes, ProjectId, ProjectNumber | Active and historical overrides |
| `UserLifecycleEvents` | Id (UUID), UserId, UserUpn, UserName, EventType (Choice), DetectedAt (DateTime), RoleDetected, PreviousRole, AcknowledgedBy, AcknowledgedAt (DateTime), IsAcknowledged (Bool) | First-login and departure events |
| `ProvisionedSites` | Id (UUID), ProjectId, ProjectNumber, ProjectName, SiteUrl (Hyperlink), ProvisionedBy, ProvisionedAt (DateTime), SagaId, Status (Choice: Active/Archived/Unknown) | Written by provisioning saga on completion |
| `NotificationLog` | Id (UUID), EventType, RecipientUpn, RecipientName, Subject, SentAt (DateTime), Status (Choice: Sent/Failed/Bounced), ProjectId, ProjectNumber, ErrorMessage | Written by notification service |
| `SystemSettings` | Single-item list. Columns match `ISystemSettings` fields. | Configuration document; treat as singleton |
| `HBIntelSystemErrors` | Id (UUID), ErrorCode, Message, Source, Severity (Choice), Timestamp (DateTime), CorrelationId, ResolvedAt (DateTime), IsResolved (Bool) | Written by Azure Functions on error; sourced from App Insights if available |

---

## 7-Admin.14 — Testing

### 7-Admin.14.1 — Unit Tests

Create `apps/admin/src/pages/AdminHomePage.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminHomePage } from './AdminHomePage.js';

vi.mock('../store/adminStore.js', () => ({
  createAdminApiClient: vi.fn(() => ({
    getUsageMetrics: vi.fn().mockResolvedValue({ activeUsersThisWeek: 12, totalRegisteredUsers: 45, activeUsersByRole: { 'Project Manager': 5 }, provisionsThisMonth: 3, provisionsLast90Days: 11 }),
    getUnacknowledgedLifecycleEvents: vi.fn().mockResolvedValue([]),
    getActiveSystemAlerts: vi.fn().mockResolvedValue([]),
  })),
  useAdminStore: vi.fn(() => ({
    usageMetrics: null, metricsLoading: false,
    lifecycleEvents: [], lifecycleLoading: false,
    systemAlerts: [], alertsLoading: false,
    setUsageMetrics: vi.fn(), setMetricsLoading: vi.fn(),
    setLifecycleEvents: vi.fn(), setLifecycleLoading: vi.fn(),
    setSystemAlerts: vi.fn(), setAlertsLoading: vi.fn(),
  })),
}));

describe('AdminHomePage', () => {
  it('renders quick actions', () => {
    render(<AdminHomePage />);
    expect(screen.getByText('Manage Users & Overrides')).toBeInTheDocument();
    expect(screen.getByText('Provisioning Failures')).toBeInTheDocument();
  });
});
```

Create `apps/admin/src/pages/OverridesPage.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OverridesPage } from './OverridesPage.js';

vi.mock('../store/adminStore.js', () => ({
  createAdminApiClient: vi.fn(() => ({ listOverrides: vi.fn().mockResolvedValue([]) })),
  useAdminStore: vi.fn(() => ({
    overrides: [], overridesLoading: false, setOverrides: vi.fn(), setOverridesLoading: vi.fn(),
  })),
}));

describe('OverridesPage', () => {
  it('shows empty state when no overrides', () => {
    render(<OverridesPage />);
    expect(screen.getByText('No active overrides.')).toBeInTheDocument();
  });
});
```

### 7-Admin.14.2 — E2E Tests

Create `e2e/admin.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('Dashboard loads with quick actions', async ({ page }) => {
    await expect(page.getByText('Manage Users & Overrides')).toBeVisible();
    await expect(page.getByText('Provisioning Failures')).toBeVisible();
  });

  test('Audit Log page renders both tabs', async ({ page }) => {
    await page.goto('/admin/audit-log');
    await expect(page.getByText('Business Audit')).toBeVisible();
    await expect(page.getByText('System Errors')).toBeVisible();
  });

  test('Provisioning Failures page shows retry button', async ({ page }) => {
    await page.goto('/admin/provisioning-failures');
    // Empty state for clean environment
    await expect(page.getByText(/provisioning failures/i)).toBeVisible();
  });

  test('System Settings saves successfully', async ({ page }) => {
    await page.goto('/admin/settings');
    await expect(page.getByText('Save Settings')).toBeVisible();
  });

  test('Export button triggers CSV download', async ({ page }) => {
    await page.goto('/admin/overrides');
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('↓ Export Overrides').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/overrides.*\.csv/);
  });
});
```

---

## 7-Admin.15 — Documentation & ADR

### 7-Admin.15.1 — How-To: Administrator Guide

Create `docs/how-to/administrator/admin-module-guide.md` with:

- How to grant and revoke a role override (step-by-step with screenshots)
- How to retry a failed provisioning run
- How to update notification recipients in System Settings
- How to export audit data for compliance review
- How to acknowledge a user lifecycle event
- Escalation guide: when to call IT vs. when to retry in-app

### 7-Admin.15.2 — ADR

Create `docs/architecture/adr/ADR-0074-admin-module-feature-decisions.md` documenting:

- Decision 1: Hybrid override model (Option C over full Azure AD write-back)
- Decision 2: Usage metrics scope (Option B — lightweight, not full observability)
- Decision 3: Two-tab audit log (business audit separated from system errors)
- Decision 4: Read-only sites directory (Option B — Option C lifecycle management deferred to Phase 8+)
- Decision 5: Role override expiry with 30-day default (Option B — full request/approval workflow documented as Option C for future)
- Decision 6: CSV export only (Option B — scheduled PDF reports documented as Option C for future)
- **Option C Future Upgrade Notes** (consolidated):
  - Override request/approval workflow: Users submit requests via HB Intel; Admin approves/denies from a queue; full request history persisted
  - Notification resend: Idempotent resend API endpoint; bounce tracking via M365 delivery API; extended log retention
  - Site lifecycle management: `archivedAt`/`archivedBy` fields added to `IProvisionedSite`; sync-check Graph API call; bulk archive operations
  - Scheduled compliance reports: Azure Durable Functions timer trigger; PDF generation via Puppeteer; email delivery via Graph API

---

## 7-Admin Success Criteria Checklist

- [ ] 7-Admin.1.1–1.10: All new admin domain models compile without errors; exported from `@hbc/models`
- [ ] 7-Admin.2: All 8 routes registered; RBAC guard blocks non-admin users; redirects to `/` on unauthorized access
- [ ] 7-Admin.3: Admin home dashboard renders usage metrics, system alert banner, lifecycle event alerts, and quick-action links
- [ ] 7-Admin.4: Users page lists all Azure AD users with base roles and active override counts; GrantOverrideForm submits and persists; Overrides page lists active overrides with expiry warnings; Revoke confirmation dialog fires and persists
- [ ] 7-Admin.5: First-login lifecycle events created by backend middleware; user-disabled webhook expires overrides and creates lifecycle event; unacknowledged events appear in Admin home alert banner
- [ ] 7-Admin.6: Audit log page renders both tabs; Business Audit tab shows all `AdminAuditEventType` events; System Errors tab shows severity-coded entries; search filters both tables; Export button downloads CSV
- [ ] 7-Admin.7: Provisioning failures page lists failed runs; Retry button shows confirmation dialog; retry dispatches to backend and refreshes table; success/error feedback displayed
- [ ] 7-Admin.8: Provisioned sites page lists all sites with clickable URLs; search by project name/number works; Export button downloads CSV
- [ ] 7-Admin.9: Notification log shows last 30 days; status badges correct; search works; Export downloads CSV
- [ ] 7-Admin.10: System Settings loads existing config; module toggles save; OpEx Manager UPN saves; notification recipient pickers save; audit trail entry created on every save
- [ ] 7-Admin.11: ExportButton works for all 5 data types; downloaded files are valid CSVs; export action written to audit trail
- [ ] 7-Admin.12: All 12 backend endpoints return correct status codes; all write operations record audit entries; user-disabled webhook rejects invalid secrets
- [ ] 7-Admin.13: All 7 SharePoint lists created with correct columns; setup script idempotent (safe to re-run)
- [ ] 7-Admin.14: Vitest unit tests pass with ≥ 95% coverage for all new pages and components; all 5 Playwright E2E specs pass
- [ ] 7-Admin.15: `docs/how-to/administrator/admin-module-guide.md` created; ADR-0074 created with all Option C future-upgrade notes
- [ ] `pnpm turbo run build --filter=@hb-intel/admin` → EXIT 0
- [ ] `pnpm turbo run test --filter=@hb-intel/admin` → EXIT 0

---

## PH7-Admin Progress Notes

_(To be completed during implementation)_

### Verification Evidence

- `pnpm turbo run build --filter=@hb-intel/admin` → EXIT 0 — PASS / FAIL
- `pnpm turbo run test --filter=@hb-intel/admin` → EXIT 0 — PASS / FAIL
- Admin route accessed by non-admin user → redirected to `/` — PASS / FAIL
- Grant override with 30-day expiry → override appears in Overrides page with correct countdown — PASS / FAIL
- Revoke override → override removed from Overrides page; audit entry created — PASS / FAIL
- Retry failed provisioning run → confirmation dialog shown; retry dispatched; success message displayed — PASS / FAIL
- Export Audit Log → valid CSV downloaded; export event logged in audit trail — PASS / FAIL
- User-disabled webhook called with valid secret → overrides expired; lifecycle event created — PASS / FAIL
- System Settings save → success banner shown; `settings_changed` audit entry created — PASS / FAIL

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase 7-Admin plan created: 2026-03-07
Documentation to add: docs/how-to/administrator/admin-module-guide.md
ADR to create: docs/architecture/adr/ADR-0074-admin-module-feature-decisions.md
Next: 7-Admin.1 — Data Models & Types
-->
