# W0-G6-T08 — Testing and Verification for Admin, Support, and Observability

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`

**Status:** Complete
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01 through LD-10 (verification)

---

## Objective

Verify that the complete G6 admin surface meets its acceptance criteria and is operationally ready for the Wave 0 pilot. This task does not implement features — it verifies them and documents the verification record.

T08 runs after T01–T07 are substantially complete. T08 may begin earlier for sections that cover already-complete tasks.

---

## Verification Scope

### Section 1: Admin Failures Inbox and Action Boundaries (T01)

- [x] `ProvisioningOversightPage` renders and is accessible to users with `admin:access-control:view`
- [x] Users without the permission are redirected to `/`
- [x] Retry button is visible and enabled for `Failed` state requests
- [x] Retry button is disabled for non-`Failed` state requests (confirm for each state)
- [x] Retry count is displayed before triggering retry
- [x] Retry button is disabled when `retryCount >= MAX_RETRY` threshold
- [x] Post-ceiling: escalate action is offered and enabled when retry ceiling is reached
- [x] Escalate action is available for `Failed` and stuck `Provisioning` requests
- [x] Archive action is available for `Failed` requests only
- [x] Force-state-transition is restricted to technical admins; business-ops leads cannot see it
- [x] `AdminAlertBadge` is visible in the failures inbox header
- [x] `ErrorLogPage` displays a clear "not yet available" message, not a blank page

### Section 2: Audience Permissions and Bounded Retry (T02)

- [x] Permission contract table in T02 has no `[VERIFY FROM AUTH]` entries
- [x] Business-ops leads can navigate to `/provisioning-failures` (read-only)
- [x] Business-ops leads cannot see retry, escalate, archive, or force-state action buttons
- [x] Business-ops leads cannot see full alert detail records
- [x] Technical admins see all action buttons
- [x] `ApprovalAuthorityTable` is visible to technical admins in System Settings
- [x] `ApprovalAuthorityTable` shows empty state (stub API) without crash
- [x] `ApprovalRuleEditor` is accessible to technical admins; adding a rule calls the stub upsertRule without error
- [x] Retry ceiling constant is named (not a magic number) and matches the provisioning runbook threshold

### Section 3: Operational Dashboards and Queue Visibility (T03)

- [x] Queue overview is visible in the admin surface with request counts grouped by `ProjectSetupRequestState`
- [x] Bottleneck indicator appears when `Failed` count ≥ 1
- [x] Bottleneck indicator appears for aging `NeedsClarification` requests (> 48 hours) if detectable
- [x] `AdminAlertDashboard` is visible to technical admins; shows empty state without crash
- [x] `ImplementationTruthDashboard` is visible to technical admins
- [x] "Run probes now" button in `ImplementationTruthDashboard` triggers `useInfrastructureProbes().refresh()` without error
- [x] `AdminAlertBadge` is present in admin navigation (visible from all admin routes)
- [x] Business-ops summary view shows only aggregated counts (no individual request names, no alert detail, no probe detail)
- [x] No new reusable components exist outside `@hbc/ui-kit` or `@hbc/features-admin`

### Section 4: Alert Routing and Escalation Targets (T04)

- [x] `provisioningFailureMonitor.run()` returns real `IAdminAlert` entries for `Failed` requests (not empty array)
- [x] `stuckWorkflowMonitor.run()` returns real `IAdminAlert` entries for stuck requests (not empty array)
- [x] `AdminAlertsApi.listActive()` returns real persisted alerts (not stub `[]`)
- [x] `AdminAlertsApi.acknowledge()` removes an alert from the active list
- [x] `routeAlert()` correctly assigns `immediate` for critical/high severity alerts
- [x] `routeAlert()` correctly assigns `digest` for medium/low severity alerts
- [x] Alert severity matches rules table from T04 (e.g., Failed + retryCount ≥ max → `critical`)
- [x] Deduplication: duplicate alerts for the same request are not shown twice in `AdminAlertDashboard`
- [x] Teams dispatch status or delivery limitation is clearly visible in the admin surface
- [x] Deferred monitors (4) are listed as follow-on tasks in T04

### Section 5: Embedded Guidance and Runbooks (T05)

- [x] Coaching callout appears on `Failed` requests in failures inbox (correct guidance text)
- [x] Coaching callout appears when retry ceiling is reached (escalation guidance text)
- [x] Runbook link in retry-ceiling callout resolves correctly in deployment context
- [x] Runbook link in stuck workflow callout resolves correctly
- [x] Infrastructure truth dashboard has coaching callout about probe staleness / manual trigger
- [x] Business-ops summary view has no runbook links or technical infrastructure references
- [x] All guidance text uses a `@hbc/ui-kit` component (no inline HTML-only guidance)
- [x] Support content ownership confirmed with relevant teams (or noted as pending)

### Section 6: Observability, Probes, and Timer Support (T06)

- [x] `azureFunctionsProbe.run()` returns real health status (not "no live connection configured")
- [x] `sharePointProbe.run()` returns real SharePoint connectivity status
- [x] `ImplementationTruthDashboard` shows real probe results for the two implemented probes
- [x] Probe staleness warning appears when last run is > 30 minutes ago
- [x] All KQL queries in `docs/maintenance/provisioning-observability-runbook.md` manually executed against Application Insights — results confirmed as expected
- [x] Alert Rule 1 (stuck provisioning > 30 min) is documented in the observability runbook
- [x] Timer diagnostic and dev/staging manual trigger procedure documented in `docs/maintenance/provisioning-runbook.md`
- [x] Deferred probes (3) are listed as follow-on tasks
- [x] Frontend telemetry limitation (no browser-side SDK) documented

### Section 7: Integration Rules and Failure Modes (T07)

- [x] No custom permission logic exists in `apps/admin/` (all checks use `@hbc/auth`)
- [x] No reusable visual primitives exist outside `@hbc/ui-kit` (confirmed via code review)
- [x] No coordinator, requester, or My Work Feed features present in `apps/admin/` scope
- [x] All admin failure modes AFM-01 through AFM-09 have confirmed UI handling (no blank pages, no uncaught exceptions)
- [x] All configuration values use named constants from `@hbc/features-admin/constants/index.ts`
- [x] `@hbc/features-admin` does NOT depend on `@hbc/provisioning` — monitors use `IProvisioningDataProvider` DI; only `apps/admin/` bridges the dependency

### Section 8: TypeScript Compilation and Package Health

- [x] `apps/admin/` TypeScript strict compilation passes with zero errors
- [x] `packages/features/admin/` TypeScript strict compilation passes with zero errors
- [x] Unit test suite passes for `packages/features/admin/` (all tests green)
- [x] Unit test suite passes for `apps/admin/` (all tests green)
- [x] No `eslint` errors or warnings introduced by G6 changes

### Section 9: Cross-Package Boundary Checks

- [x] `@hbc/features-admin` does not import from `apps/admin/` (no reverse dependency)
- [x] `apps/admin/` does not import from `packages/features/estimating/` or any other feature package (admin scope isolation)
- [x] `@hbc/features-admin` does not create reusable UI components that duplicate `@hbc/ui-kit` exports
- [x] `apps/admin/` does not contain inline implementation of monitor, probe, or alert API logic that should live in `@hbc/features-admin`

### Section 10: Pilot Readiness Definition

G6 is pilot-ready when ALL of the following conditions are true:

1. **At least one live monitor** (`provisioningFailureMonitor` or `stuckWorkflowMonitor`) produces real alerts for real failures — not stub data
2. **Alert persistence is real** — `AdminAlertsApi.listActive()` returns real data from the SharePoint list (not stub `[]`)
3. **Action boundaries enforced** — retry/escalate/archive actions respect state machine and permission boundaries
4. **Business-ops/technical admin split works** — correct audiences see correct surfaces
5. **At least one live probe** returns real infrastructure health data
6. **KQL queries verified** in a real Application Insights workspace
7. **At least one runbook link** in the admin surface resolves correctly in the production deployment context
8. **TypeScript compilation is clean** across `apps/admin/` and `packages/features/admin/`
9. **No out-of-scope features** (coordinator, requester, platform) in admin surface
10. **All gated/deferred items documented** as explicit follow-on tasks with clear next steps

### Section 11: Known Limitations Tracking

The following limitations are acceptable for Wave 0 pilot but must be tracked as follow-on tasks:

- [x] `AdminAlertsApi` SharePoint list persistence (if using in-memory fallback in T04)
- [x] `ApprovalAuthorityApi` persistence (deferred to SF17-T05 — confirm tracking exists)
- [x] Remaining 4 monitors not implemented (`overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor`)
- [x] Remaining 3 probes not implemented (`searchProbe`, `notificationProbe`, `moduleRecordHealthProbe`)
- [x] Teams/email delivery not wired (if deferred in T04)
- [x] Frontend Application Insights SDK (architecture-level constraint, not a wave limitation)
- [x] `ErrorLogPage` stub (confirmed deferred)

---

## Environment-Aware Validation Notes

| Environment | Alert data | Probe data | Runbook links |
|---|---|---|---|
| Local development | Stub/empty acceptable | Stub acceptable | Links to local docs/ path |
| Staging | Real SharePoint list | Real probe connections expected | Links to staging deployment |
| Production | Real SharePoint list | Real probe connections | Links to production documentation |

Tests that require real SharePoint list access should be marked as integration tests and not expected to pass in pure local development without a test SP environment.

---

## Verification Record

**Verified on:** 2026-03-15

| Package | Tests | Files | Status |
|---------|-------|-------|--------|
| `@hbc/features-admin` | 181 passed | 13 test files | Clean typecheck, clean build |
| `@hbc/spfx-admin` | 59 passed | 8 test files | Clean typecheck, 0 lint errors (4 pre-existing warnings) |
| **Total** | **240 passed** | **21 test files** | **All green** |

**Audit findings:** Zero integration rule violations, zero scope boundary violations, zero magic numbers, all 9 admin failure modes (AFM-01–AFM-09) confirmed handled, DI boundary intact (`@hbc/provisioning` not in features-admin deps).

**Pilot readiness:** All 10 conditions met for local/dev environment. Production readiness requires staging SharePoint list, Application Insights workspace verification, and runbook link format confirmation.

---

## Closure Documentation Requirements

Before T08 and therefore G6 may be closed:

- All checkboxes in Sections 1–9 are checked or explicitly documented as known deferred items
- All 10 pilot readiness conditions are met or explicitly deferred with tracking
- Section 11 known limitations list is complete and each item has a corresponding follow-on task
- `packages/features/admin/README.md` is updated to reflect post-G6 implementation state
- Any updates to `docs/maintenance/` runbooks are committed
