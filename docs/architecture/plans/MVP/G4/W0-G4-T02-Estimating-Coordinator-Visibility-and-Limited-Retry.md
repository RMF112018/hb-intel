# W0-G4-T02 — Estimating Coordinator Visibility and Limited Retry

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 02. Specifies the Estimating SPFx coordinator-facing visibility layer and the bounded retry surface within the Estimating application.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation requires T01 to be locked and G3 acceptance gate satisfied
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3 master plan → G4 master plan → this document
**Depends on:** T01 (core summary and provisioning checklist in `RequestDetailPage`)
**Unlocks:** T07 (retry failure modes), T08 (retry boundary tests)
**Phase 7 gate:** ADR-0091 must exist on disk before implementation begins

---

## 1. Objective

Define the complete implementation specification for the Estimating Coordinator's visibility and limited retry surface within the Estimating SPFx application. This covers:

- What the Estimating Coordinator can see beyond the requester-level detail in `RequestDetailPage`
- How `@hbc/complexity` and `@hbc/step-wizard` governs the layered visibility and coordinator operational context
- What constitutes safe and bounded retry in the Estimating context
- What retry states and failure conditions are out of bounds and must route to Admin
- How the Estimating surface remains useful for coordination without becoming a quasi-admin console
- What `@hbc/ui-kit` components govern the coordinator-specific UI elements

---

## 2. Why This Task Exists

The Estimating Coordinator is operationally responsible for the project setup request on the Estimating team's side. They submitted the request (or supervise the person who did), and they need to track it through the workflow. However, their operational context and authority is meaningfully different from both the requester and the admin:

- They need to see more than the requester sees (step-level progress, failure causes, BIC ownership details, operational timestamps)
- They need less than the admin sees (no saga internals, no raw infrastructure error payloads, no cross-tenant provisioning configuration)
- They have limited but real retry capability for clearly bounded, transient failure cases
- They must route deeper structural or repeated failures to Admin — not manage them themselves

The current `ProjectSetupPage.tsx` and `RequestDetailPage.tsx` do not distinguish coordinator context from requester context beyond the basic `getProvisioningVisibility()` resolver (which returns `'full'` for both the submitter and admin roles). T02 adds the coordinator-specific detail layer on top of T01's requester surface without introducing hardcoded role-branch logic.

---

## 3. Scope

### 3.1 In Scope

- Coordinator-specific detail layer additions to `RequestDetailPage.tsx`
- Coordinator queue behavior on `ProjectSetupPage.tsx` (what coordinators see differently in the list view)
- `@hbc/complexity` gate assignments for coordinator-tier operational fields
- Bounded retry surface: retry button composition, eligibility rules, and failure-class boundary
- Out-of-bounds failure routing: how the coordinator is directed to Admin for failures outside their authority
- `@hbc/ui-kit` component assignments for coordinator-specific elements

### 3.2 Out of Scope

- Requester-level core summary (T01)
- Completion confirmation (T05)
- Admin recovery surface (T04)
- Controller review queue (T03)
- PWA equivalent (G5)
- Modifications to `@hbc/provisioning` or `@hbc/complexity` packages (ADR required)

---

## 4. Governing Constraints

1. **`@hbc/complexity` governs all coordinator progressive detail.** There must be no `if (role === 'coordinator')` or `if (role === 'Estimating')` conditional rendering logic. All coordinator-tier content is wrapped in `HbcComplexityGate` at `standard` tier minimum.
2. **Retry boundary must be observable from failure class — not inferred from role alone.** The retry button visibility must be determined by inspecting the failure's classification (transient vs. structural) and retry count — not by whether the current user is a coordinator.
3. **`@hbc/ui-kit` is the required source of all shared UI components.** No coordinator-specific component system in `apps/estimating/`.
4. **The Estimating surface must not become a quasi-admin console.** Coordinator retry is bounded. Admin-class failures must not display retry affordances in Estimating.
5. **No modification of `@hbc/provisioning` visibility resolver without an ADR.** If `getProvisioningVisibility()` needs to distinguish coordinator from requester, that change requires an ADR and must be made in the package — not worked around in the app.

---

## 5. Coordinator Context Identification

### 5.1 How Coordinator Context Is Determined

The current `getProvisioningVisibility()` function returns `'full' | 'notification' | 'none'`. It returns `'full'` for:
- Users in `['Admin', 'HBIntelAdmin']` roles
- Users whose `session.user.email === request.submittedBy`

This means the coordinator who submitted the request already sees `'full'` visibility. Coordinators who did not submit the specific request but have coordinator-level role context require a visibility determination.

**Required resolution (to be confirmed before T02 implementation):** The `@hbc/auth` `resolveEffectivePermissions` function or `usePermissionStore` must be the source for determining whether the current user has coordinator-tier access (e.g., an `Estimating.Coordinator` permission or `Estimating` role). T02 must not hardcode `session.resolvedRoles.includes('Estimating')` directly — it must use `@hbc/auth`'s permission resolution.

If `@hbc/auth` does not yet have a permission or role that identifies Estimating Coordinators distinctly, this gap must be surfaced as an ADR proposal before T02 implements visibility branching. Do not invent a local role string.

### 5.2 `@hbc/complexity` Tier Mapping

Per G3-D6 and the G3-T06 complexity gate spec, coordinator context maps to `standard` tier in `@hbc/complexity`. This means:

- Content wrapped in `<HbcComplexityGate minTier="standard">` is visible when the user's resolved complexity tier is `standard` or `expert`
- The `roleComplexityMap` in `packages/complexity/src/config/roleComplexityMap.ts` must include the Estimating Coordinator role mapping to `standard` tier
- If this mapping is absent, it must be added to the package via standard process — not implemented as a local override in `apps/estimating/`

---

## 6. Coordinator Detail Layer on `RequestDetailPage`

The following content is added to `RequestDetailPage.tsx` beyond the requester base layer (T01). All additions are wrapped in `HbcComplexityGate` at the appropriate tier.

### 6.1 Step-Level Provisioning Progress

When `request.state` is `'Provisioning'`, `'Completed'`, or `'Failed'`:

**Gate:** `<HbcComplexityGate minTier="standard">`

**Content:**
- Expanded `ProvisioningChecklist` rendering that shows per-step status (step name, result, timestamp, duration)
- The requester sees simplified step icons; the coordinator sees detailed step rows with duration and result codes
- Implementation: `ProvisioningChecklist` component (`apps/estimating/src/components/ProvisioningChecklist.tsx`) must accept a `detailLevel` prop (`'summary' | 'detailed'`); coordinator context passes `'detailed'`, requester context passes `'summary'`

**If `ProvisioningChecklist` does not currently support `detailLevel`:** The prop must be added to the component. This is an app-local component, so no ADR is required — but the change must be reflected in the reference document.

### 6.2 Failure Detail and Classification

When `request.state === 'Failed'`:

**Gate:** `<HbcComplexityGate minTier="standard">`

**Content:**
- Failure step identifier (which saga step failed)
- Failure class: one of `'transient'`, `'structural'`, `'permissions'`, `'repeated'`, `'admin-class'` — sourced from the provisioning status payload
- Failure message (human-readable, not raw stack trace — raw stack trace is `expert` tier)
- Retry count for the failed step
- Last retry timestamp (if any retries have occurred)

**Implementation:** `HbcCard` with a titled section ("Failure Detail"), rows using `HbcTypography` for each field. Failure class must be visually encoded via `HbcStatusBadge` variant appropriate to the class (`error` for structural/permissions/admin-class, `warning` for transient, `info` for repeated).

**Gate:** `<HbcComplexityGate minTier="expert">` (inside the standard-tier section)

**Content (expert tier only):**
- Raw error message from the provisioning status payload
- Step input context (what data the step was processing when it failed)
- These are diagnostic fields relevant to admins and power users — not surfaced at standard tier

### 6.3 BIC Ownership Detail

**Gate:** `<HbcComplexityGate minTier="standard">`

**Content:**
- `HbcBicDetail` (from `@hbc/bic-next-move`) renders the full ownership context — not just the compact `HbcBicBadge` shown to requesters
- `HbcBicDetail` shows: current owner, expected action, due context, blocked state (if any), handoff history summary
- Configuration: uses the same `IBicNextMoveConfig<IProjectSetupRequest>` from G3-T02

**Implementation note:** The requester sees `HbcBicBadge` (compact). The coordinator sees `HbcBicDetail` (expanded). Both are wrapped conditionally by complexity tier, not by role string.

---

## 7. Coordinator Queue View on `ProjectSetupPage`

The `ProjectSetupPage.tsx` currently renders a flat list of requests. For coordinator context, this list must be upgraded.

### 7.1 Queue Columns

The coordinator list view must display requests in a tabular format using `HbcDataTable` from `@hbc/ui-kit`, with the following columns:

| Column | Source | Display |
|--------|--------|---------|
| Project Name | `request.projectName` | Link to `/project-setup/$requestId` |
| Department | `request.department` | Text (once field is added) |
| State | `request.state` | `HbcStatusBadge` |
| Current Owner | `IBicNextMoveState.currentOwner` | From BIC config |
| Submitted | `request.submittedAt` | Relative timestamp |
| Actions | — | Contextual — see below |

### 7.2 Queue Row Actions

Each row must show contextual action affordances based on state:

| Request State | Available Actions |
|---------------|-------------------|
| `NeedsClarification` | "Return for Correction" (navigates submitter to clarification re-entry; coordinator-visible as status only if they are not the submitter) |
| `Failed` (transient / bounded) | "Retry" (shows retry button if failure is within coordinator retry bounds — see §8) |
| `Failed` (out of bounds) | "Escalate to Admin" (link to admin surface — see §8.4) |
| All others | None (read-only) |

Row actions use `HbcButton` variant `secondary` (or `ghost`) with size `small`. They must not use custom button implementations.

---

## 8. Bounded Retry Definition and Implementation

### 8.1 Governing Principle

The retry boundary is a core locked decision (G4-D3). Coordinator retry is permitted only for failure cases that are all of the following:

1. **Transient:** The failure has a transient cause (network timeout, temporary service unavailability, throttling response from SharePoint or Graph API)
2. **Bounded:** The step that failed has no side effects that would be compounded by retry (the step is idempotent or has been confirmed idempotent by G2-T08)
3. **First occurrence:** This is the first or second retry attempt on this step. Three or more failed attempts on the same step are `'repeated'` class and must route to Admin.
4. **Non-structural:** The failure is not caused by a schema mismatch, missing prerequisite data, or a provisioning logic error
5. **Non-permissions:** The failure is not caused by an insufficient permission (Sites.Selected, Group.ReadWrite.All, or any permission error)
6. **Not escalated:** The admin has not already flagged or escalated this failure instance

If all five conditions are true, coordinator retry is permitted. If any one condition is false, the failure is out of coordinator retry bounds.

### 8.2 Failure Class Determination

The implementation cannot inspect the raw exception type to determine failure class — that logic belongs in the backend or `@hbc/provisioning`. The provisioning status payload must expose a `failureClass` field (or equivalent) on `IProvisioningStatus` that is set by the backend when a failure occurs.

**Required provisioning status field (to be confirmed against current `IProvisioningStatus` model in `@hbc/models`):**
```typescript
// Expected addition to IProvisioningStatus
failureClass?: 'transient' | 'structural' | 'permissions' | 'repeated' | 'admin-class';
retryCount?: number;
escalatedAt?: string; // ISO timestamp
```

If this field does not exist on `IProvisioningStatus`, it must be added via G2 or the Project Setup plan stream (T02 or T05) before T02 implementation can gate retry on failure class. T02 must not infer failure class from error message strings.

### 8.3 Retry Button Visibility Rules

The retry button (`HbcButton` variant `primary` labeled "Retry") must be shown only when all of the following are true, evaluated in the rendering logic of `RequestDetailPage.tsx`:

```typescript
const canCoordinatorRetry =
  request.state === 'Failed' &&
  provisioningStatus?.failureClass === 'transient' &&
  (provisioningStatus?.retryCount ?? 0) < 3 &&
  !provisioningStatus?.escalatedAt &&
  complexityTier >= 'standard'; // coordinator or above
```

If `canCoordinatorRetry` is false, the retry button must not be rendered — not disabled, not grayed, not shown with a tooltip. Absence communicates clearly that retry is not appropriate here.

**Wrapping:** The retry button section must be wrapped in `<HbcComplexityGate minTier="standard">` so it is not visible to requesters even if the failure class is transient.

### 8.4 Out-of-Bounds Failure Routing

When `request.state === 'Failed'` and the failure is out of coordinator bounds (`canCoordinatorRetry === false`), the surface must show the coordinator a clear directed action:

**Component:** `HbcBanner` variant `warning` with:
- Headline: "This failure requires Admin recovery"
- Body: Short explanation of why (e.g., "This failure has occurred multiple times and cannot be safely retried from Estimating." or "This failure involves a permissions issue that requires Admin intervention.")
- Action: `HbcButton` variant `secondary` labeled "Open Admin Recovery" — this is a cross-app navigation link (see T07 §Navigation for cross-app URL construction)

The body copy must be driven by the failure class value — not hardcoded. A mapping from failure class to explanation string must be defined as a constant in the app.

### 8.5 Retry Action Implementation

When the coordinator clicks "Retry":

1. Invoke `client.retryProvisioning(projectId)` via `createProvisioningApiClient`
2. The button transitions to a loading state (`HbcButton` with `loading={true}`) while the API call is in-flight
3. On success: the provisioning store is refreshed; the request state updates via the store; the retry button's visibility is re-evaluated
4. On failure: show `HbcBanner` variant `error` with "Retry failed. If the issue persists, contact Admin." Do not enable re-retry immediately — display the banner for the current render cycle; the next store refresh will re-evaluate eligibility.

**Precondition:** The `retryProvisioning(projectId)` method must exist on the provisioning API client. Verify against `packages/provisioning/src/api-client.ts`. If the method is absent, it must be added before T02 implementation. This is a dependency on G2/backend task scope.

---

## 9. Coordinator View on `ProjectSetupPage` vs. Requester View

The `ProjectSetupPage.tsx` is currently a flat list. T02 upgrades it to use `HbcDataTable` for coordinators. However, requesters who navigate to `ProjectSetupPage` should still see a simplified list (not the full coordinator table).

**Implementation approach:** Use `<HbcComplexityGate minTier="standard">` to conditionally render the full `HbcDataTable` coordinator view vs. the simplified list view. Both views read from the same `useProvisioningStore().requests` data — only the rendering differs.

This approach preserves the single-component model and avoids role-branch logic outside the complexity gate.

---

## 10. What the Estimating Surface Must Not Become

The following behaviors are explicitly excluded from T02 scope to preserve the role boundary between Estimating (coordinator) and Admin:

| Excluded Behavior | Reason | Correct Location |
|-------------------|--------|-----------------|
| Force-retry of structural or permissions failures | Outside coordinator authority | Admin SPFx (`apps/admin/`) |
| View of raw saga configuration or tenant-level settings | Admin-only operational context | Admin SPFx |
| Manual state transition (e.g., moving request from `Failed` to `UnderReview` directly) | Admin recovery operation | Admin SPFx |
| Archiving or suppressing failure records | Admin operation | Admin SPFx |
| Any action on requests not owned by the coordinator's Estimating context | Out of scope | Admin or Accounting |
| Notification template editing or dispatch override | Out of scope entirely in G4 | Backend / Admin settings |

If an implementer finds that a use case requires one of these behaviors in Estimating, they must raise it as a design question before adding it — not implement it under T02 scope.

---

## 11. `@hbc/ui-kit` Component Assignments

| Coordinator Surface Element | Required Component | Notes |
|-----------------------------|--------------------|-------|
| Coordinator queue list | `HbcDataTable` | Replaces plain `<ul>` for coordinators |
| Failure detail card | `HbcCard` + `HbcTypography` rows | Under `HbcComplexityGate` standard |
| Failure class badge | `HbcStatusBadge` | Maps failure class to badge variant |
| Retry button | `HbcButton` variant `primary` | Only visible per §8.3 rules |
| Retry loading state | `HbcButton loading={true}` | During retry API call |
| Out-of-bounds failure banner | `HbcBanner` variant `warning` | When retry not permitted |
| Retry failed banner | `HbcBanner` variant `error` | On retry API failure |
| BIC detail component | `HbcBicDetail` | Full ownership context at standard tier |
| Expert-tier raw error | `HbcCard` + `HbcTypography` mono | For raw error message at expert tier |
| Cross-app Admin link button | `HbcButton` variant `secondary` | "Open Admin Recovery" |

---

## 12. Known Risks and Pitfalls

**R1 — `IProvisioningStatus.failureClass` field not yet defined:**
The retry boundary depends on a `failureClass` field that may not exist on `IProvisioningStatus`. If the backend does not currently set this value, the retry button cannot be safely gated. Do not implement the retry button with a fallback that shows it when the field is missing — default to not showing it when `failureClass` is undefined.

**R2 — Coordinator role not distinguished in `@hbc/auth` from requester:**
`getProvisioningVisibility()` returns the same value for coordinator-role users as for the submitter in many cases. The `@hbc/complexity` role-to-tier mapping is the correct mechanism to distinguish these contexts. If the mapping is absent from `packages/complexity/src/config/roleComplexityMap.ts`, it must be added there — not worked around locally.

**R3 — `retryProvisioning()` not on provisioning API client:**
The bounded retry action requires an API method. Verify it exists before implementation begins. If absent, the absence is a G2/backend gap that must be resolved first.

**R4 — Coordinator list view performance:**
Using `HbcDataTable` with real-time SignalR updates may cause performance issues if coordinators have many active requests. T02 must specify pagination behavior for the coordinator queue table. `HbcDataTable` supports `height` and pagination — use these.

---

## 13. Acceptance Criteria

T02 is complete when all of the following are true:

- [ ] `RequestDetailPage.tsx` shows step-level provisioning detail under `HbcComplexityGate minTier="standard"`
- [ ] Failure detail section (failure class, retry count, failure message) is visible at `standard` tier
- [ ] Raw error payload is gated at `expert` tier only
- [ ] `HbcBicDetail` renders at `standard` tier (vs. `HbcBicBadge` at `essential` tier for requesters)
- [ ] Retry button is shown only when `canCoordinatorRetry === true` (all five conditions in §8.3 satisfied)
- [ ] Out-of-bounds failures show `HbcBanner warning` with "Open Admin Recovery" action
- [ ] `ProjectSetupPage.tsx` renders `HbcDataTable` for coordinator tier users
- [ ] No `if (role === 'X')` hardcoded role-check logic in either page
- [ ] No coordinator-specific UI component systems created in `apps/estimating/` — all from `@hbc/ui-kit`
- [ ] Retry API call uses `createProvisioningApiClient.retryProvisioning()` — no bespoke fetch calls
- [ ] Build, lint, and type-check pass
- [ ] Reference document exists at `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`

---

*End of W0-G4-T02 — Estimating Coordinator Visibility and Limited Retry v1.0*
