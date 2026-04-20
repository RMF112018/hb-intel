# PH7-BD-9 — Business Development: Testing, CI/CD & Documentation

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Prerequisite:** PH7-BD-8 (Backend API) complete and passing build. All BD feature modules (PH7-BD-1 through PH7-BD-8) complete.
**Purpose:** Define and implement all Vitest unit tests, Playwright E2E tests, GitHub Actions CI workflow extensions for the BD module, required ADRs, and full Diátaxis documentation set.

---

## Prerequisite Checks

Before starting this task:

- [ ] All PH7-BD-1 through PH7-BD-8 tasks are complete with passing builds.
- [ ] `pnpm turbo run build` passes from repo root.
- [ ] Vitest is configured in `packages/models/` and `apps/pwa/`.
- [ ] Playwright is configured in the repo with an existing test directory.
- [ ] GitHub Actions workflow file exists at `.github/workflows/ci.yml`.

---

## Task 1 — Vitest Unit Tests: Data Transformation & State Logic

Target: **≥95% coverage** on all data transformation functions and state logic in the BD module.

### 1.1 Scoring Utility Tests

**File:** `packages/models/src/bd/__tests__/IGoNoGoScoring.test.ts`

```typescript
describe('getCriterionValue', () => {
  it('returns highValue for ScoringTier.High', ...)
  it('returns averageValue for ScoringTier.Average', ...)
  it('returns lowValue for ScoringTier.Low', ...)
  it('returns correct value for all 20 criteria', ...)
  // Test all 20 criteria × 3 tiers = 60 assertions
})

describe('getScoreGuideCategory', () => {
  it('returns Focus for scores > 80', ...)
  it('returns Pursue for scores 75–80', ...)
  it('returns Drop for scores < 75', ...)
  it('handles boundary values: 75 = Pursue, 80 = Pursue, 81 = Focus', ...)
})

describe('CRITERION_DEFINITIONS completeness', () => {
  it('has exactly 20 criteria', ...)
  it('all criteria have highValue > averageValue > lowValue', ...)
  it('sum of all highValues equals MAX_POSSIBLE_SCORE (106)', ...)
})
```

### 1.2 Versioning Utility Tests

**File:** `apps/pwa/src/utils/bd/__tests__/scorecardVersioning.test.ts`

```typescript
describe('buildVersionSnapshot', () => {
  it('creates snapshot with incremented version number', ...)
  it('detects originator score changes', ...)
  it('detects committee score changes', ...)
  it('does not create criterion change for unchanged scores', ...)
  it('records previous and new values correctly', ...)
  it('sets correct triggerAction', ...)
  it('sets correct createdByUserId and createdByDisplayName', ...)
})
```

### 1.3 Handoff Package Builder Tests

**File:** `apps/pwa/src/utils/bd/__tests__/handoffPackageBuilder.test.ts`

```typescript
describe('assembleHandoffPackage', () => {
  it('includes all required fields in handoff package', ...)
  it('computes averageTotal correctly from originator + committee totals', ...)
  it('calls getScoreGuideCategory for correct category', ...)
  it('computes per-criterion delta (|originator - committee|) correctly', ...)
  it('includes all attached documents', ...)
  it('includes full version history', ...)
})
```

### 1.4 Stage Guard Tests

**File:** `apps/pwa/src/utils/bd/__tests__/scorecardStageGuards.test.ts`

```typescript
describe('canTransition', () => {
  it('returns true for all valid transitions', ...)
  it('returns false for invalid transitions', ...)
  it('Draft → Submitted is valid', ...)
  it('HandedOff → Draft is invalid', ...)
  it('Closed → Draft is valid (reopen)', ...)
})

describe('assertTransition', () => {
  it('throws for invalid transition', ...)
  it('does not throw for valid transition', ...)
})
```

### 1.5 Committee Scoring Validation Tests

**File:** `apps/pwa/src/hooks/__tests__/useCommitteeScoringValidation.test.ts`

```typescript
describe('validateCommitteeScoring', () => {
  it('returns isValid=true when all changed criteria have comments', ...)
  it('returns isValid=false when a changed criterion has no comment', ...)
  it('returns isValid=true when no criteria changed (committee = originator)', ...)
  it('lists all missing-comment criteria in missingComments', ...)
})
```

### 1.6 Analytics Aggregation Tests

**File:** `apps/api/src/functions/bd/__tests__/getAnalytics.test.ts`

```typescript
describe('analytics aggregation', () => {
  it('computes goRate correctly from totalGo and totalLeads', ...)
  it('computes avgOriginatorTotal from criteria JSON', ...)
  it('computes avgBidToDecisionDays correctly', ...)
  it('groups scores into correct distribution buckets', ...)
  it('groups scorecards into correct quarterly period buckets', ...)
  it('computes criterion divergence as avg |orig - comm|', ...)
  it('enforces bdManagerId scoping', ...)
})
```

### 1.7 useBdRole Hook Tests

**File:** `apps/pwa/src/hooks/__tests__/useBdRole.test.ts`

```typescript
describe('useBdRole', () => {
  it('returns isBdManager=true for BdManager role', ...)
  it('returns canEditCommitteeFields=true only for EstimatingCoordinator', ...)
  it('returns canViewAnalytics=true only for BdManager', ...)
  it('returns canViewScorecardContent=false for Admin', ...)
  it('returns all false for null role', ...)
})
```

---

## Task 2 — Playwright E2E Tests: Primary User Flows

**File directory:** `apps/pwa/e2e/bd/`

### Flow 1 — BD Manager: Full Scorecard Lifecycle (Happy Path)

**File:** `apps/pwa/e2e/bd/scorecardLifecycle.spec.ts`

```
1. BD Manager logs in → navigates to /bd
2. Clicks "New Scorecard"
3. Completes Step 1 (project info)
4. Completes Steps 2 & 3 (scores all 20 criteria)
5. Completes Step 4 (all 5 departmental sections)
6. Completes Step 5 (strategic question + submit)
7. Verifies stage = 'Submitted' on list view
8. Director logs in → opens review panel
9. Director accepts with deadline
10. Verifies stage = 'Accepted' on BD home list
11. Estimating Coordinator logs in → schedules meeting
12. Opens scoring session
13. Enters committee scores with required comments
14. Closes session → stage = 'DecisionReached'
15. Director records GO decision
16. Verifies stage = 'HandedOff', scorecard is read-only
```

### Flow 2 — Clarification Request Loop

**File:** `apps/pwa/e2e/bd/clarificationFlow.spec.ts`

```
1. Scorecard in 'Submitted' stage
2. Director requests clarification
3. Verifies stage = 'NeedsClarification'
4. BD Manager logs in → sees clarification banner
5. BD Manager edits and resubmits with version comment
6. Verifies stage = 'Submitted', version = 2
```

### Flow 3 — WAIT State & Reopen

**File:** `apps/pwa/e2e/bd/waitAndReopen.spec.ts`

```
1. BD Manager places scorecard on wait with follow-up date
2. Verifies stage = 'Waiting' with follow-up date on list
3. BD Manager reopens → verifies stage = 'Draft', version incremented
```

### Flow 4 — NO-GO & Analytics

**File:** `apps/pwa/e2e/bd/noGoAndAnalytics.spec.ts`

```
1. Committee scores recorded → DecisionReached
2. Director records NO-GO → stage = 'Closed'
3. BD Manager navigates to /bd/analytics
4. Verifies KPI cards show correct counts
5. Verifies GO rate reflects new NO-GO
6. Non-BD-Manager navigates to /bd/analytics → redirected
```

### Flow 5 — Access Control Verification

**File:** `apps/pwa/e2e/bd/accessControl.spec.ts`

```
1. Unauthenticated user navigates to /bd → redirected to login
2. Admin user navigates to /bd → no scorecard content visible
3. Non-BD role navigates to /bd → redirected to /unauthorized
4. BD Manager navigates to /bd → sees only own scorecards
5. Estimating Coordinator navigates to /bd → sees only accepted+ scorecards
```

---

## Task 3 — Architecture Decision Records (ADRs)

Create the following ADRs in `docs/architecture/adr/`:

### ADR-BD-001: Go/No-Go Scorecard Versioning Strategy

**File:** `docs/architecture/adr/ADR-BD-001-scorecard-versioning.md`

**Decision:** Every update to a Go/No-Go Scorecard creates an immutable version snapshot persisted to the `GoNoGoVersionSnapshots` SharePoint list. The live scorecard's `currentVersion` integer is incremented. Version snapshots are never deleted.

**Rationale:** Audit trail requirement for a compliance-relevant business decision. BD Managers and committees must be able to review the full history of score changes and reasons.

**Consequences:** Storage grows with each edit. Query for current scorecard always uses latest version. Historical views query `GoNoGoVersionSnapshots` by `ScorecardId + VersionNumber`.

### ADR-BD-002: BD Analytics Scope Restriction

**File:** `docs/architecture/adr/ADR-BD-002-analytics-scope.md`

**Decision:** BD Analytics are scoped exclusively to the requesting BD Manager's own scorecard data. No cross-BD-manager aggregate analytics are exposed in Phase 1.

**Rationale:** Product owner decision (Q64 = Option C). Prevents BD Managers from comparing performance against peers without explicit management reporting features.

**Consequences:** Future cross-BD analytics (for Directors/VPs) require a separate analytics endpoint with elevated access control. Document as Phase 2 scope.

### ADR-BD-003: Committee Scoring as Facilitator-Led Single Entry

**File:** `docs/architecture/adr/ADR-BD-003-committee-scoring-model.md`

**Decision:** Committee scoring is entered by a single facilitator (Estimating Coordinator) during a live meeting. There is no distributed/async scoring model where each committee member enters their own scores independently.

**Rationale:** Product owner decision (Q54 = Option C). Simpler data model, avoids partial scoring states, and matches the existing meeting-based workflow.

**Consequences:** Facilitator must be present with access during the meeting. A future Phase 2 distributed scoring enhancement would require new UI and data model changes. Document as Phase 2 scope.

### ADR-BD-004: Cross-Module Scorecard Read-Only Contract

**File:** `docs/architecture/adr/ADR-BD-004-cross-module-scorecard-readonly.md`

**Decision:** After a GO decision is recorded in the BD module, the scorecard is surfaced read-only in the Project Hub Preconstruction section for the full project lifecycle. The BD module remains the source of truth. Project Hub consumes the scorecard via `GET /api/bd/scorecards/by-project/{projectId}`.

**Rationale:** Preserves single source of truth in BD module. Project Hub is a consumer, not an owner, of BD data.

**Consequences:** Project Hub cannot modify scorecard data. If BD module is unavailable, Project Hub Preconstruction will show a loading error for the scorecard panel. Handled with graceful error state in PH7-ProjectHub-4.

---

## Task 4 — Diátaxis Documentation

### 4.1 Developer How-To Guide

**File:** `docs/how-to/developer/bd-module-guide.md`

Sections:
- How to add a new scorecard criterion (update `CRITERION_DEFINITIONS` + `GoNoGoCriterion` enum + all downstream references)
- How to add a new stage to `ScorecardStage` (update enum + `SCORECARD_STAGE_TRANSITIONS` + stage badge color map + all guards)
- How to extend the versioning system with a new `VersionTriggerAction`
- How to run BD module unit tests and E2E tests locally
- How to set up the BD SharePoint lists in a new environment (run `bd-sharepoint-setup.ts`)
- How to configure the notification channel (`NOTIFICATION_CHANNEL` env var)
- How to configure the Executive Override role (`executiveOverrideRoleId` in admin config)

### 4.2 User Guide

**File:** `docs/user-guide/bd-scorecard-guide.md`

Sections:
- Overview: What is the Go/No-Go Scorecard?
- For BD Managers: Creating and submitting a scorecard (step-by-step, with screenshots)
- For BD Managers: Responding to clarification requests
- For BD Managers: Placing a scorecard on wait and reopening after No-Go
- For Directors: Reviewing, requesting clarification, accepting, and rejecting scorecards
- For Estimating Coordinators: Scheduling meetings and facilitating committee scoring
- For all roles: Reading the version history and understanding score changes
- Score Guide reference: Focus / Pursue / Drop thresholds
- For BD Managers: Using the Analytics page

### 4.3 Reference Documentation

**File:** `docs/reference/bd/scorecard-fields.md`

Complete field reference table for the Go/No-Go Scorecard:
- All header fields with data types, valid values, and required/optional status
- All 20 scoring criteria with High/Average/Low point values
- All stage values with descriptions and valid transitions
- All notification types with recipients and trigger conditions
- All version trigger actions with descriptions

**File:** `docs/reference/bd/api-endpoints.md`

Complete API endpoint reference:
- All 14 endpoints with method, path, query params, request body, response shape, and required roles
- Error codes and HTTP status conventions

### 4.4 Explanation (Conceptual)

**File:** `docs/explanation/bd-scorecard-workflow.md`

Explains the Go/No-Go Scorecard workflow conceptually:
- Why versioning is used instead of in-place edits
- How the dual-score system (Originator vs Committee) works and why divergence matters
- The rationale for departmental sections before submission (not after)
- How the BD module connects to the Project Hub after a GO decision
- The distinction between Strategic Pursuit answer and Go/No-Go decision

---

## Task 5 — GitHub Actions CI Extension

Extend `.github/workflows/ci.yml` to include BD module tests:

```yaml
bd-unit-tests:
  name: BD Module Unit Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm turbo run test --filter=@hbc/models
    - run: pnpm turbo run test --filter=@hbc/pwa
      env:
        VITEST_INCLUDE: 'src/**/__tests__/bd*.test.ts'
    - name: Check coverage threshold
      run: pnpm vitest run --coverage --reporter=verbose
      # Fails if coverage < 95%

bd-e2e-tests:
  name: BD E2E Tests
  runs-on: ubuntu-latest
  needs: [bd-unit-tests]
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm playwright install --with-deps chromium
    - run: pnpm playwright test apps/pwa/e2e/bd/
```

---

## Task 6 — Verification

```bash
# Full build
pnpm turbo run build

# Unit tests with coverage
pnpm vitest run --coverage

# Verify coverage ≥ 95% for BD module files

# E2E tests (requires dev server running)
pnpm playwright test apps/pwa/e2e/bd/

# Documentation validation
ls docs/architecture/adr/ADR-BD-001-scorecard-versioning.md
ls docs/architecture/adr/ADR-BD-002-analytics-scope.md
ls docs/architecture/adr/ADR-BD-003-committee-scoring-model.md
ls docs/architecture/adr/ADR-BD-004-cross-module-scorecard-readonly.md
ls docs/how-to/developer/bd-module-guide.md
ls docs/user-guide/bd-scorecard-guide.md
ls docs/reference/bd/scorecard-fields.md
ls docs/reference/bd/api-endpoints.md
ls docs/explanation/bd-scorecard-workflow.md
```

---

## Success Criteria

- [ ] BD-9.1 Vitest unit test coverage ≥ 95% for all BD data transformation and state logic.
- [ ] BD-9.2 `getCriterionValue()` tested for all 20 criteria × 3 tiers.
- [ ] BD-9.3 `getScoreGuideCategory()` tested including boundary values.
- [ ] BD-9.4 `buildVersionSnapshot()` tested for all change detection cases.
- [ ] BD-9.5 `assembleHandoffPackage()` tested for completeness and correctness.
- [ ] BD-9.6 `canTransition()` tested for all valid and invalid stage transitions.
- [ ] BD-9.7 `validateCommitteeScoring()` tested for all comment-requirement cases.
- [ ] BD-9.8 Analytics aggregation logic tested for all computed metrics.
- [ ] BD-9.9 `useBdRole()` hook tested for all 5 roles.
- [ ] BD-9.10 Playwright E2E: Full scorecard lifecycle (happy path) passes.
- [ ] BD-9.11 Playwright E2E: Clarification request loop passes.
- [ ] BD-9.12 Playwright E2E: WAIT state and reopen flow passes.
- [ ] BD-9.13 Playwright E2E: NO-GO and analytics flow passes.
- [ ] BD-9.14 Playwright E2E: Access control verification passes.
- [ ] BD-9.15 All 4 ADRs created in `docs/architecture/adr/`.
- [ ] BD-9.16 Developer how-to guide created at `docs/how-to/developer/bd-module-guide.md`.
- [ ] BD-9.17 User guide created at `docs/user-guide/bd-scorecard-guide.md`.
- [ ] BD-9.18 Reference docs created in `docs/reference/bd/`.
- [ ] BD-9.19 Explanation doc created at `docs/explanation/bd-scorecard-workflow.md`.
- [ ] BD-9.20 GitHub Actions CI extended with BD unit + E2E test jobs.
- [ ] BD-9.21 Build passes with zero TypeScript errors.

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Prerequisite: PH7-BD-1 through PH7-BD-8 complete
This file completes the BD module plan set.
-->
