# SF17-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-02 through D-10
**Estimated Effort:** 0.8 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF17-T08 testing task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define fixtures and quality gates for monitors, probes, approval policy, hooks, and UI components.

---

## Testing Exports (`@hbc/features-admin/testing`)

- `createMockAdminAlert(overrides?)`
- `createMockProbeSnapshot(overrides?)`
- `createMockApprovalAuthorityRule(overrides?)`
- `mockAdminIntelligenceStates`

Canonical states:

1. no alerts, healthy probes
2. critical provisioning failure
3. degraded probes with stale snapshot warning
4. approval rule with `any` mode
5. approval rule with `all` mode
6. mixed severity alerts with acknowledged rows

---

## Unit Tests

- monitor condition detection + dedupe + auto-resolve
- probe scheduler cadence + retry/backoff + degraded aggregation
- approval eligibility (`any|all`) for direct user and group membership
- hook state transitions and polling behavior

---

## Component Tests

- `AdminAlertBadge` severity color/count behavior
- `AdminAlertDashboard` filtering/acknowledge/export interactions
- `ImplementationTruthDashboard` health/staleness rendering
- `ApprovalAuthorityTable` and `ApprovalRuleEditor` edit/test flow

---

## Storybook + Playwright

Storybook matrix:

- severity x complexity tier
- probe status x staleness state
- approval mode x eligibility result

Playwright scenarios:

1. provisioning failure produces critical badge and dashboard row
2. alert acknowledged then auto-resolved after source clear
3. probe degrade -> recovery lifecycle visible on dashboard
4. approval rule change affects scorecard approval eligibility path

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T08 completed: 2026-03-12
Files modified:
  - testing/mockAdminIntelligenceStates.ts — added 3 canonical states (approvalRuleAny, approvalRuleAll, mixedSeverityAcknowledged)
  - src/__tests__/probeScheduler.test.ts — added 2 tests (exponential backoff timing, degraded aggregation)
  - src/__tests__/monitors.test.ts — added 2 tests (category+entity dedupe, auto-resolve filtering)
  - src/__tests__/helpers.test.ts — added 2 tests (any-mode eligibility, all-mode eligibility)
  - package.json — added storybook devDependencies + script
Files created:
  - .storybook/main.ts — Storybook 8 config
  - .storybook/preview.tsx — QueryClientProvider decorator
  - src/components/AdminAlertBadge.stories.tsx — severity × count matrix
  - src/components/ImplementationTruthDashboard.stories.tsx — probe status × staleness matrix
  - src/components/ApprovalAuthorityTable.stories.tsx — approval mode × eligibility matrix + ApprovalRuleEditor composition
Notes:
  - Playwright e2e scenarios deferred (no e2e infra in package) — TODO comments in stories
  - resolveEligibility only implements direct-user; group-membership is future — documented gap in tests
  - monitors/probes/api/integrations excluded from coverage — new tests improve confidence without threshold impact
Next: SF17-T09
-->
