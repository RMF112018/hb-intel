# W0-G6-T08 — Testing and Verification for Admin, Support, and Observability

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`

**Status:** Proposed
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01 through LD-10 (verification)

---

## Objective

Verify that the complete G6 admin surface meets its acceptance criteria and is operationally ready for the Wave 0 pilot. This task does not implement features — it verifies them and documents the verification record.

T08 runs after T01–T07 are substantially complete. T08 may begin earlier for sections that cover already-complete tasks.

---

## Verification Scope

### Section 1: Admin Failures Inbox and Action Boundaries (T01)

- [ ] `ProvisioningOversightPage` renders and is accessible to users with `admin:access-control:view`
- [ ] Users without the permission are redirected to `/`
- [ ] Retry button is visible and enabled for `Failed` state requests
- [ ] Retry button is disabled for non-`Failed` state requests (confirm for each state)
- [ ] Retry count is displayed before triggering retry
- [ ] Retry button is disabled when `retryCount >= MAX_RETRY` threshold
- [ ] Post-ceiling: escalate action is offered and enabled when retry ceiling is reached
- [ ] Escalate action is available for `Failed` and stuck `Provisioning` requests
- [ ] Archive action is available for `Failed` requests only
- [ ] Force-state-transition is restricted to technical admins; business-ops leads cannot see it
- [ ] `AdminAlertBadge` is visible in the failures inbox header
- [ ] `ErrorLogPage` displays a clear "not yet available" message, not a blank page

### Section 2: Audience Permissions and Bounded Retry (T02)

- [ ] Permission contract table in T02 has no `[VERIFY FROM AUTH]` entries
- [ ] Business-ops leads can navigate to `/provisioning-failures` (read-only)
- [ ] Business-ops leads cannot see retry, escalate, archive, or force-state action buttons
- [ ] Business-ops leads cannot see full alert detail records
- [ ] Technical admins see all action buttons
- [ ] `ApprovalAuthorityTable` is visible to technical admins in System Settings
- [ ] `ApprovalAuthorityTable` shows empty state (stub API) without crash
- [ ] `ApprovalRuleEditor` is accessible to technical admins; adding a rule calls the stub upsertRule without error
- [ ] Retry ceiling constant is named (not a magic number) and matches the provisioning runbook threshold

### Section 3: Operational Dashboards and Queue Visibility (T03)

- [ ] Queue overview is visible in the admin surface with request counts grouped by `ProjectSetupRequestState`
- [ ] Bottleneck indicator appears when `Failed` count ≥ 1
- [ ] Bottleneck indicator appears for aging `NeedsClarification` requests (> 48 hours) if detectable
- [ ] `AdminAlertDashboard` is visible to technical admins; shows empty state without crash
- [ ] `ImplementationTruthDashboard` is visible to technical admins
- [ ] "Run probes now" button in `ImplementationTruthDashboard` triggers `useInfrastructureProbes().refresh()` without error
- [ ] `AdminAlertBadge` is present in admin navigation (visible from all admin routes)
- [ ] Business-ops summary view shows only aggregated counts (no individual request names, no alert detail, no probe detail)
- [ ] No new reusable components exist outside `@hbc/ui-kit` or `@hbc/features-admin`

### Section 4: Alert Routing and Escalation Targets (T04)

- [ ] `provisioningFailureMonitor.run()` returns real `IAdminAlert` entries for `Failed` requests (not empty array)
- [ ] `stuckWorkflowMonitor.run()` returns real `IAdminAlert` entries for stuck requests (not empty array)
- [ ] `AdminAlertsApi.listActive()` returns real persisted alerts (not stub `[]`)
- [ ] `AdminAlertsApi.acknowledge()` removes an alert from the active list
- [ ] `routeAlert()` correctly assigns `immediate` for critical/high severity alerts
- [ ] `routeAlert()` correctly assigns `digest` for medium/low severity alerts
- [ ] Alert severity matches rules table from T04 (e.g., Failed + retryCount ≥ max → `critical`)
- [ ] Deduplication: duplicate alerts for the same request are not shown twice in `AdminAlertDashboard`
- [ ] Teams dispatch status or delivery limitation is clearly visible in the admin surface
- [ ] Deferred monitors (4) are listed as follow-on tasks in T04

### Section 5: Embedded Guidance and Runbooks (T05)

- [ ] Coaching callout appears on `Failed` requests in failures inbox (correct guidance text)
- [ ] Coaching callout appears when retry ceiling is reached (escalation guidance text)
- [ ] Runbook link in retry-ceiling callout resolves correctly in deployment context
- [ ] Runbook link in stuck workflow callout resolves correctly
- [ ] Infrastructure truth dashboard has coaching callout about probe staleness / manual trigger
- [ ] Business-ops summary view has no runbook links or technical infrastructure references
- [ ] All guidance text uses a `@hbc/ui-kit` component (no inline HTML-only guidance)
- [ ] Support content ownership confirmed with relevant teams (or noted as pending)

### Section 6: Observability, Probes, and Timer Support (T06)

- [ ] `azureFunctionsProbe.run()` returns real health status (not "no live connection configured")
- [ ] `sharePointProbe.run()` returns real SharePoint connectivity status
- [ ] `ImplementationTruthDashboard` shows real probe results for the two implemented probes
- [ ] Probe staleness warning appears when last run is > 30 minutes ago
- [ ] All KQL queries in `docs/maintenance/provisioning-observability-runbook.md` manually executed against Application Insights — results confirmed as expected
- [ ] Alert Rule 1 (stuck provisioning > 30 min) is documented in the observability runbook
- [ ] Timer diagnostic and dev/staging manual trigger procedure documented in `docs/maintenance/provisioning-runbook.md`
- [ ] Deferred probes (3) are listed as follow-on tasks
- [ ] Frontend telemetry limitation (no browser-side SDK) documented

### Section 7: Integration Rules and Failure Modes (T07)

- [ ] No custom permission logic exists in `apps/admin/` (all checks use `@hbc/auth`)
- [ ] No reusable visual primitives exist outside `@hbc/ui-kit` (confirmed via code review)
- [ ] No coordinator, requester, or My Work Feed features present in `apps/admin/` scope
- [ ] All admin failure modes AFM-01 through AFM-09 have confirmed UI handling (no blank pages, no uncaught exceptions)
- [ ] All configuration values use named constants from `@hbc/features-admin/constants/index.ts`
- [ ] `@hbc/features-admin` package dependency on `@hbc/provisioning` is declared in `package.json` if monitors call it

### Section 8: TypeScript Compilation and Package Health

- [ ] `apps/admin/` TypeScript strict compilation passes with zero errors
- [ ] `packages/features/admin/` TypeScript strict compilation passes with zero errors
- [ ] Unit test suite passes for `packages/features/admin/` (all tests green)
- [ ] Unit test suite passes for `apps/admin/` (all tests green)
- [ ] No `eslint` errors or warnings introduced by G6 changes

### Section 9: Cross-Package Boundary Checks

- [ ] `@hbc/features-admin` does not import from `apps/admin/` (no reverse dependency)
- [ ] `apps/admin/` does not import from `packages/features/estimating/` or any other feature package (admin scope isolation)
- [ ] `@hbc/features-admin` does not create reusable UI components that duplicate `@hbc/ui-kit` exports
- [ ] `apps/admin/` does not contain inline implementation of monitor, probe, or alert API logic that should live in `@hbc/features-admin`

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

- [ ] `AdminAlertsApi` SharePoint list persistence (if using in-memory fallback in T04)
- [ ] `ApprovalAuthorityApi` persistence (deferred to SF17-T05 — confirm tracking exists)
- [ ] Remaining 4 monitors not implemented (`overdueProvisioningMonitor`, `staleRecordMonitor`, `permissionAnomalyMonitor`, `upcomingExpirationMonitor`)
- [ ] Remaining 3 probes not implemented (`searchProbe`, `notificationProbe`, `moduleRecordHealthProbe`)
- [ ] Teams/email delivery not wired (if deferred in T04)
- [ ] Frontend Application Insights SDK (architecture-level constraint, not a wave limitation)
- [ ] `ErrorLogPage` stub (confirmed deferred)

---

## Environment-Aware Validation Notes

| Environment | Alert data | Probe data | Runbook links |
|---|---|---|---|
| Local development | Stub/empty acceptable | Stub acceptable | Links to local docs/ path |
| Staging | Real SharePoint list | Real probe connections expected | Links to staging deployment |
| Production | Real SharePoint list | Real probe connections | Links to production documentation |

Tests that require real SharePoint list access should be marked as integration tests and not expected to pass in pure local development without a test SP environment.

---

## Closure Documentation Requirements

Before T08 and therefore G6 may be closed:

- All checkboxes in Sections 1–9 are checked or explicitly documented as known deferred items
- All 10 pilot readiness conditions are met or explicitly deferred with tracking
- Section 11 known limitations list is complete and each item has a corresponding follow-on task
- `packages/features/admin/README.md` is updated to reflect post-G6 implementation state
- Any updates to `docs/maintenance/` runbooks are committed
