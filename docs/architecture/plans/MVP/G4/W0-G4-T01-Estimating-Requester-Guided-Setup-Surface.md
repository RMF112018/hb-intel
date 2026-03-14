# W0-G4-T01 — Estimating Requester Guided Setup Surface

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 01. Specifies the Estimating SPFx requester-facing guided project setup surface, its step-wizard composition, post-submit status display, draft/resume behavior, and clarification-return experience.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation may not begin until G3 acceptance gate is satisfied and ADR-0090 exists on disk
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3 master plan → G4 master plan → this document
**Unlocks:** T02 (coordinator layer on same RequestDetailPage surface), T05 (completion entry point in Estimating), T07 (wizard failure modes)
**Phase 7 gate:** ADR-0090 must exist on disk before implementation begins

---

## 1. Objective

Define the complete implementation specification for the Estimating SPFx requester-facing project setup surface. This covers:

- How the requester enters the guided setup workflow from the Estimating application
- How the existing `NewRequestPage.tsx` is upgraded to a multi-step guided flow using `@hbc/step-wizard`
- What draft/resume and clarification-return behavior the requester experiences
- How post-submit status is shown in `RequestDetailPage.tsx` for the requester context
- What `@hbc/ui-kit` components and layout primitives govern the requester surface
- What this surface assumes from G3 contracts and backend/shared-platform layers
- What this surface must not reimplement

This task plan does not define the coordinator's visibility layer on top of the same surface — that is T02's responsibility. It does not define the completion confirmation — that is T05's responsibility.

---

## 2. Why This Task Exists

The current `NewRequestPage.tsx` in `apps/estimating/src/pages/` implements a single flat form with six fields (`projectName`, `projectLocation`, `projectType`, `projectStage`, `groupMembers`, `opexManagerUpn`) submitted as a one-shot API call. This form:

- Does not use `@hbc/step-wizard` (violates G3-D1 and the wave-0 validation finding)
- Does not include the `department` field (required by the provisioning contract per G1-T01 and G2-T02)
- Does not persist draft state via `@hbc/session-state` (violates G3-D4)
- Does not support clarification-return re-entry (violates G3-D2)
- Does not use progressive validation per step (user sees no per-step feedback)
- Does not provide post-submit visibility tied to `@hbc/complexity` layering (violates G3-D5/D6)

T01 governs the replacement of this form with a governed, multi-step, draft-persistent, clarification-aware guided setup experience. The existing page file may be refactored in place — no entirely new page route is required unless the routing model demands it — but the implementation must satisfy every requirement in this plan.

---

## 3. Scope

### 3.1 In Scope

- Upgrade of `apps/estimating/src/pages/NewRequestPage.tsx` to use `@hbc/step-wizard`
- Definition of all setup wizard steps with field assignments, validation rules, and step-level metadata
- `@hbc/session-state` `useDraft` integration for auto-save and resume behavior per G3-T05 draft key registry
- Clarification-return re-entry behavior following G3-T03 re-entry spec
- Post-submit status display in `apps/estimating/src/pages/RequestDetailPage.tsx` for the requester visibility context
- Entry point composition in `ProjectSetupPage.tsx` (the "New Project Setup Request" trigger)
- `@hbc/ui-kit` component assignments for every shared UI element in the requester path
- Route and navigation specification within `apps/estimating/src/router/routes.ts`

### 3.2 Out of Scope

- Coordinator-specific detail layer on `RequestDetailPage` (T02)
- Completion confirmation and Project Hub handoff (T05)
- Tablet-safe layout specification (T07 governs responsive rules; T01 must be consistent with T07's output)
- Backend provisioning saga changes (G2 scope)
- Modifications to `@hbc/step-wizard`, `@hbc/session-state`, or `@hbc/provisioning` packages (changes to those packages require ADRs and are not G4 scope)
- PWA equivalent surface (G5)

---

## 4. Governing Constraints

The following constraints are binding. Deviating from any of them requires a superseding ADR.

1. **`@hbc/ui-kit` is the required source of all shared UI components.** The requester setup surface must not create app-local reusable UI component systems. Page-local composition is acceptable; reusable presentation primitives must come from `@hbc/ui-kit`.
2. **`@hbc/step-wizard` governs the multi-step guided flow.** The implementation must use `useStepWizard(config, item)` with the `IStepWizardConfig<IProjectSetupRequest>` produced by G3-T01. No app-local step-progression logic.
3. **`@hbc/session-state` governs draft persistence.** The implementation must use `useDraft<IProjectSetupRequest>(key, ttlHours)` with the key and TTL from the G3-T05 draft key registry. No alternative storage mechanism (e.g., `localStorage` directly, URL params) for draft state.
4. **`@hbc/auth` governs all authorization decisions.** No role-check logic outside `@hbc/auth` primitives.
5. **`@hbc/complexity` governs post-submit progressive detail.** The requester's post-submit view must use `HbcComplexityGate` for any operational detail that exceeds the universal core summary. No hardcoded role-specific rendering.
6. **No forced redirect on completion.** The completion event must be handled by T05's completion confirmation surface. T01 must not implement its own redirect-on-completion behavior.
7. **`@hbc/provisioning` is the lifecycle seam.** Status data must be read from `useProvisioningStore()` and the `createProvisioningApiClient(...)`. The existing `getProvisioningVisibility()` function is the visibility resolver — T01 does not reimplement it.
8. **The requester setup workflow stays in Estimating.** The guided setup form is not relocated to Project Hub, Admin, or a standalone SPFx page.

---

## 5. Entry Point: From Estimating to the Guided Setup Flow

### 5.1 Entry Surface Location

The requester's entry point is the existing "New Project Setup Request" action in `ProjectSetupPage.tsx`, which currently renders as a `<Link to="/project-setup/new">` button. This route (`/project-setup/new`) maps to `NewRequestPage.tsx`.

No new route is required. The existing route is preserved. The component at that route is upgraded.

**Existing route registration** (from `apps/estimating/src/router/routes.ts`):

```typescript
const newProjectSetupRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup/new',
  component: lazyRouteComponent(() => import('../pages/NewRequestPage.js').then(...)),
});
```

This registration is correct and must not be changed. If a new route for a clarification-return entry is needed (T03 of G3 may require a parameterized re-entry route), it must be added alongside the existing route — not replacing it.

### 5.2 Entry Trigger Text and Context

The trigger in `ProjectSetupPage.tsx` is currently labeled "New Project Setup Request." This label is acceptable for Wave 0. Implementers must not change it to something that implies the flow will navigate them out of Estimating (e.g., "Launch Project Setup Portal").

### 5.3 Resume Detection at Entry

When the requester navigates to `/project-setup/new`, the implementation must check `useDraft<IProjectSetupRequest>('setup-wizard-draft')` for an existing in-progress draft. If a draft exists:

- Do not begin a blank new form
- Show a resume card at the top of the wizard using `HbcBanner` (from `@hbc/ui-kit`) with the message: "You have a saved project setup request in progress. Resume where you left off, or start a new request."
- Provide two affordances: "Resume" (restores draft into wizard state) and "Start New" (clears the draft and begins fresh, after confirmation via `HbcConfirmDialog`)

If no draft exists, begin the wizard in the initial step state.

---

## 6. Step-Wizard Composition

### 6.1 Governing Contract

The `IStepWizardConfig<IProjectSetupRequest>` produced by G3-T01 is the definitive source for step definitions, field-to-step assignment, step validation functions, and the `orderMode` setting. T01 (this task) applies that configuration — it does not independently define the step configuration.

The following is the required application shape. Implementers must substitute with the actual G3-T01 config output once that contract is locked.

### 6.2 Assumed Step Structure (Pre-G3-T01 Placeholder — Replace with Locked Contract)

Until G3-T01 is locked, the following step structure reflects the current validated fields in `NewRequestPage.tsx` plus the G1-required `department` field, organized into a logical guided flow. This structure is a working assumption, not a locked specification.

| Step Index | Step Name | Key Fields | Validation |
|-----------|-----------|------------|------------|
| 0 | Project Identification | `projectName`, `projectLocation`, `department` | All fields required; `department` must be `'commercial' \| 'luxury-residential'` |
| 1 | Project Type and Stage | `projectType`, `projectStage` | `projectType` from allowed enum; `projectStage` required |
| 2 | Team and Ownership | `groupMembers`, `opexManagerUpn` | At least one group member required; `opexManagerUpn` required |
| 3 | Review and Submit | Read-only summary of all entered fields | No new input; user confirms before submit |

**Clarification-return flag:** If the request has returned from `NeedsClarification` state, steps that have been flagged by the controller (per G3-T03 re-entry spec) must be visually marked. Implementation: `HbcStepProgress` receives a `flaggedSteps` prop array from the BIC clarification context; each flagged step shows an indicator (use `HbcStatusBadge` variant `warning` adjacent to the step label in `HbcStepSidebar`).

### 6.3 Step Component Composition

Each step is rendered as a page section within `HbcStepWizard`'s body slot. Steps use the following `@hbc/ui-kit` primitives:

- **Field wrapper:** `HbcFormField` for label, input, and validation message layout
- **Text inputs:** `HbcInput` for `projectName`, `projectLocation`
- **Select inputs:** `HbcForm`'s select control (or `@hbc/ui-kit` dropdown) for `projectType`, `projectStage`, `department`
- **People picker:** `HbcPeoplePicker` for `groupMembers` and `opexManagerUpn`
- **Step navigation buttons:** The `@hbc/step-wizard` `HbcStepWizard` component provides navigation controls; implementers must not render custom Back/Next/Submit buttons outside the wizard's button slot
- **Review step:** A read-only summary section using `HbcCard` with `HbcTypography` rows for each field; do not render raw `<dl>` or custom layout outside `@hbc/ui-kit` primitives

### 6.4 Auto-Save Integration

The wizard must integrate `useDraft<IProjectSetupRequest>('setup-wizard-draft', 72)` (72-hour TTL per G3-T05 draft key registry assumption — replace with locked G3-T05 value).

Auto-save behavior:
- Trigger auto-save 800ms after any field change (debounced)
- Render `HbcSyncStatusBadge` (from `@hbc/session-state`) in the wizard header area to show "Saved" / "Saving..." / "Save failed" state
- On connectivity loss, show `HbcConnectivityBar` at top of the wizard surface
- Do not prevent navigation away from the wizard on connectivity loss; draft state should have already persisted the last successful save

### 6.5 Validation and Error Display

Each step validates before allowing progression to the next step. Validation is defined in the `IStepWizardConfig<IProjectSetupRequest>` step definitions. T01 does not define its own per-field validation logic outside what `@hbc/step-wizard` provides.

Inline validation errors must use `HbcFormField`'s `errorMessage` prop — not custom alert components or DOM-adjacent `<span>` elements.

Global step-level validation errors (when the entire step fails for a non-field-specific reason) must use `HbcBanner` variant `error` rendered in the wizard body above the field content.

---

## 7. Post-Submit Status Display

### 7.1 Route and Surface

After the requester submits the setup request, they are navigated to `/project-setup/$requestId`, which maps to `RequestDetailPage.tsx`. This route exists and is registered:

```typescript
const requestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/project-setup/$requestId',
  component: lazyRouteComponent(() => import('../pages/RequestDetailPage.js').then(...)),
});
```

The `RequestDetailPage.tsx` is already implemented with `useProvisioningStore()`, `useProvisioningSignalR()`, and `getProvisioningVisibility()`. T01 specifies the requester-context rendering of that page. T02 specifies the coordinator-context additions on top of it.

### 7.2 Requester Context Rules

The requester sees `RequestDetailPage` in requester context when `getProvisioningVisibility(session, request.submittedBy)` returns `'full'` (because the session user matches the submitter) or `'notification'` (for non-admin, non-submitter users who are in the project group).

For Wave 0, T01 governs the **submitter's** view (`'full'` visibility context). The `'notification'` view is a degraded summary for project group members and is addressed in T06.

### 7.3 Requester Detail View Composition

The requester's `RequestDetailPage` must display the following, using `@hbc/ui-kit` and G3 contracts:

**Core summary section** (always visible — no complexity gate):
- Project name (`HbcTypography` heading)
- Current state (`HbcStatusBadge` from `@hbc/ui-kit` — state value from `request.state`)
- Current owner / expected action (`HbcBicBadge` from `@hbc/bic-next-move` using `IBicNextMoveConfig` from G3-T02)
- Submission timestamp
- Last-updated timestamp

**Status context section** (always visible — plain-language):
- A human-readable explanation of what the current state means for the requester. These descriptions must be defined as a map keyed by `ProjectSetupRequestState` value and expressed in plain, non-technical language (e.g., "Your request is being reviewed by the Controller. You'll be notified when it's approved or if we need more information.").
- Rendered using `HbcCard` with `HbcTypography` body text.

**Clarification section** (visible only when `request.state === 'NeedsClarification'`):
- `HbcBanner` variant `warning` with headline "Action Required — Clarification Needed"
- Description of what was flagged (sourced from the clarification note field on the request — field name TBD by G3-T03 spec)
- Primary action: `HbcButton` labeled "Return to Setup Form" — navigates to `/project-setup/new` with re-entry parameters set per G3-T03 re-entry spec

**Provisioning progress section** (visible when `request.state === 'Provisioning'` or `'Completed'`):
- Rendered using `ProvisioningChecklist` component (`apps/estimating/src/components/ProvisioningChecklist.tsx` — existing component)
- For requester context: `ProvisioningChecklist` should show step-level completion state in simplified form (step names, status icons, no raw error payloads at this tier)
- SignalR live updates already handled by existing `useProvisioningSignalR()` hook — T01 does not change this wiring

**Complexity-gated detail section** (standard tier minimum — coordinator and admin only):
- Step-level failure detail, retry eligibility, raw error payloads are gated at `standard` tier in `HbcComplexityGate`
- Requester sees this section as collapsed/hidden unless their complexity tier is `standard` or above
- This section is defined in detail in T02 and T06 — T01 identifies the gate boundary only

### 7.4 Completion Entry Point

When `request.state === 'Completed'`, the requester detail view must show the completion confirmation entry point. This is specified in T05 — T01 must reserve the visual slot in `RequestDetailPage` for T05's completion surface (do not implement the completion surface in T01).

---

## 8. Clarification-Return Re-Entry

### 8.1 Governing Spec

The re-entry behavior is specified by G3-T03's clarification re-entry integration spec (`docs/reference/workflow-experience/clarification-reentry-spec.md`). T01 applies that spec in the Estimating SPFx context.

### 8.2 Re-Entry Trigger

When the requester clicks "Return to Setup Form" in the clarification section of `RequestDetailPage`, the navigation must:

1. Preserve the existing draft state (do not clear the draft before navigating)
2. Navigate to `/project-setup/new` with a query parameter or state that signals clarification-return mode (e.g., `?mode=clarification&requestId={requestId}`)
3. The `NewRequestPage` / guided wizard detects the clarification-return mode parameter and opens the wizard in clarification-return mode per G3-T03 spec

### 8.3 Re-Entry Wizard Behavior

In clarification-return mode:
- Restore all previously entered data from `useDraft<IProjectSetupRequest>('setup-wizard-draft')` — no fields are cleared
- Open the wizard at the first flagged step (per G3-T03 spec, the flagged step list comes from the request's clarification payload)
- Mark each flagged step with a `warning` badge in `HbcStepSidebar` and a `HbcBanner` at the top of the step body explaining what is flagged
- All non-flagged steps retain their saved state and are not required to be re-entered
- The Review and Submit step must clearly show "Resubmitting with corrections" labeling, not "New request"
- On resubmission, clear the draft key after a successful API response

### 8.4 Draft Preservation Rules

Following G3-T05 contract:

- Draft persists across sessions (browser close, tab close) within the TTL window (72 hours assumed — replace with G3-T05 locked value)
- Draft key: `'setup-wizard-draft'` (provisional — replace with G3-T05 locked key)
- The same draft key is used for new setup and clarification-return re-entry (same request, same draft)
- Draft is cleared after successful first submission and after successful resubmission
- Draft is NOT cleared when the user navigates away mid-flow — they can resume on return

---

## 9. `@hbc/ui-kit` Component Assignments

The following table assigns `@hbc/ui-kit` components to every reusable UI element in the requester surface. Any element not covered here and requiring a reusable presentation primitive must be added to `@hbc/ui-kit` before implementation — not authored as an app-local component.

| Surface Element | Required `@hbc/ui-kit` Component | Notes |
|-----------------|----------------------------------|-------|
| Page shell / layout | `WorkspacePageShell` with `layout="form"` | Existing usage in `NewRequestPage.tsx` |
| Step progress indicator | `HbcStepProgress` (from `@hbc/step-wizard`) | Step progress is owned by step-wizard; `@hbc/ui-kit` not responsible |
| Step sidebar | `HbcStepSidebar` (from `@hbc/step-wizard`) | Same — step-wizard ownership |
| Text input fields | `HbcInput` | For projectName, projectLocation |
| Select / dropdown fields | `@hbc/ui-kit` select control | For projectType, projectStage, department |
| People picker | `HbcPeoplePicker` | For groupMembers, opexManagerUpn |
| Field wrapper (label + error) | `HbcFormField` | All fields must use this wrapper |
| Form container | `HbcForm` | Step content container |
| Status badge | `HbcStatusBadge` | For request.state display |
| BIC ownership display | `HbcBicBadge` (from `@hbc/bic-next-move`) | Current owner / next action |
| Clarification banner | `HbcBanner` variant `warning` | When NeedsClarification |
| Resume / start-new banner | `HbcBanner` variant `info` | On draft-found detection |
| Start-new confirmation | `HbcConfirmDialog` | Before clearing existing draft |
| Auto-save status | `HbcSyncStatusBadge` (from `@hbc/session-state`) | Draft save state |
| Connectivity status | `HbcConnectivityBar` (from `@hbc/session-state`) | On connectivity loss |
| Progress (provisioning) | `ProvisioningChecklist` (existing app component) | Reads from provisioning store |
| Summary review step | `HbcCard` + `HbcTypography` rows | Review step read-only fields |
| Error state (step failure) | `HbcBanner` variant `error` | Step-level validation failure |
| Empty state (no requests) | `HbcEmptyState` | ProjectSetupPage when no requests |

**Primitives not yet confirmed in `@hbc/ui-kit`:** If any of the above components are not present in the current `packages/ui-kit/src/` exports, they must be added to `@hbc/ui-kit` before the G4-T01 implementation uses them. The implementer must not create a local copy of missing primitives. The absence must be reported as a `@hbc/ui-kit` gap to be resolved before proceeding.

### 9.1 SPFx Entry Point

The Estimating SPFx webpart uses full `@hbc/ui-kit` imports (not `/app-shell`) because the webpart hosts a full application, not a shell-only surface. Import paths should use the full entry point: `import { HbcButton, WorkspacePageShell } from '@hbc/ui-kit'`.

---

## 10. What This Surface Assumes from G3 and Backend

T01 depends on the following being locked and stable before implementation:

| Dependency | Source | Used for |
|------------|--------|----------|
| `IStepWizardConfig<IProjectSetupRequest>` | G3-T01 | Step definitions, field assignments, validation functions |
| Clarification re-entry spec | G3-T03 | Flagged-step list source, re-entry mode parameter convention |
| Draft key registry (key + TTL for setup form) | G3-T05 | `useDraft` call arguments |
| Complexity gate spec table | G3-T06 | What fields in `RequestDetailPage` are gated at `standard`/`expert` tier |
| `IBicNextMoveConfig<IProjectSetupRequest>` | G3-T02 | `HbcBicBadge` config |
| `IProjectSetupRequest.department` field | G1-T01 / G2-T02 | `department` form field must exist in the model before the form can submit it |
| Provisioning API `/requests` endpoint | Backend (`backend/functions/`) | Submit, list, and get request calls |
| SignalR negotiate endpoint | Backend | `useProvisioningSignalR()` in `RequestDetailPage` |

The T01 implementation must verify that `IProjectSetupRequest` includes the `department` field before building the form step that collects it. If the field is not yet added to the model (it is not present as of the validation report), the implementation is blocked until G2-T02 (or the Project Setup plan's T02 equivalent) adds it.

---

## 11. What This Surface Must Not Reimplement

The following behaviors and logic are owned by other packages and must not be duplicated in `apps/estimating/`:

- **Lifecycle state machine** — owned by `@hbc/provisioning`'s `STATE_TRANSITIONS`. T01 reads state, it does not transition it.
- **Provisioning visibility resolver** — `getProvisioningVisibility()` in `@hbc/provisioning`. T01 calls it; does not replace it.
- **Notification dispatch** — owned by `@hbc/notification-intelligence` and the backend notification pipeline. T01 does not call email delivery functions or notification APIs directly.
- **Step-progression logic** — owned by `@hbc/step-wizard`. T01 does not maintain step index in component state.
- **Draft IndexedDB operations** — owned by `@hbc/session-state`. T01 calls `useDraft()`, it does not implement raw IndexedDB.
- **Role permission resolution** — owned by `@hbc/auth`. T01 uses `useCurrentSession()` and `@hbc/auth` gates; it does not compute effective permissions.
- **BIC ownership derivation** — owned by `@hbc/bic-next-move` and the BIC config from G3-T02. T01 renders `HbcBicBadge`; it does not derive who owns the request.
- **Complexity tier resolution** — owned by `@hbc/complexity`. T01 wraps detail in `HbcComplexityGate`; it does not compute the user's tier from roles.

---

## 12. Known Risks and Pitfalls

**R1 — `department` field not yet in `IProjectSetupRequest`:**
The validation report confirmed this field is absent. If G2/Project Setup T02 has not added it before G4-T01 implementation begins, the Step 0 (Project Identification) form field cannot submit correctly. The field must exist in the model first. This is a hard dependency — do not implement the `department` field as an app-local addition to the API call payload.

**R2 — G3-T01 config not yet locked:**
If G3-T01's `IStepWizardConfig<IProjectSetupRequest>` is not locked before T01 implementation begins, the step structure used by implementers is a working assumption, not a governed contract. Implementation must be designed to substitute the actual G3-T01 config when it is locked. Do not hardcode step definitions into the page component — externalize the config so it can be replaced with the locked contract.

**R3 — `@hbc/step-wizard` missing clarification-return capabilities:**
The G3-T03 clarification re-entry spec may require `@hbc/step-wizard` to accept a `flaggedSteps` input or a `startAtStep` override. If those capabilities are absent from the current `@hbc/step-wizard` implementation, they must be added via ADR and implemented in the package before G4-T01 can implement the re-entry flow.

**R4 — Competing draft-save mechanisms in existing code:**
The existing `NewRequestPage.tsx` uses local component state (`useState<RequestFormState>`) with no persistence. T01 must replace this with `useDraft<IProjectSetupRequest>` and must not leave the old `useState` pattern in place alongside the new draft hook.

**R5 — SPFx bundle size regression:**
Adding `@hbc/step-wizard`, `@hbc/session-state`, `@hbc/bic-next-move`, and `@hbc/complexity` as new imports in the Estimating SPFx webpart may affect bundle size. The implementer must run `pnpm turbo run build` after each package addition and monitor the Estimating bundle size. If the bundle exceeds the SPFx webpart limit, resolve via tree-shaking or entry-point narrowing before committing.

---

## 13. Acceptance Criteria

T01 is complete when all of the following are true:

- [ ] `NewRequestPage.tsx` uses `useStepWizard(config, item)` with an `IStepWizardConfig<IProjectSetupRequest>` (either the locked G3-T01 output or a tracked placeholder clearly labeled as such)
- [ ] The guided form includes the `department` field (requires G1/G2 model update to be in place)
- [ ] Draft auto-save is integrated via `useDraft<IProjectSetupRequest>` with a documented key and TTL
- [ ] Resume detection at entry shows a resume banner with "Resume" and "Start New" options
- [ ] Clarification-return re-entry opens the wizard at the first flagged step with all previous data restored
- [ ] Post-submit `RequestDetailPage` renders: core summary, state badge, BIC badge, plain-language state context, clarification banner (when applicable), provisioning checklist (when applicable), all using `@hbc/ui-kit` primitives
- [ ] No app-local reusable UI component systems — all shared presentation primitives are from `@hbc/ui-kit`
- [ ] No role-check logic outside `@hbc/auth` primitives
- [ ] No step-progression logic outside `@hbc/step-wizard`
- [ ] No draft storage logic outside `useDraft()` from `@hbc/session-state`
- [ ] Build passes (`pnpm turbo run build` — zero errors in `apps/estimating`)
- [ ] Lint passes (`pnpm turbo run lint` — boundary rules enforced)
- [ ] Type-check passes (`pnpm turbo run check-types` — zero errors)
- [ ] Reference document exists at `docs/reference/spfx-surfaces/estimating-requester-surface.md`

---

## 14. Downstream Consumers

The following tasks depend on T01 being locked before or during their implementation:

- **T02**: Extends `RequestDetailPage` with coordinator-specific detail. T02 assumes the core summary section and provisioning checklist from T01 are in place.
- **T05**: Adds the completion confirmation and Project Hub handoff entry point to `RequestDetailPage`. T05 assumes the `Completed` state slot is reserved in T01's `RequestDetailPage` composition.
- **T06**: Specifies the complexity gate assignments for all fields in both `NewRequestPage` and `RequestDetailPage`. T06 validates the `HbcComplexityGate` usage T01 establishes for the requester post-submit view.
- **T07**: Specifies responsive behavior and failure modes for the wizard surface. T07 depends on knowing T01's composition to enumerate its failure modes.
- **T08**: Writes requester-flow and clarification-return verification tests. T08 depends on T01's acceptance criteria being locked.
- **G5 (PWA equivalent)**: G5 will implement the same setup wizard in a PWA context. G5 reads T01's surface spec as the SPFx reference. The contracts are shared; only the mounting context (SPFx vs. PWA) differs.

---

*End of W0-G4-T01 — Estimating Requester Guided Setup Surface v1.0*
