# Admin SPFx IT Control Center — Phase 12 Operator Console UX Map

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-08 — re-audit against current repo truth
**Prerequisites:** P12-05 backend APIs, P12-06 runtime, P12-07 instrumentation

---

## 1. Purpose

This document maps the Phase 12 operator-console observability surfaces: route layout, page/component ownership, major workflows, empty/loading/error behavior, and remaining gaps.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. Route map

### Observability routes

| Path | Page | Status | Lane order | Permission |
|------|------|--------|-----------|-----------|
| `/errors` | `ErrorLogPage` | **Active** | 9 | `admin:access-control:view` |
| `/health` | `OperationalDashboardPage` | **Active** | 8 | `admin:access-control:view` |
| `/runs` | `ProvisioningOversightPage` | **Active** | 3 | `admin:access-control:view` |

All observability routes use lazy loading and are protected by `adminBeforeLoad()` permission guard.

### Legacy redirects (backward compatibility)

| Legacy path | Redirects to | Notes |
|-------------|-------------|-------|
| `/provisioning-failures` | `/runs` | Preserves search params |
| `/dashboards` | `/health` | — |
| `/error-log` | `/errors` | — |

### Lane registry status

| Lane ID | Path | Label | Status |
|---------|------|-------|--------|
| `errors` | `/errors` | Errors | **Active** (upgraded from scaffold in P12-08) |
| `health` | `/health` | Health | **Active** |
| `runs` | `/runs` | Runs | **Active** |
| `validation` | `/validation` | Validation | **Scaffold** (Phase 7 delivery) |

All other lanes (setup, sharepoint, entra, standards-config, config, white-glove-*) are active.

---

## 3. Root-level observability integration

The root route (`root-route.tsx`) initializes two polling services unconditionally on session mount:

| Service | Hook | Interval | Purpose |
|---------|------|----------|---------|
| Alert polling | `useAlertPolling()` | 30s (`ADMIN_ALERTS_POLL_MS`) | Runs monitors, deduplicates alerts, ingests to store, dispatches notifications |
| Probe polling | `useProbePolling()` | 15min (`PROBE_SCHEDULER_DEFAULT_MS`) | Runs probes with retry, builds snapshots, saves to API |

**Alert badge:** `AdminAlertBadge` from `@hbc/features-admin` rendered in the operator console navigation. Displays severity-weighted count. Clicking navigates to `/health`.

---

## 4. Page/component ownership

### ErrorLogPage (`apps/admin/src/pages/ErrorLogPage.tsx`)

**Data source:** Backend observability error store via `POST /api/admin/observability/errors`
**Hook:** `useObservabilityErrors` from `@hbc/features-admin` (30s auto-refresh)

| Component | Source | Purpose |
|-----------|--------|---------|
| `WorkspacePageShell` | `@hbc/ui-kit` | Page wrapper with loading/error states |
| `HbcSelect` (×3) | `@hbc/ui-kit` | Domain, severity, classification filter dropdowns |
| `HbcButton` | `@hbc/ui-kit` | Clear filters action |
| `HbcCard` | `@hbc/ui-kit` | Error event card container |
| `HbcStatusBadge` | `@hbc/ui-kit` | Severity indicator (critical/high → error, medium → warning, low → neutral) |
| `HbcTypography` | `@hbc/ui-kit` | Title, message, metadata text |
| `HbcSmartEmptyState` | `@hbc/smart-empty-state` | Empty and filter-empty states |

**Filters:**
- Domain: 6 options (provisioning-rollout, sharepoint-control, entra-control, white-glove-deployment, setup-install, standards-config)
- Severity: 4 options (critical, high, medium, low)
- Classification: 6 options (transient, permissions, structural, repeated, admin-class, unclassified)

**Error card rendering:** Title, message, severity badge, domain/source/classification/timestamp metadata, optional runId and actionKey. Summary bar shows total count.

### OperationalDashboardPage (`apps/admin/src/pages/OperationalDashboardPage.tsx`)

**Data source:** Project setup requests via direct API call
**Sub-components:** Permission-gated alert and probe dashboards from `@hbc/features-admin`

| Section | Component | Permission gate |
|---------|-----------|----------------|
| Queue health summary | 4 summary cards (Active, Needs Attention, Completed 7d, Overall Health) | None |
| Queue overview by state | State-grouped cards with count and badge | None |
| Bottleneck indicators | `HbcBanner` components from `detectBottlenecks()` | None |
| Alert dashboard | `AdminAlertDashboard` from `@hbc/features-admin` | `ADMIN_PROVISIONING_ALERT_FULL_DETAIL` |
| Probe dashboard | `ImplementationTruthDashboard` from `@hbc/features-admin` | `ADMIN_PROVISIONING_ALERT_FULL_DETAIL` |

**Health computation:** `computeQueueHealthSummary()`, `computeStateCounts()`, `detectBottlenecks()` utilities.

### ProvisioningOversightPage (`apps/admin/src/pages/ProvisioningOversightPage.tsx`)

**Data source:** Admin run store via backend API
**Tabs:** Active Runs | Failures | Completed (limit 50) | All

| Action | Permission | Condition | Component |
|--------|-----------|-----------|-----------|
| View details | None | Always | `ProvisioningDetailContent` modal |
| Force retry | `ADMIN_PROVISIONING_RETRY` | Failed + retryCount < ceiling | `ForceRetryConfirmation` modal |
| Archive | `ADMIN_PROVISIONING_ARCHIVE` | Failed | `ArchiveConfirmation` modal |
| Acknowledge escalation | `ADMIN_PROVISIONING_ESCALATE` | Escalated | Inline button |
| Override state | `ADMIN_PROVISIONING_FORCE_STATE` | Expert tier + stuck in transitional | `StateOverrideConfirmation` modal |

**Detail modal:** State badges, core summary (project, triggered by, timestamps), failure classification, provisioning steps table. Expert tier adds error details, Entra groups, internal IDs, manual state override.

**Query parameter support:** `?projectId=` auto-selects the latest run for that project.

---

## 5. Major workflows

### Error log workflow
1. Operator navigates to `/errors` via Errors lane
2. `useObservabilityErrors` queries backend (30s auto-refresh)
3. Error events displayed as cards with severity badge, domain, source, classification, timestamp
4. Operator filters by domain, severity, or classification
5. Filter-empty state shown with clear-filters action
6. Truly-empty state shown with link to Health dashboard

### Alert workflow (Health page)
1. `useAlertPolling` runs monitors every 30s at root route level
2. `useAdminAlerts` hook provides alert data to `AdminAlertDashboard`
3. Alert badge in navigation shows severity-weighted count
4. Operator can acknowledge and resolve alerts in the dashboard (P12-09)
5. Teams webhook dispatches immediate notifications for critical/high alerts

### Probe workflow (Health page)
1. `useProbePolling` runs probes every 15 minutes at root route level
2. `useInfrastructureProbes` hook provides snapshot data to `ImplementationTruthDashboard`
3. Dashboard shows per-probe status with staleness detection (30-min threshold)
4. Manual probe run trigger available
5. Degraded/error probe results generate alerts via probe-to-alert bridge

### Provisioning oversight workflow
1. Operator navigates to `/runs` via Runs lane
2. Tab filter selects Active/Failures/Completed/All views
3. Data table shows runs with status, failure class, step, actions
4. Retry/archive/escalate actions gated by permissions
5. Detail modal provides step-level diagnostics and failure context
6. Expert tier enables state override for stuck runs

---

## 6. Empty / loading / error behavior

### ErrorLogPage states

| State | Behavior |
|-------|----------|
| Session loading | `WorkspacePageShell` with `isLoading` — loading indicator |
| Data loading | Shell with `isLoading` prop — spinner/shimmer overlay |
| Load error | Shell with `isError` + `errorMessage` + retry button |
| No errors (truly empty) | `HbcSmartEmptyState` with coaching tip, link to Health dashboard |
| No errors matching filters | `HbcSmartEmptyState` with filter-empty classification, clear-filters guidance |
| Has data | Card list with severity badges, metadata, correlation context |

### OperationalDashboardPage states

| State | Behavior |
|-------|----------|
| Loading | Shell with loading indicator |
| No requests | `HbcSmartEmptyState` with link to Provisioning Oversight |
| Healthy (no bottlenecks) | `HbcCoachingCallout`: "All systems operating normally" |
| Degraded | Bottleneck banners with runbook links |
| Has data | Health cards, state grid, alert/probe dashboards |

### ProvisioningOversightPage states

| State | Behavior |
|-------|----------|
| Loading | Shell with loading indicator |
| No runs matching tab | `HbcSmartEmptyState` with "Show All Runs" action |
| Retry ceiling reached | Coaching callout with escalation procedure link |
| Stuck in transitional | Coaching callout with stuck alert rule link |
| Failures detected | Coaching callout with retry procedure link |

---

## 7. Severity and status mapping

### Consistent badge variant mapping

| Severity/Status | Badge variant | Used on |
|----------------|--------------|---------|
| Critical | `error` | Error cards, alert badges |
| High | `error` | Error cards, alert badges |
| Medium | `warning` | Error cards, alert badges |
| Low | `neutral` | Error cards |
| Failed | `error` | Run status, state cards |
| NeedsClarification | `warning` | State cards |
| Completed | `completed` | State cards, health |
| Provisioning/ReadyToProvision | `inProgress` | State cards |
| Healthy | `completed` | Health summary |
| Degraded | `warning` | Health summary |

---

## 8. Remaining gaps

| Gap | Reason | Extension path |
|-----|--------|---------------|
| Correlated timeline drilldown on ErrorLogPage | Error cards show runId but don't link to a timeline view | Add click-through to future `/observability/timeline/{runId}` route when timeline API is fully assembled |
| Error event detail modal | Cards show summary; no full-detail view | Add modal with complete error details, structured `details` JSON, and linked alert/incident context |
| Incident linking on error cards | `incidentId` field exists but incidents are not yet implemented | Wire incident display when incident management is built |
| Dashboard summary widget on landing page | `OperatorLandingPage` has lane cards but no aggregated observability summary | Integrate `obsGetDashboardSummary` API into landing page cards |
| Operator action on error events | No acknowledge/dismiss action on error cards | Add operator action buttons when error lifecycle management is scoped |
| Wave 0 alert/probe info banners | Health page shows "in-memory only" banners | Update banner text when durable store transition is user-visible |

---

## Validation

- [x] All three observability routes active in lane registry (/errors, /health, /runs)
- [x] ErrorLogPage fully implemented with 3 filters, severity badges, smart empty states
- [x] OperationalDashboardPage operational with health cards, alert/probe dashboards
- [x] ProvisioningOversightPage operational with 4 tabs, 5 actions, detail modal
- [x] Alert polling (30s) and probe polling (15min) wired at root route
- [x] Alert badge in navigation with click-to-health
- [x] Legacy redirects in place (/error-log → /errors, /dashboards → /health, /provisioning-failures → /runs)
- [x] Permission gating on all destructive actions
- [x] Consistent severity badge mapping across all surfaces
- [x] Smart empty states distinguish filter-empty from truly-empty
