# Admin SPFx IT Control Center — Phase 12 Operator Console UX Map

**Created:** 2026-04-04
**Prompt:** P12-08 — SPFx Unified Observability Console and Routes
**Prerequisites:** P12-05 backend APIs, P12-06 runtime, P12-07 instrumentation

---

## 1. Purpose

This document maps the Phase 12 operator-console observability surfaces: route layout, page/component ownership, major workflows, empty/loading/error behavior, and remaining gaps.

---

## 2. Route map

### Updated routes

| Path | Page | Status | Change in P12-08 |
|------|------|--------|-----------------|
| `/errors` | `ErrorLogPage` | **ACTIVE** | Replaced deferred stub with real error log surface |

### Existing observability-related routes (unchanged)

| Path | Page | Status |
|------|------|--------|
| `/health` | `OperationalDashboardPage` | Active — queue health, alert dashboard, probe dashboard |
| `/runs` | `ProvisioningOversightPage` | Active — run list, failure management |
| `/runs?projectId=` | `ProvisioningOversightPage` | Active — filtered by project |

### Lane registry update

The Errors lane (`id: 'errors'`) was changed from `scaffold` to `active`, removing the `deliversIn: 'SF17-T05'` and `scaffoldMessage` properties. The lane is now fully operational in the navigation.

---

## 3. Page/component ownership

### ErrorLogPage (`apps/admin/src/pages/ErrorLogPage.tsx`)

**Owner:** `apps/admin`
**Data source:** Backend observability error store via `GET /api/admin/observability/errors`
**Hook:** `useObservabilityErrors` from `@hbc/features-admin`

| Component | Source | Purpose |
|-----------|--------|---------|
| `WorkspacePageShell` | `@hbc/ui-kit` | Page wrapper with loading/error states |
| `HbcSelect` | `@hbc/ui-kit` | Domain, severity, classification filter dropdowns |
| `HbcButton` | `@hbc/ui-kit` | Clear filters action |
| `HbcCard` | `@hbc/ui-kit` | Error event card container |
| `HbcStatusBadge` | `@hbc/ui-kit` | Severity indicator on each error card |
| `HbcTypography` | `@hbc/ui-kit` | Title, message, metadata text |
| `HbcSmartEmptyState` | `@hbc/smart-empty-state` | Empty and filter-empty states |
| `useObservabilityErrors` | `@hbc/features-admin` | Error query hook with filter management |

### OperationalDashboardPage (unchanged)

Continues to render:
- Queue health summary and bottleneck detection
- `AdminAlertDashboard` from `@hbc/features-admin` (permission-gated)
- `ImplementationTruthDashboard` from `@hbc/features-admin` (permission-gated)

---

## 4. Major workflows

### Error log workflow

1. Operator navigates to `/errors` via Errors lane in navigation
2. Page loads with `useObservabilityErrors` querying the backend (30s auto-refresh)
3. Error events displayed as cards with severity badge, domain, source, classification, timestamp
4. Operator filters by domain, severity, or classification using HbcSelect dropdowns
5. Filter-empty state shown when no errors match filters, with clear-filters action
6. Truly-empty state shown when no errors exist, with link to Health dashboard

### Alert workflow (unchanged, on Health page)

1. `useAlertPolling` runs monitors every 30s at the root route level
2. `useAdminAlerts` hook provides alert data to `AdminAlertDashboard`
3. Alert badge in navigation shows severity-weighted count
4. Operator can acknowledge alerts in the dashboard

### Probe workflow (unchanged, on Health page)

1. `useProbePolling` runs probes every 15 minutes at the root route level
2. `useInfrastructureProbes` hook provides snapshot data to `ImplementationTruthDashboard`
3. Dashboard shows per-probe status with staleness detection
4. Manual probe run trigger available

---

## 5. Empty / loading / error behavior

### ErrorLogPage states

| State | Behavior |
|-------|----------|
| **Session loading** | `WorkspacePageShell` with `isLoading` — shows loading indicator |
| **Data loading** | Shell with `isLoading` prop — spinner/shimmer overlay |
| **Load error (no data)** | Shell with `isError` + `errorMessage` + retry button |
| **No errors (truly empty)** | `HbcSmartEmptyState` variant="inline" with coaching tip about admin domains |
| **No errors matching filters** | `HbcSmartEmptyState` with classification="filter-empty" and clear-filters guidance |
| **Has data** | Card list with severity badges, metadata, and correlation context |

---

## 6. New hook: `useObservabilityErrors`

**Location:** `packages/features/admin/src/hooks/useObservabilityErrors.ts`

**API:**
```typescript
function useObservabilityErrors(
  fetchErrors: (params: Record<string, string>) => Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>>
): UseObservabilityErrorsResult
```

**Features:**
- React Query integration with 30s refetch interval
- Filter state management (domain, source, classification, severity, runId, from/to)
- `hasActiveFilters` computed property for empty-state discrimination
- `clearFilters()` resets all filters to null
- `refresh()` invalidates the query cache

---

## 7. Remaining gaps

| Gap | Reason | Extension path |
|-----|--------|---------------|
| Correlated timeline drilldown on ErrorLogPage | Error cards show runId but don't link to a timeline view | Add click-through to `/health` or future `/observability/timeline/{runId}` route |
| Error event detail modal | Cards show summary; no full-detail view | Add modal with complete error details, structured `details` JSON, and linked alert/incident context |
| Incident linking on error cards | `incidentId` field exists but incidents are not yet implemented | Wire incident display when incident management is built |
| Dashboard summary widget on landing page | `OperatorLandingPage` has lane cards but no aggregated observability summary | Integrate `obsGetDashboardSummary` API into landing page cards |
| Operator action on error events | No acknowledge/dismiss action on error cards | Add operator action buttons when error lifecycle management is scoped |
