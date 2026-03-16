# W0-G4-T04 — Admin Oversight, Escalation, and Recovery Surface Boundaries

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 04. Specifies the Admin SPFx provisioning oversight surface, escalation and recovery ownership, what admin users can see and do that coordinators and controllers cannot, and what the Admin surface must explicitly not duplicate from other surfaces.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation requires G3 acceptance gate to be satisfied and ADR-0091 to exist on disk
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3 master plan → G4 master plan → this document
**Unlocks:** T07 (admin failure modes), T08 (admin boundary tests)
**Phase 7 gate:** ADR-0091 must exist on disk before implementation begins

---

## 1. Objective

Define the complete implementation specification for the Admin SPFx provisioning oversight, escalation, and recovery surface. This covers:

- What the Admin SPFx app owns in Wave 0 for provisioning-related work
- How the existing `ProvisioningFailuresPage.tsx` is extended and governed
- What escalation and recovery actions are exclusively admin-class
- What admin users can see that coordinators and controllers cannot
- How `@hbc/ui-kit` governs shared admin/status/recovery presentation patterns
- What the Admin surface must not duplicate from Estimating or Accounting
- How this surface aligns with provisioning/admin recovery doctrine

---

## 2. Why This Task Exists

The Admin SPFx app already has a functional `ProvisioningFailuresPage.tsx` (validated as existing, fixed in the wave-0 validation report which corrected a router bug). However:

- The existing page provides retry and escalate action buttons, but its scope relative to the coordinator's bounded retry and the controller's routing actions has not been formally defined
- The boundary between "coordinator safe retry" (T02) and "admin recovery" (T04) must be explicit — without it, implementers will either duplicate actions across surfaces or leave recovery gaps
- The admin oversight function extends beyond failure recovery to include provisioning run monitoring, escalation status, and visibility into all active and failed runs
- The visual composition of the admin surface must use `@hbc/ui-kit` exclusively, and this must be explicitly specified

T04 governs the expansion of the existing admin surface and defines its permanent authority boundary.

---

## 3. Scope

### 3.1 In Scope

- Expansion of `apps/admin/src/pages/ProvisioningFailuresPage.tsx` to meet full oversight specification
- Definition of admin-exclusive actions (escalation, force-retry, failure archival)
- Specification of what is visible to admin that is not visible to coordinator or controller
- `@hbc/complexity` tier assignments for admin context
- `@hbc/ui-kit` component assignments for all admin surface elements
- Navigation to the admin surface from Estimating (coordinator "Open Admin Recovery") and Accounting (controller "Send to Admin") — entry point specification

### 3.2 Out of Scope

- Requester setup form (T01)
- Coordinator retry surface (T02)
- Controller review queue (T03)
- Completion confirmation (T05)
- `SystemSettingsPage.tsx` and `ErrorLogPage.tsx` — these are existing admin pages that T04 does not modify
- Backend provisioning saga implementation (G2 scope)
- PWA equivalent (G5)

---

## 4. Governing Constraints

1. **`@hbc/ui-kit` is the required source of all shared UI components.** No app-local admin reusable component systems.
2. **`@hbc/complexity` governs all progressive detail.** Admin context maps to `expert` tier. Admin-exclusive content is wrapped in `HbcComplexityGate minTier="expert"`.
3. **The admin surface must not duplicate the controller's review function.** Approving/rejecting requests is the controller's job. Admin sees provisioning execution — not the intake review workflow.
4. **The admin surface must not duplicate the coordinator's visibility.** Coordinators see simplified operational detail. Admins see the full saga diagnostic output. The difference must be governed by `@hbc/complexity` tier — not separate pages.
5. **Admin retry must use the same provisioning API client.** No direct backend-bypass fetch calls.
6. **`@hbc/auth` governs all admin-access gating.** Admin role detection uses `@hbc/auth` primitives — not app-local role string checks.

---

## 5. Admin SPFx Surface Structure

The Admin app's provisioning oversight is centered on the existing `ProvisioningFailuresPage.tsx` at route `/provisioning-failures`. T04 expands this page. It does not introduce a new page for the core oversight function.

### 5.1 Existing Implementation (Validated State)

`apps/admin/src/pages/ProvisioningFailuresPage.tsx`:
- Loads failed runs via `client.listFailedRuns()`
- Renders `HbcDataTable` with columns for project name, state, and timestamp
- Has action buttons: retry and escalate
- Uses `useCurrentSession()` and `createProvisioningApiClient()`

The route was previously broken (pointing to `SystemSettingsPage` instead) — this was fixed in the wave-0 validation report. T04 extends the existing correct implementation.

### 5.2 T04 Expansion Requirements

The following capabilities must be added or upgraded in the admin provisioning surface:

**1. Scope expansion beyond failures:**
The page is currently named `ProvisioningFailuresPage` and loads only `client.listFailedRuns()`. T04 expands its scope to show all active provisioning runs (not only failures), organized by state. Renaming the route or page is optional — if renamed, the router entry must be updated and the current-state-map must be updated accordingly.

**2. State filter tabs:**
Add `HbcTabs` filter for:
- "Active Runs" (`Provisioning` state)
- "Failures" (`Failed` state)
- "Completed" (`Completed` state — for recent runs, capped to last 30 days or 50 records)
- "All" (combined view)

**3. Escalation status display:**
Requests that have been escalated (via the `escalatedAt` field on `IProvisioningStatus`) must be visually distinguished in the table using an `HbcStatusBadge variant="warning"` or equivalent escalation indicator.

**4. Full saga step detail:**
The admin detail view must show the full provisioning saga step log — all 7 steps (or however many are defined in the current saga), their results, durations, and raw error payloads. This is gated at `expert` tier via `HbcComplexityGate`.

---

## 6. Admin-Exclusive Actions

The following actions are exclusively available to admin users (not coordinator, not controller):

### 6.1 Force-Retry (Admin Class)

**When available:** Any `Failed` state request — regardless of failure class (including `'structural'`, `'permissions'`, `'repeated'`, `'admin-class'`)

**Implementation:**
- Button: `HbcButton variant="primary"` labeled "Force Retry"
- Confirmation: `HbcConfirmDialog` with explicit warning: "Force-retrying a structural or permissions failure may produce duplicate partial state if the failed step was not idempotent. Confirm only if you have investigated the failure cause."
- API call: `client.retryProvisioning(projectId)` — same endpoint as coordinator retry; the distinction is that admin can call it regardless of failure class
- On success: provisioning state updates; table row refreshes
- On failure: `HbcBanner variant="error"`

### 6.2 Failure Archival (Suppress from Queue)

**When available:** Any `Failed` state request that has been investigated and does not need further provisioning (e.g., the project was cancelled)

**Implementation:**
- Button: `HbcButton variant="secondary"` labeled "Archive Failure"
- Confirmation: `HbcConfirmDialog` — "Archive this failure? The request will be moved to the archive and will no longer appear in the active failures queue."
- API call: `client.archiveFailure(projectId)` or equivalent — verify against current provisioning API; add method if absent
- On success: request removed from active queue; visible in archived view (separate tab or behind a filter)

### 6.3 Escalation Acknowledgment

**When available:** Any `Failed` request that has been escalated (coordinators directed to admin, or the system auto-escalated after 3 retries)

**Implementation:**
- Button: `HbcButton variant="secondary"` labeled "Acknowledge Escalation"
- No modal required — immediate action
- API call: `client.acknowledgeEscalation(projectId)` or equivalent — sets an `escalationAcknowledgedAt` field
- On success: escalation badge updates; record remains in queue

### 6.4 Manual State Override (Expert Tier Only)

**When available:** Admin users at `expert` complexity tier only, and only when a request is stuck in a transitional state (not `Completed`, not `Failed` — e.g., stuck in `Provisioning` due to a hung saga step)

**Gate:** `<HbcComplexityGate minTier="expert">`

**Implementation:**
- Renders a state override action with a select (dropdown of allowed next states from `STATE_TRANSITIONS`) and a confirmation dialog
- This is a last-resort escape hatch — the confirmation dialog must strongly communicate the risk
- API call: `client.forceStateTransition(projectId, targetState)` — verify existence; add if needed

---

## 7. Admin Visibility Tier

Admin users resolve to `expert` tier in `@hbc/complexity`. This means:

- All `essential` tier content is visible (universal core summary)
- All `standard` tier content is visible (coordinator-level operational detail)
- All `expert` tier content is visible (raw saga diagnostics, error payloads, step input/output context, internal IDs, tenant configuration references)

The `roleComplexityMap` in `packages/complexity/src/config/roleComplexityMap.ts` must include `Admin` and `HBIntelAdmin` roles mapped to `expert` tier. Verify this mapping exists before T04 implementation.

### 7.1 Expert-Tier Visibility Fields

The following fields are visible to admin (expert tier) and must be wrapped in `HbcComplexityGate minTier="expert"` in the detail view:

| Field | Source | Display |
|-------|--------|---------|
| Raw error stack / message | `IProvisioningStatus.errorDetails` | `HbcCard` + `HbcTypography` monospace |
| Step input/output context | `IProvisioningStatus.stepContext` (if available) | Expandable code block |
| Entra ID group IDs created | Provisioning step output | `HbcTypography` monospace |
| SharePoint site URL constructed | Provisioning step output | Link |
| Graph API call sequence | Diagnostic field (if available) | Collapsible section |
| Tenant configuration reference | Environment/config values | `HbcTypography` |

If fields marked "if available" do not exist on `IProvisioningStatus`, note the gap explicitly in the reference document — do not render empty cards. Show these sections only when the data is present.

---

## 8. Entry Points from Other Surfaces

### 8.1 From Estimating (Coordinator Out-of-Bounds Failure)

When the coordinator's T02 surface shows the out-of-bounds failure banner ("Open Admin Recovery"), the link must navigate to the Admin app's provisioning oversight page with the specific request pre-selected or filtered.

**URL construction:** The Admin app's `/provisioning-failures` route (or its renamed equivalent) should accept an optional `?projectId=` query parameter that pre-selects the relevant request in the table.

T04 must specify that the route handler reads `?projectId` from the URL and auto-highlights or opens the detail view for that project. This requires a minor addition to the Admin router's `projectReviewDetailRoute` equivalent.

### 8.2 From Accounting (Controller "Send to Admin")

Similarly, the controller's T03 surface "Send to Admin" button navigates to the admin surface with `?projectId=` set. The same pre-selection behavior applies.

### 8.3 Navigation Back

The admin surface does not need to navigate back to Accounting or Estimating after taking action. Admin actions are terminal within the admin context. The coordinator and controller will see updated state when they next view their respective surfaces.

---

## 9. What the Admin Surface Must Not Duplicate

The following behaviors are explicitly excluded from T04 to maintain clear role boundaries:

| Excluded Behavior | Reason | Correct Surface |
|-------------------|--------|----------------|
| Request intake form or guided wizard | Requester function | Estimating (T01) |
| Approval or clarification actions for `UnderReview` requests | Controller function | Accounting (T03) |
| Simple bounded transient-only retry | Coordinator function | Estimating (T02) |
| User-facing project setup status for requesters | Requester's view | Estimating (T01) |
| Project Hub navigation or handoff composition | Completion function | T05 |
| Notification template editing | Backend/settings function | Out of G4 scope |

If a use case surfaces during implementation that seems to require one of these in the Admin app, it must be raised as a design question before implementation — not added under T04 scope.

---

## 10. `@hbc/ui-kit` Component Assignments

| Admin Surface Element | Required Component | Notes |
|-----------------------|--------------------|-------|
| Page shell | `WorkspacePageShell layout="list"` | Existing pattern |
| Provisioning run table | `HbcDataTable<IProvisioningStatus>` | Replace existing table if needed |
| State badge | `HbcStatusBadge` | All state and escalation badges |
| Escalation indicator | `HbcStatusBadge variant="warning"` | On escalated rows |
| Force retry button | `HbcButton variant="primary"` | Admin retry action |
| Archive button | `HbcButton variant="secondary"` | Archive failure |
| Escalation acknowledge | `HbcButton variant="secondary"` | Escalation ack |
| Confirmation dialogs | `HbcConfirmDialog` | All destructive/risky actions |
| Raw error display | `HbcCard` + `HbcTypography` | Expert-tier diagnostic field |
| Action failure banner | `HbcBanner variant="error"` | On API failure |
| Expert-tier section | `HbcComplexityGate minTier="expert"` | All expert content |
| Filter tabs | `HbcTabs` | State filter strip |
| Empty state | `HbcEmptyState` | Empty failure queue |
| State override select | `HbcForm` select or dropdown | Expert-tier override |

---

## 11. Known Risks and Pitfalls

**R1 — Admin-class API methods may not exist:**
`archiveFailure`, `acknowledgeEscalation`, and `forceStateTransition` are likely not yet on the provisioning API client. These must be added to both the backend API and `createProvisioningApiClient` before T04 can implement those actions.

**R2 — `expert` tier not mapped for Admin in `@hbc/complexity`:**
If `roleComplexityMap.ts` does not map `Admin` / `HBIntelAdmin` to `expert`, the gate-based visibility will not function correctly. Verify and add if missing — this is a package-level change that must be made in `@hbc/complexity`, not in the app.

**R3 — `IProvisioningStatus` missing diagnostic fields:**
The expert-tier diagnostic fields (step context, Entra ID group IDs, raw error payload) may not exist on `IProvisioningStatus` in `@hbc/models`. T04 should not fabricate these fields. The implementation must show expert-tier sections only when the data is present; missing fields must be documented as gaps for a future G2/backend amendment.

**R4 — Page scope ambiguity:**
The page is currently named `ProvisioningFailuresPage` but T04 expands it to show all active runs. If the page is renamed, the router, imports, and current-state-map must all be updated consistently.

---

## 12. Acceptance Criteria

T04 is complete when all of the following are true:

- [ ] `ProvisioningFailuresPage.tsx` (or renamed equivalent) shows active runs, failures, and completed runs via state filter tabs
- [ ] Force-retry, archive, and escalation-acknowledgment actions are implemented with confirmation dialogs
- [ ] Expert-tier diagnostic fields (raw error, step context) are wrapped in `HbcComplexityGate minTier="expert"`
- [ ] `?projectId=` query parameter pre-selects or highlights the relevant request when navigated from Estimating or Accounting
- [ ] Manual state override capability is implemented at expert tier with strong confirmation warnings
- [ ] No approval/clarification actions from the controller workflow in the Admin surface
- [ ] No guided wizard or requester intake form in the Admin surface
- [ ] All actions use `createProvisioningApiClient` methods — no bespoke fetch calls
- [ ] No hardcoded role-check logic outside `@hbc/auth` / `@hbc/complexity`
- [ ] Build, lint, and type-check pass
- [ ] Reference document exists at `docs/reference/spfx-surfaces/admin-recovery-boundary.md`

---

*End of W0-G4-T04 — Admin Oversight, Escalation, and Recovery Surface Boundaries v1.0*
