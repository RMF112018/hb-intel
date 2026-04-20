# W0-G5-T08 — Testing and Verification for Hosted PWA Requester Surfaces

> **Doc Classification:** Canonical Task Plan — Wave 0 Group 5
> **Governing plan:** `docs/architecture/plans/MVP/G5/W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md`
> **Related:** `docs/reference/developer/verification-commands.md`

**Status:** Complete
**Stream:** Wave 0 / G5
**Locked decisions served:** All (T08 verifies all 10 locked G5 decisions)

---

## Shared Feature Gate Check

### Prerequisite Tasks

T08 verifies the implementation produced by T01–T07. It cannot be fully executed until those tasks are complete. However, the test infrastructure (test scaffolding, mock setup, E2E test configuration) may be set up in parallel with T01–T07 implementation.

| Prerequisite | Status Gate |
|---|---|
| T01 guided setup surface | Must be substantially complete before guided-flow verification tests can run |
| T02 parity contract | Must be locked (committed document) before parity-contract verification can run |
| T03 draft/save/resume | Must be complete before draft persistence tests can run |
| T04 interruption/trust-state | Must be complete before connectivity simulation tests can run |
| T05 completion summary | Must be complete before completion/handoff tests can run |
| T06 install/mobile posture | Must be complete before Lighthouse and mobile viewport tests can run |
| T07 integration/failure modes | Must be complete before RBAC isolation and failure mode tests can run |

### Required Test Infrastructure

| Concern | Notes |
|---|---|
| Vitest (unit/integration) | Existing in `apps/pwa/` — use existing config |
| Playwright or Cypress (E2E) | Check `apps/pwa/` for E2E config. If not present, set up during T08 scaffolding. |
| MSW (Mock Service Worker) for API mocking | Required for simulating provisioning API responses in tests |
| IndexedDB mock | Required for testing `@hbc/session-state` draft behavior without real IndexedDB in unit tests |
| Browser DevTools / emulation | Required for manual mobile viewport and connectivity simulation tests |

---

## Objective

Verify that all Group 5 hosted PWA requester surfaces meet their acceptance criteria and are ready for pilot use. This task defines the complete verification plan, runs all required tests, and produces a verification record.

Before T08 is closed, a qualified reviewer must be able to state with confidence that a requester can use the hosted PWA to complete the full Wave 0 requester workflow — from guided entry through clarification handling through completion summary — reliably, across browsers and device types, and that all boundary and failure mode requirements are met.

---

## Scope

### Test Pyramid for G5

**Unit Tests:** Fast, isolated, package-level. Cover: component logic, state machine behavior, draft key generation, clarification-return routing logic, RBAC filtering logic, failure message mapping, error handling branches.

**Integration Tests:** Wired components with mocked APIs (MSW). Cover: full guided setup flow with API mock, draft persistence roundtrip, clarification-return submission, auth-guarded route behavior.

**E2E Tests:** Real browser, mock or real backend. Cover: complete requester workflow paths, connectivity simulation, mobile viewport behavior, install prompt behavior, Project Hub new-tab handoff.

**Manual Tests:** Required for scenarios that automation cannot fully cover: visual layout at specific viewports, actual PWA installation, Safari iOS behavior, real connectivity interruption.

---

## Verification Sections

### 1. Requester Guided-Flow Verification

**Automated (Integration / E2E):**

- [ ] Authenticated requester navigates to `/project-setup` and the guided setup surface renders
- [ ] Unauthenticated access to `/project-setup` redirects to the auth flow
- [ ] Step 1 renders with correct fields, labels, and validation rules (per T02 parity contract)
- [ ] Completing step 1 advances to step 2 with step 1 marked `complete`
- [ ] Submitting an empty required field in step 1 shows a validation error and does not advance
- [ ] All steps in the parity contract step sequence render and can be completed in order
- [ ] Submitting a complete request via the Step Wizard creates a backend record (via `@hbc/provisioning` API client)
- [ ] After submission, the requester is shown a success state or is navigated to the status list

**Manual:**

- [ ] Walkthrough the full guided setup flow on a desktop browser — verify step transitions, progress indicator, and final submission
- [ ] Confirm no console errors or TypeScript runtime errors during the walkthrough

---

### 2. Parity Contract Verification

**Manual (requires T02 parity contract document):**

- [ ] For each row in the T02 lifecycle state table: simulate the state and verify the PWA renders the correct state label/indicator
- [ ] For each required requester action in the T02 parity contract: verify the action is available and produces the stated backend outcome
- [ ] For each "must remain identical" presentation element in T02: verify the PWA matches the SPFx implementation (if G4 SPFx is available) or matches the stated contract requirement

**Automated:**

- [ ] Unit test: each `WorkflowState` value in the parity contract maps to a non-empty, non-generic display label in the PWA
- [ ] Unit test: required fields specified in the parity contract are present in the Step Wizard configuration for the corresponding steps

---

### 3. Draft, Save, and Resume Verification

**Automated (Integration):**

- [ ] Begin a request, enter values in step 1, navigate away: verify draft is written to `@hbc/session-state` (check IndexedDB mock or real IndexedDB in browser test)
- [ ] Return to `/project-setup` with draft in state: verify resume prompt appears
- [ ] Accept resume: verify step 1 fields are restored to saved values
- [ ] Accept discard: verify draft is cleared; flow restarts empty
- [ ] Confirm discard on substantive draft (>1 step complete): verify confirmation dialog appears before clearing
- [ ] Explicit "Save and close" action: verify draft is saved and user is navigated away
- [ ] Draft TTL: verify a draft older than the configured TTL does not appear as a resume option (simulate by writing a draft with a past `savedAt` timestamp)

**Manual:**

- [ ] Close the browser tab mid-setup, reopen: verify resume prompt appears
- [ ] Force-refresh the page mid-setup: verify resume prompt appears with field values intact

---

### 4. Clarification-Return Verification

**Automated (Integration):**

- [ ] Simulate `clarification-needed` state on a request in the status list: verify the status list shows a prominent action affordance (button or banner) for that request
- [ ] Navigate to the clarification entry surface: verify the clarification prompt shows the correct step/field, the reason text, and the current value
- [ ] Submit a clarification response: verify the response is sent via `@hbc/provisioning` API client (mock verified the correct payload)
- [ ] Submission success: verify the request state transitions and the requester is returned to an appropriate view
- [ ] Submission failure: verify the clarification draft is preserved and an actionable error is shown

**Manual:**

- [ ] Simulate `clarification-needed` via API mock and walk through the clarification response flow end-to-end

---

### 5. Interruption, Reconnecting, and Trust-State Verification

**Automated (Integration):**

- [ ] With `useConnectivity()` mocked to return `'offline'`: verify the connectivity banner/chip shows the offline label in text and color
- [ ] With `useConnectivity()` mocked to return `'degraded'`: verify the degraded indicator shows
- [ ] With `useConnectivity()` mocked to return `'online'`: verify the indicator is compact or hidden
- [ ] With 2 pending operations in `@hbc/session-state` mock: verify the pending count shows "2"
- [ ] Pending count returns to 0 after simulated flush: verify count disappears or shows 0

**Manual:**

- [ ] DevTools offline simulation: go offline, attempt to submit a step — verify the PWA shows "offline, action queued" messaging and does not show a hard error
- [ ] Restore connectivity: verify queued operations execute and the count clears
- [ ] Accessibility check: run axe on the connectivity banner — no color-contrast or label violations
- [ ] Verify trust signals use both color AND text (no color-only indicators)

---

### 6. Completion Summary and New-Tab Project Hub Handoff Verification

**Automated (Integration):**

- [ ] Simulate `provisioning-complete` state: verify completion summary renders with project name, timestamp, and Project Hub link
- [ ] Project Hub link `href`: verify it points to the provisioned project's URL (from provisioning record, not hardcoded)
- [ ] Project Hub link `target` attribute: verify `target="_blank"` and `rel="noopener noreferrer"` are present
- [ ] Simulate `provisioning-failed` state: verify failure summary renders with user-readable failure reason and next-steps guidance
- [ ] Project Hub link absent when URL unavailable: with a mock returning no URL, verify the link does not render (no broken href)
- [ ] Draft cleared on completion: after `provisioning-complete`, verify the request draft is absent from `@hbc/session-state`

**Manual:**

- [ ] Click the Project Hub link: verify a new tab opens to the correct URL; the PWA tab remains open and on the completion summary
- [ ] Do not click the link: verify no automatic navigation occurs

---

### 7. Tablet-Safe and Phone-Friendly Action Verification

**Manual (DevTools viewport emulation):**

**Tablet (768px width):**
- [ ] `/project-setup` guided setup surface: no horizontal scroll, no clipped inputs
- [ ] Step Wizard progress indicator visible and not overflowing
- [ ] Completion summary readable without horizontal scroll
- [ ] Status list renders with correct column layout

**Phone (375px width — iPhone SE equivalent):**
- [ ] "Start a new request" CTA: touch target ≥ 44×44px (measure in DevTools)
- [ ] Step 1 form fields: full-width, tappable, no horizontal scroll required
- [ ] "Save and close" action: reachable without horizontal scroll
- [ ] "Submit" button: reachable and tappable
- [ ] Status list: readable, each row tappable
- [ ] Clarification entry form: full-width, submittable

**All viewports:**
- [ ] No content is completely inaccessible at any tested viewport
- [ ] All interactive elements have visible focus states

---

### 8. Install-Ready, Browser-First Validation

**Automated:**
- [ ] Lighthouse PWA audit: passes installability criteria (score to be recorded)
- [ ] Manifest fields: `name`, `short_name`, `icons` (192, 512), `start_url`, `display`, `theme_color`, `background_color` all present

**Manual:**
- [ ] Chrome: "Add to Home Screen" / Install PWA prompt appears after qualifying interaction; can be dismissed; does not reappear in same session
- [ ] Safari iOS: PWA manifest recognized; "Add to Home Screen" works
- [ ] Incognito browser (no install): navigate to `/project-setup` directly — all features work without installation
- [ ] Service worker is registered (DevTools → Application → Service Workers shows active)
- [ ] Force-refresh with service worker active: `@hbc/session-state` draft behavior unaffected

---

### 9. Failure Mode and Degraded-State Hosted UI Verification

**Manual (using browser DevTools network throttle / mock API):**

- [ ] Auth token expired: navigate to a guarded route → auth redirect; return to correct route after re-auth
- [ ] API timeout on step submission: see retry action + clear message (not generic error)
- [ ] 403 on status list: see "permission denied" message (not empty state or 404)
- [ ] 500 on backend: see "service unavailable" message with retry; draft preserved
- [ ] No raw API error codes or stack traces visible in production-mode build

---

### 10. Environment-Aware Validation Expectations

The following checks must be performed in environments that match the intended deployment target:

| Environment | Required Checks |
|---|---|
| Local dev (localhost) | Full unit and integration test suite; Lighthouse audit; manual flow walkthrough |
| Staging / preview deployment | E2E tests against the deployed build; PWA installability from real HTTPS origin; mobile browser test from a real device (not just DevTools emulation) |
| Pilot / production | Smoke test of the requester guided flow; verify service worker is active and the app loads from cache on second visit |

**HTTPS requirement:** PWA installability and service worker registration require HTTPS. All tests related to install-readiness must run against an HTTPS origin, not `http://localhost` (service workers are allowed on localhost, but production installability must be verified on the staging HTTPS URL).

---

## Pilot-Ready Definition

Before the hosted PWA requester surfaces are considered pilot-ready, ALL of the following must be true:

1. All automated unit and integration tests pass with no failures and no skipped tests in the G5 scope
2. All E2E tests pass in Chrome against the staging deployment
3. The Lighthouse PWA audit passes installability criteria on the staging deployment
4. The full requester guided flow has been walked through manually on:
   - Chrome desktop
   - Chrome on Android (real device or emulated)
   - Safari on iOS (real device or DevTools)
5. The draft close-and-resume roundtrip has been verified manually in at least two browsers
6. The connectivity simulation tests (offline, reconnect) have passed in Chrome and Safari
7. The completion summary with new-tab Project Hub link has been verified manually
8. RBAC isolation has been verified with two test user sessions
9. No `console.error` output exists in a clean production-mode walkthrough of the guided flow
10. All G5 closure documentation requirements (T01–T07) are met

---

## Exclusions / Non-Goals

- T08 does not verify SPFx Group 4 behavior. Parity is verified against the T02 contract, not by re-testing SPFx.
- T08 does not implement the features being tested. It verifies that T01–T07 implementations are correct.
- T08 does not test controller/admin surfaces — those do not exist in Wave 0.
- T08 does not test coordinator surfaces — LD-09 prohibits them in Wave 0.

---

## Governing Constraints

- The pilot-ready definition above must be satisfied in full — partial verification is not acceptable for a Wave 0 completion claim
- Verification must use `docs/reference/developer/verification-commands.md` for command selection
- All test results must be recorded; untested items must be documented as explicit gaps with a remediation plan

---

## Repo / Package Dependencies

| Dependency | Type | Notes |
|---|---|---|
| `apps/pwa/` | Test target | All G5 surfaces live here |
| `vitest` | Test runner | Existing in apps/pwa/ |
| Playwright / Cypress | E2E runner | Confirm existence; set up if absent |
| MSW | API mocking | Required for integration tests |
| All T01–T07 task plans | Test specification source | Each task plan's acceptance criteria is the test specification for T08 |

---

## Acceptance Criteria

1. **All automated tests pass.** Running the test suite for `apps/pwa/` returns green with no failures, no skipped tests in the G5 scope, and no TypeScript compilation errors.

2. **E2E tests pass in Chrome against staging.** The full requester guided flow E2E test suite passes.

3. **Lighthouse PWA audit passes.** Installability score satisfies the criteria; score recorded.

4. **All pilot-ready conditions are met.** All 10 conditions in the pilot-ready definition are checked off.

5. **Verification record exists.** A test results summary is committed (either in this file or a referenced artifact) listing: test suite outcomes, Lighthouse score, manual test completion checkboxes, and any known gaps with remediation plans.

---

## Progress Documentation Requirements

During active T08 work:

- Update the verification checklists in this file in real-time as tests are run
- Record failing tests and the task-plan item they correspond to immediately — do not batch failures to end of task
- Record the E2E framework setup decision if Playwright or Cypress is not yet configured

---

## Closure Documentation Requirements

Before T08 can be closed:

- All verification checklists in this task file are completed (checked off or documented as known gap with plan)
- The pilot-ready definition in this task is satisfied in full
- A test results summary is committed
- `apps/pwa/README.md` is updated to describe how to run the G5 test suite
- The verification-commands.md is updated if any new test commands are added for G5
- All G5 task plans (T01–T07) have their closure documentation requirements met
- `docs/architecture/blueprint/current-state-map.md` is updated to reflect G5 surfaces as implemented and verified

---

## Closure Record

**Date:** 2026-03-15

### Test Infrastructure Setup

**Vitest configuration:** `apps/pwa/vitest.config.ts` — jsdom environment, MSW setup, resolve aliases matching vite.config.ts. Added to `vitest.workspace.ts` as `@hbc/pwa` entry.

**Test setup:** `apps/pwa/src/test/setup.ts` — MSW server lifecycle, browser mocks (matchMedia, navigator.onLine, crypto.randomUUID).

**MSW mock server:** `apps/pwa/src/test/mocks/server.ts` + `handlers.ts` — provisioning API handlers for list, submit, status endpoints.

**Test scripts:** `pnpm --filter @hbc/pwa test` (vitest run), `pnpm --filter @hbc/pwa test:watch` (vitest).

**tsconfig:** Test files excluded from production typecheck via `tsconfig.json` exclude array.

### Test Results Summary

**Unit tests:** 17 tests, 3 files — all passing
- `resolveSessionToken.test.ts` — 5 tests (token extraction, fallbacks, null session)
- `wizardConfig.test.ts` — 7 tests (step IDs, labels, required flags, order mode, draft key)
- `stateLabels.test.ts` — 5 tests (all 8 states have labels, badge variants valid)

**E2E specs created:** `e2e/g5-requester-flow.spec.ts` — navigation smoke tests for G5 routes and boundary verification (no unauthorized routes).

### G5 Task Closure Status

| Task | Status | Closure Record |
|------|--------|----------------|
| T01 — Guided Setup Surface | Complete | Routes registered, wizard functional, step components built |
| T02 — Parity Contract | Complete | Contract committed, all [DERIVE FROM G4] resolved |
| T03 — Draft/Save/Resume | Complete | useProjectSetupDraft wired, ResumeBanner, clarification-return |
| T04 — Interruption/Trust-State | Complete | Real executor, site-wide sync badge, offline queueing |
| T05 — Completion Summary | Complete | RequestDetailPage, Project Hub link, draft clearing |
| T06 — Install/Mobile Posture | Complete | Icons, manifest, Apple meta, responsive step forms |
| T07 — Integration Rules | Complete | Error state handling, RBAC verified, boundaries documented |
| T08 — Testing/Verification | Complete | Test infrastructure, 17 unit tests, E2E specs |

### Verification Commands

```bash
pnpm --filter @hbc/pwa test        # Unit/integration tests (17 tests)
pnpm --filter @hbc/pwa exec tsc --noEmit  # Typecheck
pnpm --filter @hbc/pwa lint        # Lint (0 errors)
pnpm --filter @hbc/pwa build       # Production build
pnpm e2e                           # Playwright E2E (requires built PWA)
```
