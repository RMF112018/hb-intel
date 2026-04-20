# W0-G3-T08 — Testing and Verification for Shared Platform Wiring

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining the complete testing and verification strategy for the shared-platform wiring specified in T01–T07. This is a real testing-governance plan. It defines test categories, stable test IDs, pass criteria, environment requirements, and the pilot readiness gate for G3 implementation.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T01–T07 (all contracts must be stable before test cases can be finalized)
**Unlocks:** G4/G5 pilot readiness gate — G3 tests must pass before the first pilot project goes live
**Repo Paths Governed:** `apps/estimating/`, `apps/accounting/`, `apps/admin/`, `apps/pwa/` — G3 contract tests required across all four apps; exact test directory layout deferred to each app's existing conventions (verify at implementation time)

---

## Objective

T08 translates the contracts from T01–T07 into specific, stable, verifiable test cases. Every test case has a unique ID, a precise description of what it verifies, and a clear pass criterion.

The test plan covers eight categories:
1. Contract tests for next-action / ownership / notification semantics
2. Guided-flow and clarification-loop verification
3. Draft / save / resume verification
4. Summary view and expanded history verification
5. Awareness vs. action-required notification verification
6. Role/context detail verification through `@hbc/complexity`
7. My Work hook/contract verification
8. Failure-mode and degraded-state verification

The final section defines the pilot readiness gate — what must pass before the first pilot project is provisioned through the G3-integrated surfaces.

---

## Test Organization

### Test Ownership Boundaries

G3 tests must be co-located with the code they test and must follow each app and package's **existing test directory conventions** — the exact directory layout is not prescribed here and must be discovered by the implementing agent at execution time (e.g., `__tests__/`, `tests/`, `src/**/*.test.ts`, or other per-app conventions).

The required ownership boundaries are:

**Shared-primitive and contract tests (unit):**
Tests for `PROJECT_SETUP_BIC_CONFIG`, `PROJECT_SETUP_WIZARD_CONFIG`, notification registration tables, draft key constants, and complexity gate spec compliance must live in the package or module that owns those configs — the provisioning package or a G3 init module. These tests are portable: they do not depend on any one app's test harness.

**App surface behavior tests:**
Tests that simulate user interaction — step wizard flow, clarification return, draft save/resume, summary view rendering — must live in the relevant consuming app's test suite. Each of `apps/estimating`, `apps/accounting`, `apps/admin`, and `apps/pwa` is responsible for its own behavior coverage.

**Integration tests:**
Tests that require multiple packages collaborating (notification dispatch with real registry, full summary-view render tree, session-state + wizard round-trip) must be explicitly marked as integration tests and must skip gracefully when `SHAREPOINT_INTEGRATION_TEST_ENABLED` is not set.

**Implementing agent instruction:** Before creating test files, inspect the existing test structure in each app (`ls -la apps/estimating/`, check for `vitest.config.*`, existing `*.test.ts` locations, etc.) and place new files following the established convention. The test IDs below (`TC-*`) are the stable reference — file paths are a local implementation detail.

### Test ID Convention

```
TC-{CATEGORY}-{NUMBER}
```

| Category | Scope |
|----------|-------|
| `OWN` | Ownership, BIC config, and canonical action contract |
| `FLOW` | Guided step-wizard flow behavior |
| `CLAR` | Clarification loop and return-to-flow behavior |
| `NOTIF` | Notification registration, categorization, and dispatch |
| `DRAFT` | Draft keys, auto-save, and resume behavior |
| `SUMM` | Summary view and expandable history |
| `CMPLX` | Complexity gate spec compliance |
| `MYWK` | My Work hook/contract verification |
| `FAIL` | Failure modes and degraded-state behavior |
| `PILOT` | Pilot readiness gate tests |

---

## 1. Ownership and Action Contract Tests

### TC-OWN-01: All lifecycle states have a canonical action string

**What:** For each of the 9 lifecycle states in the state machine, call `PROJECT_SETUP_BIC_CONFIG.resolveExpectedAction()` with a mock request in that state. Verify the return value is a non-empty, non-null string that matches the canonical action string table from T02.

**Pass criterion:** All 9 states return the exact strings specified in T02's canonical action string table. No state returns `undefined` or an empty string.

---

### TC-OWN-02: System-owned states return null owner

**What:** Call `resolveCurrentOwner()` with requests in `ReadyToProvision` and `Provisioning` states.

**Pass criterion:** Both return `null`.

---

### TC-OWN-03: Failed state ownership branches correctly on `retryPolicy.requesterRetryUsed`

**What:** Call `resolveCurrentOwner()` with two mock failed requests: one where `retryPolicy.requesterRetryUsed === false`, one where `retryPolicy.requesterRetryUsed === true`.

**Pass criterion:** First request returns requester as owner. Second returns admin as owner.

---

### TC-OWN-04: BIC config is a single importable object (not surface-specific)

**What:** Verify `PROJECT_SETUP_BIC_CONFIG` is exported from a shared module (provisioning package or G3 config module) and is identical in all three consuming apps (estimating, accounting, admin).

**Pass criterion:** The config object reference is the same across all three app imports (or is structurally identical and imported from the same source path).

---

### TC-OWN-05: `resolveIsBlocked` returns true for AwaitingExternalSetup and escalated Failed

**What:** Call `resolveIsBlocked()` for `AwaitingExternalSetup`, `Failed` with `requesterRetryUsed=true`, `Failed` with `requesterRetryUsed=false`, and `Submitted`.

**Pass criterion:** `AwaitingExternalSetup` → true; `Failed` with retry used → true; `Failed` without retry used → false; `Submitted` → false.

---

### TC-OWN-06: Canonical action string is used verbatim in notification body

**What:** For each action-required event in the notification registration table (T04), verify that the notification body template string is derived from the same canonical action string returned by `resolveExpectedAction()` for the corresponding lifecycle state.

**Pass criterion:** The notification body for each action-required event matches or contains the canonical action string from T02 for the triggering lifecycle state.

---

## 2. Guided Flow Tests

### TC-FLOW-01: Step configuration contains exactly 5 steps in correct order

**What:** Verify `PROJECT_SETUP_WIZARD_CONFIG.steps` has 5 entries with step IDs in order: `project-info`, `department`, `project-team`, `template-addons`, `review-submit`.

**Pass criterion:** 5 steps, correct IDs, correct order.

---

### TC-FLOW-02: Each required step fails validation when required field is empty

**What:** For each of the 4 required steps (all except `template-addons`), call the step's `validate()` function with an empty/partial `IProjectSetupRequest`. Verify it returns a non-null error string.

**Pass criterion:** Steps 1, 2, 3, and 5 each return a specific, non-empty error message when their required fields are absent.

---

### TC-FLOW-03: Step 4 (`template-addons`) validation returns null when no add-ons selected

**What:** Call `validate()` on `template-addons` with an empty `addOns` array.

**Pass criterion:** Returns null (no add-ons is valid).

---

### TC-FLOW-04: Wizard `orderMode` is `sequential`

**What:** Verify `PROJECT_SETUP_WIZARD_CONFIG.orderMode === 'sequential'`.

**Pass criterion:** Pass.

---

### TC-FLOW-05: Department change after step 4 completion triggers step 4 reset

**What (behavior):** Simulate: complete step 2 with `department: 'commercial'`. Complete step 3. Complete step 4 with `addOns: ['safety-pack']`. Return to step 2 and change `department: 'luxury-residential'`. Verify the consuming surface calls `reopenStep('template-addons')`.

**Pass criterion:** `template-addons` step status resets to `in-progress` or `not-started` after department change.

**Note:** This test validates the surface's behavior, not the wizard package itself.

---

### TC-FLOW-06: Project number is NOT present in the setup wizard steps

**What:** Verify no step in `PROJECT_SETUP_WIZARD_CONFIG.steps` contains a `projectNumber` field in its `validate()` function or in its documented field list.

**Pass criterion:** No step references or validates `projectNumber`.

---

## 3. Clarification Loop Tests

### TC-CLAR-01: Field-to-step mapping is complete for all form fields

**What:** For each field in the T03 field-to-step mapping table, verify the mapping exists and maps to a valid stepId in `PROJECT_SETUP_WIZARD_CONFIG.steps`.

**Pass criterion:** All mapped fieldIds resolve to valid stepIds.

---

### TC-CLAR-02: Clarification-return wizard initializes with correct step statuses

**What (behavior):** Given a request with clarifications on `projectName` (step `project-info`) and `projectLeadId` (step `project-team`), simulate clarification-return mode initialization. Verify:
- `project-info` step status = `in-progress`
- `project-team` step status = `in-progress`
- `department` step status = `complete`
- `template-addons` step status = `complete`
- `review-submit` step status = `not-started`
- `activeStepId` = `project-info` (first flagged step in order)

**Pass criterion:** All step statuses match expected values.

---

### TC-CLAR-03: Clarification-return uses distinct draft key

**What:** Verify the clarification-return form uses `'project-setup-clarification-{requestId}'` and does NOT use `'project-setup-form-draft'`.

**Pass criterion:** The two keys are distinct. A clarification-return save does not overwrite the initial submission draft.

---

### TC-CLAR-04: Clarification response draft stores delta, not full request copy

**What:** Verify that `IClarificationDraft.fieldChanges` stores only the fields the user modified, not a full copy of the server record.

**Pass criterion:** `fieldChanges` is a Partial with only changed fields.

---

### TC-CLAR-05: Resubmission transitions request to Submitted state

**What (integration):** Simulate successful clarification resubmission. Verify:
- Request transitions to `Submitted` workflowStage
- All `IRequestClarification` items have `status: 'responded'`
- Clarification draft is cleared

**Pass criterion:** All three conditions satisfied after successful resubmission.

---

### TC-CLAR-06: Clarification-return does NOT offer "Start Fresh"

**What (behavior):** Verify the clarification-return form does not display a "Start Fresh" option or discard button that would clear all responses.

**Pass criterion:** No "Start Fresh" CTA present in clarification-return mode.

---

## 4. Draft, Save, and Resume Tests

### TC-DRAFT-01: All three draft keys are distinct strings

**What:** Verify the three draft key values are distinct:
- `'project-setup-form-draft'`
- `'project-setup-clarification-{requestId}'` (with any requestId)
- `'project-setup-controller-review-{requestId}'` (with any requestId)

**Pass criterion:** No two keys are identical for the same requestId.

---

### TC-DRAFT-02: Auto-save fires with 1.5-second debounce on field change

**What (behavior):** Simulate rapid field changes (5 changes in 2 seconds). Verify `saveDraft` is called at most once within the 1.5-second debounce window.

**Pass criterion:** `saveDraft` called once, not five times.

---

### TC-DRAFT-03: Draft is NOT cleared when API submission fails

**What (behavior):** Simulate wizard completion followed by a failed API submission (500 error). Verify the draft remains in `useDraft` after the failure.

**Pass criterion:** Draft is present after API failure.

---

### TC-DRAFT-04: Draft is cleared after successful API submission

**What (behavior):** Simulate wizard completion followed by a successful API submission. Verify the draft is cleared.

**Pass criterion:** `useDraft` returns null for the new-request draft key after submission.

---

### TC-DRAFT-05: New-request resume offers "Continue or Start Fresh"

**What (behavior):** When a saved draft exists and the user opens the new request form, verify a prompt is displayed offering both options.

**Pass criterion:** Prompt is displayed; both options are actionable.

---

### TC-DRAFT-06: Clarification-return resume does NOT offer "Start Fresh"

**What (behavior):** When a clarification-return draft exists and the user opens the clarification form, verify no "Start Fresh" prompt is displayed.

**Pass criterion:** No prompt for starting fresh.

---

### TC-DRAFT-07: Draft-saved indicator appears after first auto-save

**What (behavior):** After the first auto-save, verify the draft-saved indicator becomes visible without user action.

**Pass criterion:** Indicator visible; shows relative timestamp.

---

### TC-DRAFT-08: Draft-saved indicator shows warning when offline

**What (behavior):** Set `useConnectivity()` to return `'offline'`. Trigger auto-save. Verify the draft-saved indicator changes to the offline-mode message.

**Pass criterion:** Indicator shows offline-mode text.

---

## 5. Notification Tests

### TC-NOTIF-01: All 12 event types are registered

**What:** Call `NotificationRegistry.getAll()` (or equivalent introspection method) after initialization. Verify all 12 event types from the T04 registration table are present.

**Pass criterion:** All 12 event type strings are present in the registry.

---

### TC-NOTIF-02: All action-required events have `tierOverridable: false`

**What:** For each of the 6 action-required events (`provisioning.clarification-requested`, `provisioning.failed`, `provisioning.failed-escalated`, `provisioning.request-submitted`, `provisioning.clarification-responded`, `provisioning.handoff-received`, `provisioning.handoff-rejected`), verify `tierOverridable === false` in their registration.

**Pass criterion:** All 6 are `tierOverridable: false`.

---

### TC-NOTIF-03: All awareness events have `tierOverridable: true`

**What:** For each of the 5 awareness events (`provisioning.completed`, `provisioning.step-completed`, `provisioning.request-approved`, `provisioning.handoff-acknowledged`, `provisioning.site-access-ready`), verify `tierOverridable === true`.

**Pass criterion:** All 5 are `tierOverridable: true`.

---

### TC-NOTIF-04: `provisioning.clarification-requested` uses `immediate` tier

**What:** Verify `defaultTier === 'immediate'` for this event.

**Pass criterion:** `'immediate'`.

---

### TC-NOTIF-05: `provisioning.completed` uses `watch` tier

**What:** Verify `defaultTier === 'watch'` for this event.

**Pass criterion:** `'watch'`.

---

### TC-NOTIF-06: No frontend surface calls `NotificationApi.send()` for lifecycle events

**What (code review / unit):** Scan the G4/G5 app surface code for calls to `NotificationApi.send()` in state transition handlers, form submission handlers, or BIC transfer handlers. Verify no such calls exist.

**Pass criterion:** Zero calls to `NotificationApi.send()` in frontend lifecycle event handlers.

---

### TC-NOTIF-07: Notification body for clarification event contains canonical action string

**What:** Verify the notification payload template for `provisioning.clarification-requested` includes the text from `resolveExpectedAction()` for the `NeedsClarification` state (`"Respond to clarification requests to continue setup"`).

**Pass criterion:** Body contains canonical action string.

---

## 6. Complexity Gate Tests

### TC-CMPLX-01: Core summary fields are visible at Essential tier

**What:** Render the request summary view with `ComplexityProvider` set to `'essential'`. Verify all 7 core summary fields (project name, department, status, owner, expected action, submitted at, urgency indicator) are visible.

**Pass criterion:** All 7 fields render at Essential tier.

---

### TC-CMPLX-02: Project number is hidden at Essential tier

**What:** Render the summary with `'essential'` tier. Verify project number is not visible.

**Pass criterion:** Project number absent at Essential.

---

### TC-CMPLX-03: Project number is visible at Standard tier

**What:** Render with `'standard'` tier. Verify project number is visible.

**Pass criterion:** Project number present at Standard.

---

### TC-CMPLX-04: Error details are hidden at Standard tier

**What:** Render the summary for a failed request with `'standard'` tier. Verify raw error details, correlation IDs, and `statusResourceVersion` are not visible.

**Pass criterion:** Expert-only fields absent at Standard.

---

### TC-CMPLX-05: Error details are visible at Expert tier

**What:** Render the summary for a failed request with `'expert'` tier. Verify raw error details are visible.

**Pass criterion:** Expert-only fields present at Expert.

---

### TC-CMPLX-06: No `if (role === ...)` patterns exist in summary render code

**What (code review):** Scan G4/G5 summary component code for hardcoded role-check patterns (`if (role === 'admin')`, `if (userRole === 'controller')`, etc.) used for detail gating.

**Pass criterion:** Zero hardcoded role-check patterns for progressive detail gating. Only `HbcComplexityGate` is used.

---

### TC-CMPLX-07: Coaching prompts visible at Essential, hidden at Standard

**What:** Render the Step 2 form at `'essential'` tier — verify coaching prompt is visible. Render at `'standard'` tier — verify coaching prompt is hidden.

**Pass criterion:** Essential shows coaching; Standard does not.

---

## 7. My Work Hook Tests

### TC-MYWK-01: `registerBicModule('provisioning', ...)` is called at app initialization

**What:** Verify the BIC module registration is called during app initialization (before the first render) in all three consuming apps and PWA.

**Pass criterion:** `registerBicModule` is called once per app initialization with key `'provisioning'`.

---

### TC-MYWK-02: `queryFn` returns valid BIC items for user who owns requests

**What:** Call the provisioning module's `queryFn` with a userId that owns at least one request in `NeedsClarification` state (mock API). Verify the returned items have valid `itemKey`, `href`, `title`, and `state` fields.

**Pass criterion:** Items returned with correct shape and non-null state.

---

### TC-MYWK-03: `queryFn` handles API error gracefully

**What:** Mock `ProjectSetupApi.getItemsWhereOwner()` to throw a 500 error. Call `queryFn`. Verify it returns an empty array (not throws).

**Pass criterion:** Returns `[]`; does not throw.

---

### TC-MYWK-04: No custom "My Items" or "My Requests" surface exists in G4/G5 apps

**What (code review):** Scan G4/G5 app code for any component, page, route, or panel that implements a custom personal work queue, "my requests" list, or "my active items" aggregation.

**Pass criterion:** No such component exists. Only BIC badges, BIC detail views, and the notification center are used as interim personal-work surfaces.

---

## 8. Failure Mode and Degraded-State Tests

### TC-FAIL-01: Null `useDraft` does not crash the form

**What:** Mock `useDraft` to return `{ value: null, save: () => {}, clear: () => {} }`. Mount the setup form. Verify it renders without errors and initializes as an empty form.

**Pass criterion:** No runtime errors; form renders with empty fields.

---

### TC-FAIL-02: Null BIC owner does not crash the BIC badge

**What:** Render `HbcBicBadge` with a request in `Provisioning` state (where `resolveCurrentOwner()` returns null). Verify the badge renders a system indicator without crashing.

**Pass criterion:** Badge renders; no runtime error; no "unassigned" warning badge (this is expected null, not an accountability gap).

---

### TC-FAIL-03: Handoff pre-flight failure displays blocking reason

**What:** Mock `validateReadiness()` to return `'Project lead is not assigned...'`. Render `HbcHandoffComposer`. Verify the blocking reason text is visible and the send CTA is disabled.

**Pass criterion:** Blocking reason visible; CTA disabled.

---

### TC-FAIL-04: API submission failure retains draft and shows error

**What:** Mock `ProjectSetupApi.submit()` to reject with a 500. Complete the wizard. Verify: draft is NOT cleared; error message is displayed; user can retry.

**Pass criterion:** Draft retained; error shown; no navigation away.

---

### TC-FAIL-05: Expired clarification draft shows recovery message

**What:** Mock `useDraft` to return null for the clarification-return draft key. Render the clarification-return form for a request in `NeedsClarification`. Verify an appropriate message is displayed explaining that the previous responses expired.

**Pass criterion:** Recovery message visible; form initializes from server values.

---

### TC-FAIL-06: Complexity fallback tier is Essential when no AD group matches

**What:** Configure `ComplexityProvider` with `fallbackTier='essential'` and an empty role map. Mount the provider. Verify `useComplexity().tier === 'essential'`.

**Pass criterion:** Tier is `'essential'`.

---

## 9. Environment-Aware Test Execution

| Test Category | Dev (local mocks) | Staging (real integration) | Pilot (spot-check) |
|---------------|-------------------|---------------------------|-------------------|
| Unit (OWN, FLOW basic, NOTIF, DRAFT, CMPLX, MYWK) | Run | Run | N/A |
| Behavior (FLOW, CLAR, DRAFT, FAIL) | Run with mocked API | Run with staging API | Spot-check manually |
| Integration (NOTIF-INT, SUMM) | Skip | Run | Spot-check manually |
| Pilot readiness (PILOT) | N/A | Must all pass | Must pass |

Integration tests that require a real SharePoint site or real Entra ID must check for `SHAREPOINT_INTEGRATION_TEST_ENABLED=true` and skip gracefully when not set.

---

## 10. Pilot Readiness Gate

The following tests must pass before G3-integrated surfaces are deployed to the first pilot project:

### Mandatory Passing Tests

| Test IDs | Category | Notes |
|----------|----------|-------|
| TC-OWN-01 through TC-OWN-06 | Ownership and action contract | All 6 |
| TC-FLOW-01 through TC-FLOW-06 | Guided flow | All 6 |
| TC-CLAR-01 through TC-CLAR-06 | Clarification loop | All 6 |
| TC-NOTIF-01 through TC-NOTIF-07 | Notification registration | All 7 |
| TC-DRAFT-01 through TC-DRAFT-08 | Draft and resume | All 8 |
| TC-CMPLX-01 through TC-CMPLX-07 | Complexity gates | All 7 |
| TC-MYWK-01 through TC-MYWK-04 | My Work hooks | All 4 |
| TC-FAIL-01 through TC-FAIL-06 | Failure modes | All 6 |

### Mandatory Documentation Checks

- [ ] All 9 G3 reference documents exist at `docs/reference/workflow-experience/`
- [ ] All 9 are added to `current-state-map.md §2`
- [ ] T07 integration validation checklist has been executed and all items checked
- [ ] ADR-0091 (Phase 7 sign-off) exists on disk

### Mechanical Gate

All four mechanical gates from CLAUDE.md §6.3.3 must pass:

```bash
pnpm turbo run build        # Zero errors
pnpm turbo run lint         # Zero errors (boundary rules active)
pnpm turbo run check-types  # Zero TypeScript errors
pnpm turbo run test --filter=@hbc/auth-core --filter=@hbc/shell --filter=@hbc/ui-kit \
  --filter=@hbc/shared-kernel --filter=@hbc/app-types
```

G3 shared primitive tests must also pass:

```bash
pnpm turbo run test --filter=@hbc/step-wizard --filter=@hbc/bic-next-move \
  --filter=@hbc/notification-intelligence --filter=@hbc/session-state \
  --filter=@hbc/workflow-handoff --filter=@hbc/complexity
```

---

## What T08 Tests Prove

When all tests in this plan pass, the following statements are proven:

1. **The ownership and action contract is correct.** Every lifecycle state has a canonical action string; system states return null owners; the BIC config is imported from a single source.

2. **The guided flow is correctly configured.** Five steps in sequential order; required steps have validation; department-change invalidates step 4; no project number in requester intake.

3. **The clarification loop is correctly implemented.** Field-to-step mapping is complete; wizard re-initializes correctly for clarification return; distinct draft key prevents collisions; resubmission transitions state correctly.

4. **Notifications are correctly categorized.** All 12 event types are registered; action-required events are non-downgradable; awareness events are user-overridable; no lifecycle notifications are dispatched from the frontend.

5. **Draft and resume behavior is correct.** Auto-save fires on change with debounce; draft is not cleared on API failure; resume offers choice for new requests; clarification return always resumes from server + delta.

6. **Complexity gates are correctly applied.** Core summary is visible at all tiers; progressive detail is gated with `HbcComplexityGate`; no hardcoded role checks for detail gating.

7. **My Work hook points are wired.** BIC module registration is called; `queryFn` handles errors gracefully; no bespoke My Work stopgap surfaces exist.

8. **Failure modes degrade gracefully.** Null draft, null owner, failed API submission, expired clarification draft, and missing AD group match all produce defined degraded behavior without crashing.

---

*End of W0-G3-T08 — Testing and Verification for Shared Platform Wiring v1.0*
