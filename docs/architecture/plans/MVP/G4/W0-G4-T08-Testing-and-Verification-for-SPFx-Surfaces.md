# W0-G4-T08 — Testing and Verification for SPFx Surfaces

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 08. Defines the rigorous testing and verification strategy for all G4 SPFx surfaces, including requester guided-flow verification, clarification-return verification, coordinator retry boundary verification, controller review surface verification, admin boundary verification, completion handoff verification, role/visibility verification, tablet-safe verification, failure-state verification, and the pilot readiness gate.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — test plan must be written before G4 implementation begins; tests are executed during and after G4 implementation
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3-T08 → G4 master plan → this document
**Depends on:** T01–T07 (all surface and behavior specifications)
**Phase 7 gate:** ADR-0090 must exist on disk before implementation begins

---

## 1. Objective

Define the complete testing governance plan for Group 4 SPFx surfaces. This is not a generic "write tests" note. It specifies:

- What must be tested for each G4 surface and workflow
- How each test category is verified (unit, integration, rendering, boundary, E2E)
- What tools and test utilities apply in the SPFx/Vitest monorepo environment
- What environment-specific expectations apply for dev, test, and pilot
- What must be proven before Group 4 implementation is considered ready for pilot

---

## 2. Testing Framework and Tools

All G4 tests operate within the monorepo's established test framework:

- **Test runner:** Vitest (confirmed as the P1 workspace runner per ADR-0085)
- **Rendering:** React Testing Library (`@testing-library/react`)
- **Mocking:** Vitest's `vi.mock()` and `vi.fn()` utilities
- **SPFx context mocking:** `@hbc/auth`'s SPFx context mock utilities (`createMockSPFxSession()` or equivalent — verify against `packages/auth/src/__mocks__/`)
- **Provisioning store mocking:** `@hbc/provisioning` test utilities — mock `createProvisioningApiClient` responses and `useProvisioningStore` state
- **Complexity context:** `@hbc/complexity`'s `ComplexityProvider` wrapped at the appropriate tier in test renders

Tests for G4 live in:
- `apps/estimating/src/test/` — Estimating surface tests
- `apps/accounting/src/test/` — Accounting surface tests
- `apps/admin/src/test/` — Admin surface tests
- `apps/project-hub/src/test/` — Project Hub surface tests

Each test file must follow the naming pattern `{ComponentOrPage}.test.tsx` within these directories.

---

## 3. Test Inventory and Specifications

### 3.1 T01 — Requester Guided-Flow Verification

**Test file:** `apps/estimating/src/test/NewRequestPage.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T01-001 | Renders blank wizard at initial state (no draft) | Rendering | Step 0 is displayed; all step 0 fields are present; no draft resume banner shown |
| G4-T01-002 | Resume banner shown when draft exists | Rendering | `useDraft` mock returns existing draft; resume and start-new options render |
| G4-T01-003 | "Start New" with confirmation clears draft and resets wizard | Integration | `HbcConfirmDialog` confirmation triggers draft clear; wizard resets to step 0 |
| G4-T01-004 | "Resume" restores all draft fields into wizard state | Integration | All previously saved field values appear in wizard form state after resume |
| G4-T01-005 | Step navigation validation — cannot advance with empty required fields | Unit | Clicking Next on step 0 with empty `projectName` shows inline error; does not advance |
| G4-T01-006 | `department` field renders and accepts valid enum values only | Unit | `commercial` and `luxury-residential` are valid; other values are rejected |
| G4-T01-007 | Auto-save triggers after field change (debounced) | Integration | After 800ms post-change, `useDraft.save()` is called with current form state |
| G4-T01-008 | `HbcSyncStatusBadge` shows "Saving..." during save and "Saved" after | Rendering | Badge transitions correctly during the save lifecycle |
| G4-T01-009 | Successful form submission navigates to `/project-setup/$requestId` | Integration | `createProvisioningApiClient().createRequest()` is called; navigation fires on success |
| G4-T01-010 | Submission failure shows error banner without clearing form | Integration | API mock returns error; `HbcBanner variant="error"` appears; field values unchanged |
| G4-T01-011 | Draft is cleared after successful submission | Integration | After API success, `useDraft.clear()` is called |
| G4-T01-012 | Clarification-return mode: wizard opens at flagged step | Integration | URL contains `?mode=clarification`; wizard opens at step index matching first flagged step |
| G4-T01-013 | Clarification-return mode: all previous data is preserved | Integration | Draft state is restored; all non-flagged steps show previously entered values |
| G4-T01-014 | Flagged steps show warning badge in `HbcStepSidebar` | Rendering | Flagged step indices each display a `HbcStatusBadge variant="warning"` |
| G4-T01-015 | Resubmit in clarification mode calls correct API | Integration | `createProvisioningApiClient().resubmitRequest()` (or equivalent) is called |

### 3.2 T01 — Post-Submit Status Display Verification

**Test file:** `apps/estimating/src/test/RequestDetailPage.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T01-016 | Core summary fields render for all request states | Rendering | Project name, state badge, BIC badge, submitted-by, submitted-at all render |
| G4-T01-017 | State-appropriate plain-language context paragraph renders | Rendering | For each `ProjectSetupRequestState`, the correct human-readable paragraph is shown |
| G4-T01-018 | Clarification banner renders only when state is `NeedsClarification` | Rendering | Banner absent for all other states; present and contains "Action Required" when `NeedsClarification` |
| G4-T01-019 | `ProvisioningChecklist` renders when state is `Provisioning` or `Completed` | Rendering | Checklist present for those states; absent for `Submitted` and `UnderReview` |
| G4-T01-020 | Not-found fallback uses `HbcEmptyState` (not plain text) | Rendering | When `requestId` does not match any request, `HbcEmptyState` renders |

### 3.3 T02 — Coordinator Visibility and Retry Boundary Verification

**Test file:** `apps/estimating/src/test/RequestDetailPage.coordinator.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T02-001 | Standard-tier users see step-level provisioning detail | Rendering | With `ComplexityProvider tier="standard"`, step rows render; with `tier="essential"`, they do not |
| G4-T02-002 | Standard-tier users see failure class and retry count | Rendering | `failureClass` and `retryCount` fields visible at standard tier; absent at essential |
| G4-T02-003 | Retry button renders only when all 5 conditions in §8.3 of T02 are met | Rendering (boundary) | Permutation table test: each condition false one at a time; retry button absent in all fail cases |
| G4-T02-004 | Retry button absent when `failureClass === 'structural'` | Rendering | `failureClass='structural'` → retry button not present |
| G4-T02-005 | Retry button absent when `retryCount >= 3` | Rendering | `retryCount=3` → retry button not present |
| G4-T02-006 | Retry button absent when `escalatedAt` is set | Rendering | `escalatedAt='2026-03-14T10:00:00Z'` → retry button not present |
| G4-T02-007 | Out-of-bounds failure shows `HbcBanner warning` with "Open Admin Recovery" | Rendering | When retry not eligible, warning banner with admin navigation button renders |
| G4-T02-008 | Retry API call fires on button click; button enters loading state | Integration | `retryProvisioning()` mock is called; button shows loading state during call |
| G4-T02-009 | Retry failure shows error banner | Integration | Mock `retryProvisioning()` rejects; `HbcBanner variant="error"` renders |
| G4-T02-010 | `HbcBicDetail` renders at standard tier; `HbcBicBadge` renders at essential tier | Rendering | Complexity tier governs BIC component variant |
| G4-T02-011 | `ProjectSetupPage` renders `HbcDataTable` at standard tier | Rendering | At `tier="standard"`, table with defined columns renders; at `tier="essential"`, simple list renders |

### 3.4 T03 — Controller Queue and Review Surface Verification

**Test files:** `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`, `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T03-001 | Queue renders `HbcDataTable` with defined columns | Rendering | All 7 columns (or subset for current model) render; empty state renders when no requests |
| G4-T03-002 | Default filter shows only `UnderReview` requests | Rendering | Queue loads with `state === 'UnderReview'` filter; other states absent |
| G4-T03-003 | Filter tabs switch queue content | Integration | Selecting "Failed / Needs Routing" tab filters list to `Failed` requests |
| G4-T03-004 | "Open" button navigates to review detail route | Integration | Click fires TanStack Router navigation to `/project-review/$requestId` |
| G4-T03-005 | Review detail page renders all core summary fields | Rendering | Project name, state badge, department, type, stage, submitted-by, `HbcBicDetail` all render |
| G4-T03-006 | Approve button fires `approveRequest` and navigates to queue | Integration | `approveRequest()` mock called after `HbcConfirmDialog` confirmation; navigation fires |
| G4-T03-007 | Approve confirmation dialog appears before API call | Interaction | Clicking "Approve" shows `HbcConfirmDialog`; API not called before confirmation |
| G4-T03-008 | Request Clarification opens modal with text input | Interaction | "Request Clarification" button opens `HbcModal`; `HbcInput` for note is present |
| G4-T03-009 | Clarification submit fires `requestClarification` with note | Integration | `requestClarification(requestId, { note })` mock is called with entered text |
| G4-T03-010 | "Send to Admin" button visible only when state is `Failed` | Rendering | Button absent for non-Failed states; present for `Failed` state |
| G4-T03-011 | History section renders with `HbcAuditTrailPanel` | Rendering | Audit trail renders lifecycle events; collapsed by default; expands on click |
| G4-T03-012 | Standard-tier content is gated at `standard` tier | Rendering | Operational fields absent at `tier="essential"`; present at `tier="standard"` |
| G4-T03-013 | API failure on approve shows error banner | Integration | `approveRequest()` rejects; `HbcBanner variant="error"` renders |
| G4-T03-014 | No retry or recovery actions in review surface | Rendering | No "Retry", "Force Retry", or "Archive" buttons exist anywhere in review pages |

### 3.5 T04 — Admin Boundary and Recovery Verification

**Test file:** `apps/admin/src/test/ProvisioningFailuresPage.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T04-001 | Default filter shows "Active Runs" and "Failures" tabs | Rendering | State filter tabs present; table loads correctly per tab |
| G4-T04-002 | Force-retry button visible for all `Failed` requests | Rendering | "Force Retry" button present for `Failed` state regardless of `failureClass` |
| G4-T04-003 | Force-retry confirmation dialog shows risk warning | Interaction | `HbcConfirmDialog` renders with "structural or permissions failure" warning text |
| G4-T04-004 | Force-retry calls `retryProvisioning()` after confirmation | Integration | API mock called after confirmation; absent before confirmation |
| G4-T04-005 | Archive button and confirmation function correctly | Integration | `archiveFailure()` mock called after confirmation; item removed from visible queue |
| G4-T04-006 | Escalation badge renders for requests with `escalatedAt` set | Rendering | `HbcStatusBadge variant="warning"` appears on escalated rows |
| G4-T04-007 | Expert-tier diagnostic fields hidden at standard tier | Rendering | Raw error card, step context absent at `tier="standard"`; present at `tier="expert"` |
| G4-T04-008 | Manual state override renders at expert tier only | Rendering | Override select absent at `tier="standard"`; present at `tier="expert"` |
| G4-T04-009 | `?projectId=` query param pre-selects correct request | Integration | Navigate to page with `?projectId=abc`; row `abc` is highlighted or detail opens |
| G4-T04-010 | No approval or clarification actions exist in admin surface | Rendering | No "Approve", "Request Clarification", or "Hold" buttons exist anywhere |
| G4-T04-011 | No guided setup wizard in admin surface | Rendering | No `HbcStepWizard` or step-wizard form in any Admin page |

### 3.6 T05 — Completion Confirmation and Handoff Verification

**Test file:** `apps/estimating/src/test/RequestDetailPage.completion.test.tsx`

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T05-001 | Completion card renders when state is `Completed` | Rendering | `HbcCard` with completion content renders; success badge visible |
| G4-T05-002 | Completion card does NOT render for non-Completed states | Rendering | No completion card for `Submitted`, `Provisioning`, `Failed`, etc. |
| G4-T05-003 | "Open Project Hub" button renders when `siteUrl` is valid | Rendering | Button present when `provisioningStatus.siteUrl` is an HTTPS SharePoint URL |
| G4-T05-004 | "Open Project Hub" button absent when `siteUrl` is missing | Rendering | No button; `HbcBanner variant="warning"` shown instead |
| G4-T05-005 | "Open Project Hub" opens new tab, not same-tab navigation | Integration | `window.open` called with `'_blank'`; TanStack Router `navigate` NOT called |
| G4-T05-006 | "Stay in Estimating" hides handoff section, not entire completion card | Interaction | Click on "Stay in Estimating"; handoff section disappears; completion header remains |
| G4-T05-007 | No auto-redirect or countdown timer on completion | Timing | After 10 seconds with `Completed` state, page remains at current URL; no navigation |
| G4-T05-008 | `usePrepareHandoff()` called with correct config when `siteUrl` available | Integration | Handoff hook called; `HbcHandoffStatusBadge` renders handoff status |
| G4-T05-009 | Project Hub welcome card renders when `provisionedAt` is within 7 days | Rendering | In `apps/project-hub`, welcome card present; after 8 days or no date, card absent |
| G4-T05-010 | Project Hub welcome card is dismissable | Interaction | "Dismiss" click hides the card for the current session |

### 3.7 T06 — Role/Visibility and Complexity Verification

**Test files:** Across all four app test directories — `complexity.test.tsx` or as additions to existing test files

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T06-001 | Same state badge variant used for same state across all G4 apps | Cross-surface | `STATE_BADGE_VARIANTS` constant used in Estimating, Accounting, Admin; variants match |
| G4-T06-002 | No `if (role === 'X')` patterns in any G4 component | Static analysis | `grep -r "role ===" apps/estimating apps/accounting apps/admin apps/project-hub` returns 0 results in component code (excluding test files and types) |
| G4-T06-003 | Essential-tier fields never inside a `HbcComplexityGate` | Static / Rendering | For each essential-tier field from the spec table, render at `tier="essential"` confirms visibility |
| G4-T06-004 | Standard-tier fields hidden at essential tier | Rendering | For each standard-tier field, render at `tier="essential"` confirms field absent |
| G4-T06-005 | Expert-tier fields absent in Estimating and Accounting surfaces | Rendering | No expert-tier content (raw errors, step context, state override) in Estimating or Accounting test renders |
| G4-T06-006 | Primary action buttons not inside a `HbcComplexityGate` | Static / Rendering | Approve, Return for Clarification, Retry (when eligible) render at `tier="essential"` |
| G4-T06-007 | `HbcComplexityDial` renders in `RequestDetailPage`, `ProjectReviewDetailPage`, and admin failures page | Rendering | Dial component present in correct three surfaces; absent in wizard and queue list |
| G4-T06-008 | `roleComplexityMap.ts` contains all required G4 role entries | Package test | Existing `@hbc/complexity` tests validate map completeness; G4-T06 adds assertions for any missing entries |

### 3.8 T07 — Responsive and Failure-Mode Verification

**Test files:** Vitest-based rendering tests with viewport mocking; separate E2E tests if available

| Test ID | Description | Type | Pass Criterion |
|---------|-------------|------|---------------|
| G4-T07-001 | Guided setup form renders at 768px without horizontal overflow | Responsive rendering | Render at 768px; no `overflow-x: scroll` on any container |
| G4-T07-002 | Coordinator retry surface renders at 768px with tappable button | Responsive rendering | Retry button (when visible) has min 44px height at 768px |
| G4-T07-003 | Controller queue table reflows or hides columns at 768px | Responsive rendering | At 768px, table fits within 768px width without horizontal scroll |
| G4-T07-004 | Backend unavailable: all G4 list pages show `HbcEmptyState` + Retry | Integration | Mock API to throw; all queue/list pages show `HbcEmptyState` with retry button |
| G4-T07-005 | SignalR unavailable: `RequestDetailPage` falls back to polling | Integration | Mock SignalR to fail; polling interval fires; stale data banner renders |
| G4-T07-006 | Null session: G4 surfaces show loading state, not crash | Rendering | With `useCurrentSession()` mocked to return null, no uncaught errors; loading state shown |
| G4-T07-007 | `RequestDetailPage` with unknown requestId shows `HbcEmptyState` | Rendering | requestId not in store; `HbcEmptyState` renders (not crash, not plain text) |
| G4-T07-008 | Completed state with missing `siteUrl` renders warning banner | Rendering | `provisioningStatus.siteUrl = undefined` + `state = 'Completed'`; warning banner present |
| G4-T07-009 | Cross-app URL missing: admin navigation buttons not rendered | Rendering | `VITE_ADMIN_APP_URL` undefined; "Open Admin Recovery" and "Send to Admin" buttons absent; warning banner present |
| G4-T07-010 | All SPFx webpart roots have `HbcErrorBoundary` | Static | Inspect `EstimatingWebPart.tsx`, `AccountingWebPart.tsx`, `AdminWebPart.tsx` — each renders `HbcErrorBoundary` as root |

---

## 4. Environment-Aware Validation Expectations

### 4.1 Development Environment

In dev (`NODE_ENV === 'development'` or `VITE_ENV === 'dev'`):
- Provisioning API calls use `VITE_FUNCTION_APP_URL` pointed at local Azure Functions emulator or a shared dev backend
- SignalR uses the dev negotiate endpoint
- SPFx webparts load in `gulp serve` mode or in a dev SharePoint tenant
- All G4 tests must pass in dev before any commits proceed

### 4.2 Test/Staging Environment

In test/staging:
- Provisioning API calls hit the staging Azure Function App
- Entra ID group creation and SharePoint site provisioning run against the staging tenant
- All G4 Vitest unit/integration tests must pass
- Manual smoke testing of the guided setup flow, controller review, and admin retry is required before pilot

### 4.3 Pilot Environment

In pilot:
- The pilot gate (§5) must be satisfied before any pilot users are given access to G4 surfaces
- Pilot-specific validation includes: real-user-submitted requests reviewed by real controllers on real Accounting SPFx; real provisioning runs observed from Admin SPFx; real completion navigations to Project Hub

### 4.4 Mocking Policy

G4 unit and integration tests must mock:
- `createProvisioningApiClient` — return controlled `IProjectSetupRequest[]` and `IProvisioningStatus` payloads
- `useProvisioningSignalR` — mock connection lifecycle (connect, disconnect, message event)
- `useCurrentSession` — return controlled session objects with specified `resolvedRoles`
- `useDraft` — return controlled draft state and mock `save()`, `clear()` functions
- `ComplexityProvider` — wrap test renders with explicit `tier="essential"`, `tier="standard"`, or `tier="expert"` to isolate tier-specific rendering

Do not mock `@hbc/ui-kit` components — render the real components. This ensures that `HbcComplexityGate`, `HbcDataTable`, `HbcStatusBadge`, and all other shared primitives are tested in their actual form.

---

## 5. Pilot Readiness Gate

Group 4 implementation is not considered ready for pilot until all of the following conditions are satisfied:

### Gate 1 — All T08 Tests Pass

Every test in the inventory above (G4-T01-001 through G4-T07-010) must pass. Passing means: test runs without failure in `pnpm turbo run test --filter=@hbc/...` (or `pnpm turbo run test` in the affected app's workspace). No skipped or ignored tests in the G4 test inventory.

### Gate 2 — Build, Lint, and Type-Check Clean

`pnpm turbo run build` — zero errors in all four G4 apps
`pnpm turbo run lint` — zero errors including boundary rule violations in all four G4 apps
`pnpm turbo run check-types` — zero TypeScript errors in all four G4 apps

### Gate 3 — No `if (role === 'X')` Role-Branch Logic

`grep -r "role ===" apps/estimating/src apps/accounting/src apps/admin/src apps/project-hub/src` returns zero matches in component files (test files excluded). This confirms that all role-based progressive detail is governed by `@hbc/complexity`.

### Gate 4 — No App-Local Reusable UI Component Systems

`grep -rn "export.*function.*Component\|export.*const.*= styled\|export.*const.*= makeStyles" apps/estimating/src/components apps/accounting/src/components apps/admin/src/components apps/project-hub/src/components` should return only legitimate app-local page-composition components — not reusable UI primitive systems. Any `export`ed component that appears to be a general-purpose reusable UI primitive must be in `@hbc/ui-kit`.

### Gate 5 — All Reference Documents Exist

All seven reference documents specified in the G4 master plan §7 must exist at their specified paths:
- [ ] `docs/reference/spfx-surfaces/estimating-requester-surface.md`
- [ ] `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- [ ] `docs/reference/spfx-surfaces/controller-review-surface.md`
- [ ] `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- [ ] `docs/reference/spfx-surfaces/completion-handoff-spec.md`
- [ ] `docs/reference/spfx-surfaces/complexity-application-map.md`
- [ ] `docs/reference/spfx-surfaces/responsive-failure-catalog.md`

### Gate 6 — Manual Smoke Tests in Staging

The following manual test scenarios must be executed by a human tester (not automated) in the staging environment before pilot:

| Scenario | Steps | Pass Criterion |
|----------|-------|---------------|
| Full requester setup flow | Submit a new project setup request from Estimating using the guided wizard; verify all steps | Request appears in the controller queue in Accounting; requester sees correct status in Estimating |
| Clarification return flow | Controller requests clarification in Accounting; requester returns to guided setup in Estimating with flagged steps | Requester sees flagged steps; resubmits; controller sees resubmission in Accounting queue |
| Coordinator retry (transient failure) | Manually simulate a transient failure on a provisioning step (or use a test trigger); coordinator sees retry button | Retry button visible; retry API called; status updates |
| Out-of-bounds failure routing | Simulate a structural/permissions failure; verify coordinator sees "Open Admin Recovery" | No retry button; admin banner with link to Admin app |
| Admin force-retry | Navigate to Admin app; find failed request; force-retry with confirmation | Confirmation dialog shows risk warning; retry fires; status updates |
| Completion and Project Hub navigation | Complete a real provisioning run in staging; verify completion confirmation in Estimating | Completion card shows; "Open Project Hub" opens project site in new tab; no auto-redirect |
| Tablet layout (controller review) | Open `ProjectReviewDetailPage` on an iPad-class device at 768px | All content readable; approve button tappable; no horizontal overflow |

### Gate 7 — `current-state-map.md §2` Updated

All seven reference documents must be added to `current-state-map.md §2` with document class "Reference." This confirms the documents are classified and traceable.

---

## 6. Known Risks and Testing Pitfalls

**R1 — `@hbc/step-wizard` clarification-return requires package capability:**
If G3-T03's clarification re-entry requires `@hbc/step-wizard` modifications (step-flagging, `startAtStep` override), those must be added and tested in `@hbc/step-wizard`'s own test suite before G4-T08's T01 tests can exercise the full re-entry flow. G4-T08 tests are blocked on the package being complete.

**R2 — SPFx-specific rendering nuances in Vitest:**
Vitest with jsdom does not fully simulate SharePoint's SPFx rendering context. SPFx-specific behaviors (e.g., webpart property pane, SharePoint context injection) cannot be unit tested with Vitest. These must be manually verified in a real SPFx environment during smoke testing.

**R3 — Responsive testing limitations in Vitest/jsdom:**
Viewport-width-dependent CSS layout cannot be fully tested in jsdom. G4-T07-001 through G4-T07-003 must be supplemented with manual testing at 768px in a real browser. The Vitest tests for these scenarios verify component composition (correct components rendered), not pixel-level layout.

**R4 — Cross-app navigation cannot be integration-tested in Vitest:**
Tests G4-T07-009 and the "Open Project Hub" window.open tests verify the correct function is called with the correct URL — they cannot verify that the destination URL loads correctly. That requires manual smoke testing.

---

## 7. Acceptance Criteria

T08 is complete when all of the following are true:

- [ ] All test IDs in §3 (G4-T01-001 through G4-T07-010) are implemented as runnable Vitest tests
- [ ] All tests pass with `pnpm turbo run test` in the affected apps
- [ ] Pilot readiness gate (§5) conditions Gates 1–5 are satisfied (Gates 6–7 require staging access and are satisfied during actual pilot prep)
- [ ] Static analysis checks (no role-branch logic, no app-local reusable UI systems) are defined as CI checks or scripts
- [ ] Test environment requirements are documented in each app's `README.md` or an onboarding doc
- [ ] G3-T08 test plan has been reviewed to confirm G4 tests build correctly on G3 shared-platform wiring tests — no duplicate test coverage, no gaps

---

*End of W0-G4-T08 — Testing and Verification for SPFx Surfaces v1.0*
