# W0-G6-T02 — Audience Permissions and Bounded Retry Rules

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 6
> **Governing plan:** `docs/architecture/plans/MVP/G6/W0-G6-Admin-Support-and-Observability-Plan.md`
> **Related:** `docs/architecture/plans/MVP/G6/W0-G6-T01-Admin-Failures-Inbox-and-Action-Boundaries.md`; `packages/auth/`; `packages/provisioning/`

**Status:** Proposed
**Stream:** Wave 0 / G6
**Locked decisions served:** LD-03, LD-04, LD-10

---

## Shared Feature Gate Check

### Required Packages

| Package | Path | Required For | Maturity Check |
|---|---|---|---|
| `@hbc/auth` | `packages/auth/` | Permission store, `PermissionGate`, `RoleGate`, `ProtectedContentGuard` | **READY.** All four guard components and `usePermissionStore` are implemented. Admin app already uses the permission store in `routes.ts`. The full permission set for business-ops vs technical admin must be verified against the permission store definition — see Gate Outcome. |
| `@hbc/provisioning` | `packages/provisioning/` | `retryProvisioning` state machine enforcement, `STATE_TRANSITIONS`, retry count tracking | **READY.** API client and state machine are implemented. The API client's `retryProvisioning` method signature must be verified to confirm it enforces state constraints server-side, or whether client-side guard logic is needed. |
| `@hbc/features-admin` | `packages/features/admin/` | `ApprovalAuthorityApi` for approval boundary configuration | **STUB.** `ApprovalAuthorityApi.getRules()`, `upsertRule()`, `deleteRule()`, `testEligibility()` all deferred to SF17-T05. T02 may implement the `ApprovalAuthorityTable` and `ApprovalRuleEditor` UI surface, which will display empty until the API is implemented. |

### Gate Outcome

**Before beginning T02 implementation:** inspect `packages/auth/src/` to confirm the specific permission strings for business-ops and technical admin roles. The router uses `admin:access-control:view` — verify whether a separate `admin:provisioning:override` or equivalent exists, or whether the business-ops/technical admin split relies on role-level gates (`RoleGate`) rather than permission strings. Record the outcome in the Progress Documentation section of this file.

`@hbc/auth` is assessed ready for T02's permission enforcement work. `ApprovalAuthorityApi` stub is acceptable for Wave 0 — the UI surface may be built against the stub with empty data, clearly labeled.

---

## Objective

Lock the permission and retry boundary model that governs the entire G6 admin surface. After this task:

1. The business-ops lead vs. technical admin permission split is formally documented and implemented as an `@hbc/auth` gate throughout the admin app
2. Retry behavior is bounded — retry count tracking, maximum retry threshold, and the state machine enforcement contract are documented and enforced
3. Approval authority rule configuration UI (`ApprovalAuthorityTable`, `ApprovalRuleEditor`) is exposed to technical admins, with the API stub clearly labeled
4. The permission contract is documented in this task file for T01, T03, T04, T05, T06, and T07 to reference

This task is primarily a contract-locking and implementation task, not a UI build task. The UI surfaces are small; the important deliverable is the documented permission contract.

---

## Scope

- Inspect `@hbc/auth` to determine exact permission strings and/or roles for the business-ops vs. technical admin split
- Document the permission contract (which permissions gate which admin surfaces and actions) in this task file
- Implement `PermissionGate` / `RoleGate` wrappers in `apps/admin/` for any action surfaces that T01 did not already protect
- Expose `ApprovalAuthorityTable` and `ApprovalRuleEditor` from `@hbc/features-admin` in the admin surface (System Settings section), gated to technical admins
- Implement the retry ceiling: define the maximum retry attempt count, derive the current count from the provisioning request record, and enforce the ceiling in `ProvisioningOversightPage`
- Document the retry state machine contract: which `@hbc/provisioning` state transitions are valid before and after retry; what happens when the retry ceiling is reached (escalation required)

---

## Exclusions / Non-Goals

- Do not implement the `ApprovalAuthorityApi` backend persistence. That is deferred to SF17-T05.
- Do not implement coordinator-facing approval decision UI. That is G4/SPFx (LD-10).
- Do not implement alert routing permission gating. That belongs to T04.
- Do not change `@hbc/auth` package internals. T02 is a consumer of the permission store, not an implementer.

---

## Governing Constraints

- Permission enforcement must use `@hbc/auth` `PermissionGate`, `RoleGate`, or `usePermissionStore` — no custom permission logic in `apps/admin/` (LD-03)
- Retry ceiling must be grounded in the provisioning runbook threshold (currently: 3 retries before escalation recommended) — confirm with architecture owner before hardcoding (LD-04)
- All retry actions must respect `STATE_TRANSITIONS` — no retrying from states where retry is not a valid transition (LD-04)
- `ApprovalAuthorityTable` and `ApprovalRuleEditor` must come from `@hbc/features-admin` — do not duplicate in `apps/admin/` (LD-02, LD-09)

---

## Permission Contract (To Be Finalized During T02 Execution)

The following table defines the intended permission model. All `[VERIFY FROM AUTH]` items must be resolved against live `@hbc/auth` code before T02 closes.

| Surface / Action | Business-Ops Lead | Technical Admin | Permission Gate |
|---|---|---|---|
| View `/provisioning-failures` (read-only list) | ✅ Yes | ✅ Yes | `admin:access-control:view` |
| Retry action | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| Escalate action | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| Archive action | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| Force-state-transition | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| View alert badge count | ✅ Yes | ✅ Yes | `admin:access-control:view` |
| View full alert detail | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| View summary health counts | ✅ Yes | ✅ Yes | `admin:access-control:view` |
| View `ApprovalAuthorityTable` | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| Edit approval authority rules | ❌ No | ✅ Yes | `[VERIFY FROM AUTH]` |
| View system settings | ❌ No | ✅ Yes | `admin:access-control:view` |

---

## Retry Boundary Rules (To Be Confirmed During T02 Execution)

| Rule | Value | Source |
|---|---|---|
| Maximum retry attempts | 3 (confirm) | `docs/maintenance/provisioning-runbook.md` — "3 retries before escalation recommended" |
| Retry ceiling enforcement | Client-side: disable retry button when `retryCount >= max`; server-side: `retryProvisioning` must reject or no-op | Verify server-side enforcement from `@hbc/provisioning` API client |
| Post-ceiling action | Escalate is the required next action when retry ceiling is reached | `docs/maintenance/provisioning-runbook.md` |
| Retry state validity | Only valid from `Failed` state per `STATE_TRANSITIONS` | `packages/provisioning/src/state-machine.ts` |
| Retry count source | `retryCount` field on `IProjectSetupRequest` (verify field name) | `packages/models/src/provisioning/IProvisioning.ts` |

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `@hbc/auth` | Required | Permission store, guard components |
| `@hbc/provisioning` | Required | `STATE_TRANSITIONS`, `retryProvisioning` |
| `@hbc/features-admin` | Required | `ApprovalAuthorityTable`, `ApprovalRuleEditor`, `ApprovalAuthorityApi` |
| `@hbc/ui-kit` | Required | Visual composition |
| `apps/admin` | Target app | Permission gating applied here |

---

## Acceptance Criteria

1. **Permission contract documented:** This task file's Permission Contract table has no `[VERIFY FROM AUTH]` entries — all permission strings are confirmed against live `@hbc/auth` code.

2. **Action gating implemented:** Retry, escalate, archive, force-state, and alert detail are gated behind the correct permissions. Business-ops leads cannot access restricted actions.

3. **Retry ceiling enforced:** Retry is disabled when the request has reached the maximum retry count. The current count and maximum are visible before the admin triggers retry.

4. **Post-ceiling guidance shown:** When retry is disabled due to ceiling, a clear message tells the admin that escalation is the required next step, with the escalate action offered.

5. **Approval authority UI exposed:** `ApprovalAuthorityTable` is accessible to technical admins via System Settings. `ApprovalRuleEditor` allows adding/editing rules (API stub returns empty; any add/edit calls the stub upsertRule — no persistence until SF17-T05).

6. **No custom permission logic:** All permission checks use `@hbc/auth` guard components or `usePermissionStore`. No bespoke role-check logic exists in `apps/admin/` source files.

7. **Retry state machine respected:** Retry is only available for requests in `Failed` state (or other states confirmed by `STATE_TRANSITIONS` as retry-valid). Other states show retry as disabled.

---

## Validation / Readiness Criteria

Before T02 is ready for review:

- The permission contract table in this file has no `[VERIFY FROM AUTH]` entries
- Retry boundary rules table in this file has all values confirmed (not placeholders)
- TypeScript compilation clean in `apps/admin/`
- Unit tests cover: permission gate behavior for each restricted action, retry ceiling threshold enforcement, retry state validity check

---

## Known Risks / Pitfalls

**Permission string availability.** The `@hbc/auth` permission store may not have a pre-existing permission for `admin:provisioning:override`. If the required permissions do not exist in the permission store, the permission gate cannot be implemented — this would be a gate gap requiring the auth package to be extended. Inspect `@hbc/auth` before assuming the permissions exist.

**Retry count field.** The `retryCount` field may not exist on `IProjectSetupRequest`. If it is absent, the retry ceiling UI cannot be implemented without a model change. Verify before implementation.

**ApprovalAuthorityApi stub behavior.** When `ApprovalAuthorityApi.upsertRule()` is called, it returns a stub result with `ruleId: rule-${Date.now()}`. This will not persist. The UI must communicate clearly that rules are not persisted until SF17-T05.

---

## Progress Documentation Requirements

During active T02 work:

- Record the outcome of the `@hbc/auth` inspection: exact permission strings, whether a business-ops / technical admin split is role-based or permission-based
- Record whether `retryCount` exists on `IProjectSetupRequest` or needs to be added
- Record the confirmed retry threshold and the decision about whether to hardcode or read from config
- Update the Permission Contract table when all `[VERIFY FROM AUTH]` items are resolved
- Update the Retry Boundary Rules table when values are confirmed

---

## Closure Documentation Requirements

Before T02 can be closed:

- Permission contract table fully resolved — no placeholder entries
- Retry boundary rules table fully confirmed
- All acceptance criteria verified and checked off
- TypeScript compilation clean
- If any `@hbc/auth` gaps were found (missing permissions), those gaps are recorded and tracked as follow-on tasks
- If `retryCount` was absent from the model, the change to add it is committed and noted here
