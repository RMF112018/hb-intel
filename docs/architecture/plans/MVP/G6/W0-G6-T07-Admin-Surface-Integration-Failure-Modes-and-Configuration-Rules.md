# W0-G6-T07 — Admin Surface Integration, Failure Modes, and Configuration Rules

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `packages/provisioning/src/failure-modes.ts`; `packages/features/admin/src/`

**Status:** Proposed
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01, LD-02, LD-03, LD-04, LD-09, LD-10

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| All prior G6 tasks (T01–T06) | — | T07 formalizes the integration rules established by T01–T06 | T07 should run after T01–T06 are substantially complete. Running T07 earlier is acceptable but this file may require updating as T01–T06 are completed. |
| `@hbc/provisioning` | `packages/provisioning/` | Failure mode registry, state machine, API client error handling | **READY.** `PROJECT_SETUP_FAILURE_MODES` (FM-01–FM-10), `IProvisioningApiClient`, `STATE_TRANSITIONS` all implemented. |
| `@hbc/features-admin` | `packages/features/admin/` | Admin-specific failure mode definitions | Review admin package for any admin-specific failure modes not covered by `PROJECT_SETUP_FAILURE_MODES`. Document any gaps. |

### Gate Outcome

T07 may proceed. It is primarily a documentation and enforcement task, not a new implementation task. Most of T07's surface behavior emerges from T01–T06 implementation.

---

## Objective

Formalize the integration rules, failure mode handling requirements, and configuration rules for the complete G6 admin surface. After this task:

1. Admin surface integration points (between `apps/admin/`, `@hbc/features-admin`, `@hbc/provisioning`, and `@hbc/auth`) are documented and their boundary rules enforced
2. Admin-specific failure modes are documented and the UI handles each gracefully
3. Configuration rules (SharePoint list names, polling intervals, probe intervals, retry thresholds) are documented as named constants, not magic numbers
4. Surface boundary rules prevent coordinator, requester, or platform features from being added to the admin surface scope creep

---

## Scope

### Integration Point Rules

Document and enforce the following integration boundary rules:

| Integration Point | Rule |
|---|---|
| `apps/admin/` → `@hbc/features-admin` | Admin app may consume types, hooks, and components from `@hbc/features-admin`. It must not re-implement types, create parallel hooks, or duplicate component logic. |
| `apps/admin/` → `@hbc/provisioning` | Admin app consumes `IProvisioningApiClient`, `STATE_TRANSITIONS`, and `ProjectSetupRequestState`. Admin app must not call provisioning API methods that require requester identity (those are G5 scope). |
| `@hbc/features-admin` monitors → `IProvisioningDataProvider` | Monitors receive provisioning request data via constructor injection (`IProvisioningDataProvider`). **`@hbc/features-admin` must not import `@hbc/provisioning` directly** — that would create a cross-feature dependency violating `03-package-boundaries.md`. The interface is owned by `@hbc/features-admin`; the concrete adapter is wired only in `apps/admin/`. |
| `apps/admin/` → `IProvisioningDataProvider` wiring | `apps/admin/` creates the concrete `IProvisioningDataProvider` implementation by delegating to `@hbc/provisioning`'s `IProvisioningApiClient`, then passes it to `createDefaultMonitorRegistry(deps)`. This is the only location in the codebase where admin intelligence and provisioning data are bridged. |
| `apps/admin/` → `@hbc/auth` | All permission enforcement uses `@hbc/auth` guard components or `usePermissionStore`. No custom permission logic in `apps/admin/`. |
| `@hbc/features-admin` → `@hbc/ui-kit` | Feature-local composition components in `@hbc/features-admin` may use `@hbc/ui-kit`. They must not create reusable visual primitives. |
| `apps/admin/` → `@hbc/notification-intelligence` | Admin alert dispatch must go through `INotificationDispatchAdapter`. Admin app must not call `@hbc/notification-intelligence` directly. |

### Admin-Specific Failure Mode Registry

The existing `PROJECT_SETUP_FAILURE_MODES` (FM-01–FM-10) cover provisioning surface failures. The following table defines admin-surface-specific failure modes:

| FM-ID | Title | Scenario | Expected Degradation |
|---|---|---|---|
| AFM-01 | SharePoint List Unavailable | `HBC_AdminAlerts` or `HBC_InfrastructureProbeSnapshots` list cannot be reached (SP outage, permissions) | Alert dashboard shows "Alerts unavailable" empty state; no error thrown; probe dashboard shows stale indicator |
| AFM-02 | Monitor Poll Failure | `MonitorRegistry.runAll()` throws or all monitors return empty unexpectedly | Alert badge shows last known count; "Alert data may be stale" indicator added; no crash |
| AFM-03 | Probe Scheduler Failure | `ProbeScheduler.runAll()` throws for one probe | Failed probe shows `error` status with summary message; other probe results still displayed; no crash |
| AFM-04 | Retry API Call Fails | `retryProvisioning()` returns a non-2xx response | Toast error shown; provisioning request state not changed; draft not cleared; admin can retry the retry |
| AFM-05 | Escalate API Call Fails | `escalateProvisioning()` returns error | Toast error shown; no state change; action button re-enabled |
| AFM-06 | Archive API Call Fails | `archiveFailure()` returns error | Toast error shown; request remains in failures list; action button re-enabled |
| AFM-07 | Permission Store Not Initialized | `usePermissionStore` not yet populated when admin route loads | Route redirects to `/` (existing behavior in `requireAdminAccessControl()`); no blank page |
| AFM-08 | Teams/Email Dispatch Fails | `INotificationDispatchAdapter.dispatch()` throws | Alert is still stored in `AdminAlertsApi`; dispatch failure logged; "Notification delivery failed" indicator in admin UI; no alert data lost |
| AFM-09 | Acknowledgment Write Fails | `AdminAlertsApi.acknowledge()` returns error | Alert remains in active list; toast error; admin can retry acknowledgment |

### Configuration Rules

All configuration values in the G6 admin surface must be named constants sourced from `@hbc/features-admin/constants/index.ts` or a clearly named config location. No magic numbers in admin app source files.

| Constant | Value | Source |
|---|---|---|
| `ADMIN_ALERTS_POLL_MS` | 30,000 ms | `@hbc/features-admin` constants |
| `PROBE_SCHEDULER_DEFAULT_MS` | 900,000 ms (15 min) | `@hbc/features-admin` constants |
| `PROBE_MAX_RETRY` | 3 | `@hbc/features-admin` constants |
| `ADMIN_ALERT_LIST_TITLE` | `'HBC_AdminAlerts'` | `@hbc/features-admin` constants |
| `INFRA_PROBE_LIST_TITLE` | `'HBC_InfrastructureProbeSnapshots'` | `@hbc/features-admin` constants |
| `APPROVAL_RULE_LIST_TITLE` | `'HBC_ApprovalAuthorityRules'` | `@hbc/features-admin` constants |
| Retry ceiling | 3 (confirm in T02) | `docs/maintenance/provisioning-runbook.md` — confirm constant location |

### Scope Boundary Enforcement

The following feature types must never appear in the G6 admin surface. Any code review that finds these patterns must flag them as out-of-scope violations:

- Requester-facing flows (project setup, clarification response) — G5 scope
- Coordinator approval decision flows — G4 scope
- Multi-source personal work inbox (BIC aggregation, My Work Feed) — future platform scope
- Custom notification delivery implementation — `@hbc/notification-intelligence` scope

---

## Exclusions / Non-Goals

- Do not implement new failure mode handling if it was already handled correctly in T01–T06. T07 is documentation and enforcement, not new implementation.
- Do not add admin-specific failure modes that duplicate `PROJECT_SETUP_FAILURE_MODES`. The G3 failure mode registry applies to all surfaces.

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/provisioning` | Required | `PROJECT_SETUP_FAILURE_MODES` reference |
| `@hbc/features-admin` | Required | Admin failure modes, constants |
| `apps/admin` | Target | Enforcement of integration rules |

---

## Acceptance Criteria

1. **Integration point rules documented:** All integration point rules in the table above are confirmed as implemented in T01–T06. Any violations found during T07 review are corrected.

2. **Admin failure modes documented:** AFM-01 through AFM-09 are documented in this task file (done above) and the relevant UI handles each gracefully. No admin action produces a blank page or uncaught exception.

3. **Configuration constants enforced:** No magic numbers for polling intervals, probe intervals, or retry thresholds exist in `apps/admin/` source files. All values use named constants from `@hbc/features-admin`.

4. **Scope boundary clean:** No coordinator, requester, or My Work Feed features have been introduced to the admin surface during G6 execution.

5. **DI boundary enforced:** `packages/features/admin/package.json` does **not** declare `@hbc/provisioning` as a dependency. Monitors receive data exclusively via `IProvisioningDataProvider`. If `@hbc/provisioning` appears in `@hbc/features-admin/package.json`, that is a boundary violation and must be corrected before T07 closes.

---

## Validation / Readiness Criteria

Before T07 is ready for review:

- TypeScript compilation clean across `apps/admin/` and `packages/features/admin/`
- Code review of G6 implementation against integration point rules — no violations
- Manual walkthrough: each admin failure mode in AFM-01–AFM-09 is either demonstrated or confirmed as handled by existing error boundaries

---

## Known Risks / Pitfalls

**T07 depends on T01–T06 being substantially complete.** Running T07 earlier produces a documentation-only task with nothing to enforce. The preferred approach is to run T07 as a final integration review pass.

**DI boundary regression check.** T04 implements monitors via `IProvisioningDataProvider` injection, keeping `@hbc/features-admin` free of a `@hbc/provisioning` dependency. T07 must verify this held during implementation: check that `@hbc/provisioning` does not appear in `packages/features/admin/package.json` and that no monitor file contains a direct import from `@hbc/provisioning`. If found, correct before T07 closes — this is a hard boundary rule, not a style concern.

---

## Progress Documentation Requirements

During active T07 work:

- Record any integration rule violations found and corrected
- Record whether all admin failure modes in AFM-01–AFM-09 have confirmed UI handling
- Record any scope boundary violations found and corrected

---

## Closure Documentation Requirements

Before T07 can be closed:

- Integration point rules confirmed as implemented (not just documented)
- AFM-01–AFM-09 all have confirmed UI handling
- Configuration constants rule verified — no magic numbers in `apps/admin/`
- Scope boundary confirmed clean
- All acceptance criteria verified and checked off
- TypeScript compilation clean
