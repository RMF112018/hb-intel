# W0-G6-T01 — Admin Failures Inbox and Action Boundaries

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `docs/maintenance/provisioning-runbook.md`; `packages/features/admin/src/pages/ProvisioningOversightPage.tsx`

**Status:** Proposed
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-01, LD-02, LD-03, LD-04, LD-09, LD-10

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/provisioning` | `packages/provisioning/` | Retry, escalate, archive actions; state machine validation | **READY.** `IProvisioningApiClient` exports `retryProvisioning`, `escalateProvisioning`, `archiveFailure`, `forceStateTransition`, `listRequests`. `STATE_TRANSITIONS` enforces valid next states. `PROJECT_SETUP_FAILURE_MODES` documents 10 failure scenarios. |
| `@hbc/auth` | `packages/auth/` | Route guard (`admin:access-control:view`), `PermissionGate` | **READY.** `usePermissionStore`, `PermissionGate`, `RoleGate`, `ProtectedContentGuard` all implemented. Admin app already uses `requireAdminAccessControl()` via `usePermissionStore.getState().hasPermission()`. |
| `@hbc/features-admin` | `packages/features/admin/` | Alert badge, `AdminAlertDashboard`, `useAdminAlerts` | **PARTIAL.** UI components (`AdminAlertDashboard`, `AdminAlertBadge`) and `useAdminAlerts` hook are real. `AdminAlertsApi.listActive()` returns `[]` (stub). T01 may proceed with alert badge showing stub data, clearly labeled. |
| `@hbc/ui-kit` | `packages/ui-kit/` | All visual components | **READY.** Required for all shared UI in the failures inbox. |

### Gate Outcome

T01 may proceed. `ProvisioningOversightPage` is already implemented in `apps/admin/` and provides the foundation. T01 work is refinement, action boundary enforcement, and integration of the alert badge — not a new page build. The `AdminAlertsApi` stub is acceptable for T01; alert data will be empty until T04 implements the monitors.

---

## Objective

Define and enforce the action boundaries for the admin failures inbox (`/provisioning-failures`). After this task:

1. The retry, escalate, archive, and force-state-transition actions are bounded by explicit pre-condition checks using the `@hbc/provisioning` state machine
2. Retry count is visible to the admin before they trigger a retry (LD-04)
3. The `AdminAlertBadge` is integrated in the failures inbox header to surface active alert count
4. Business-ops leads see a filtered, read-only view; technical admins see the full action set (LD-03)
5. All action boundary rules are documented in this task file and referenced in the `ProvisioningOversightPage`

---

## Scope

- Verify that `ProvisioningOversightPage` retry, escalate, and archive actions check `STATE_TRANSITIONS` before enabling the action (no actions offered for states where the transition is invalid)
- Add retry count visibility: before the admin triggers retry, show the current retry attempt count for the request; disable retry if `retryCount >= MAX_RETRY_ATTEMPTS` (document the threshold from `docs/maintenance/provisioning-runbook.md`)
- Integrate `AdminAlertBadge` from `@hbc/features-admin` in the `/provisioning-failures` page header to surface active alert count (stub data acceptable for Wave 0)
- Implement audience split: business-ops leads (`admin:access-control:view` without `admin:provisioning:override`) see a filtered read-only view; technical admins with the override permission see the full action set
- Ensure `ErrorLogPage` stub is clearly labeled as "coming in a later release" — no further work on that route in T01

---

## Exclusions / Non-Goals

- Do not implement the alert monitor logic. That belongs to T04.
- Do not implement the approval authority configuration UI. That belongs to T02.
- Do not implement embedded runbook links. That belongs to T05.
- Do not implement infrastructure probe results. That belongs to T06.
- Do not implement coordinator approval decisions. Coordinator actions are SPFx G4 scope (LD-10).

---

## Governing Constraints

- All retry/escalate/archive actions must validate against `STATE_TRANSITIONS` from `@hbc/provisioning` (LD-04 — safe bounded retry)
- Retry count must be surfaced before the admin triggers retry (LD-04)
- Permission boundary enforced via `@hbc/auth` `PermissionGate` — not custom logic (LD-03)
- `AdminAlertBadge` must come from `@hbc/features-admin`; do not re-implement it in `apps/admin/` (LD-02)
- No new reusable visual components outside `@hbc/ui-kit` (LD-09)

---

## Action Boundary Rules

These rules govern which actions are enabled for each provisioning state. Derived from `@hbc/provisioning` `STATE_TRANSITIONS`.

| State | Retry Allowed | Escalate Allowed | Archive Allowed | Force-State Allowed |
|---|---|---|---|---|
| `Failed` | Yes (if retryCount < threshold) | Yes | Yes | Technical admin only |
| `Provisioning` (stuck) | No (in-progress) | Yes | No | Technical admin only |
| `ReadyToProvision` | No | No | No | Technical admin only |
| `AwaitingExternalSetup` | No | Yes | No | Technical admin only |
| `NeedsClarification` | No | No | No | No |
| `Completed` | No | No | No | No |
| `Submitted` / `UnderReview` | No | No | No | Technical admin only |

**Retry count threshold:** Per `docs/maintenance/provisioning-runbook.md` alert thresholds — 3 retries before escalation is recommended. Surface the current count and the threshold prominently before enabling retry.

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `apps/admin` | Target app | Route and page modifications live here |
| `@hbc/provisioning` | Required | `STATE_TRANSITIONS`, `IProvisioningApiClient`, `retryProvisioning`, `escalateProvisioning`, `archiveFailure` |
| `@hbc/auth` | Required | `PermissionGate`, `usePermissionStore` for audience split |
| `@hbc/features-admin` | Required | `AdminAlertBadge`, `useAdminAlerts` |
| `@hbc/ui-kit` | Required | All visual components |
| `@hbc/complexity` | Existing (already in admin app) | Already in `ComplexityProvider` in admin `App.tsx` |

---

## Acceptance Criteria

1. **State-gated actions:** Retry, escalate, and archive buttons are only enabled for states where the action is valid per `STATE_TRANSITIONS`. Invalid actions are hidden or disabled with a clear reason.

2. **Retry count visible:** Before triggering retry, the admin sees the current retry attempt count for the request and the threshold. Retry is disabled when `retryCount >= threshold`.

3. **Alert badge integrated:** `AdminAlertBadge` appears in the failures inbox header showing active alert count (may show 0 if `AdminAlertsApi` is still stub).

4. **Audience split enforced:** Business-ops leads see a read-only filtered view with no action buttons. Technical admins see the full action set. Permission check uses `@hbc/auth` `PermissionGate`, not custom logic.

5. **Force-state restricted:** The force-state-transition action is only visible to technical admins (not business-ops leads) and requires explicit confirmation before executing.

6. **Error log labeled:** `/error-log` route clearly communicates that this feature is not yet available; no misleading empty state.

7. **No new reusable primitives:** All visual components in the failures inbox come from `@hbc/ui-kit` or `@hbc/features-admin`. No new shared components created in `apps/admin/`.

---

## Validation / Readiness Criteria

Before T01 is ready for review:

- TypeScript strict-mode compilation passes with no new errors in `apps/admin/`
- Unit tests cover: state-gate logic (each state tested for expected action availability), retry count threshold enforcement, audience split permission check
- Manual walkthrough: admin user can navigate to `/provisioning-failures`, see requests, and trigger retry on a `Failed` request
- Manual walkthrough: business-ops lead cannot see action buttons

---

## Known Risks / Pitfalls

**`ProvisioningOversightPage` already exists.** T01 is refinement, not new construction. Inspect the existing implementation before adding new logic — some action boundary enforcement may already be present.

**`retryCount` field availability.** Verify that `IProjectSetupRequest` (from `@hbc/models`) includes a `retryCount` or equivalent field. If not, this field must be added or derived from the provisioning event log before retry count visibility can be implemented.

**Permission name for override actions.** The `admin:access-control:view` permission is confirmed in the router. The permission for provisioning override actions (`admin:provisioning:override` or equivalent) must be verified against the `@hbc/auth` permission store before implementation. If the permission name differs, update this task file.

---

## Progress Documentation Requirements

During active T01 work:

- Record the actual permission name for provisioning override actions once verified from `@hbc/auth`
- Record whether `retryCount` is available in the provisioning model or needs to be added
- Record the confirmed retry threshold value

---

## Closure Documentation Requirements

Before T01 can be closed:

- Action boundary rules table in this file updated with any corrections found during implementation
- Retry threshold value and retry count field source confirmed and recorded in this file
- All acceptance criteria verified and checked off
- TypeScript compilation clean in `apps/admin/`
- No pending TODO items related to action boundary enforcement
