# SF17-T04 - Hooks and State Model

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-03 through D-07, D-10
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan - SF17-T04 hooks task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define state and mutation contracts for admin alerts, infrastructure probes, and approval authority.

---

## `useAdminAlerts`

Responsibilities:

- fetch active alerts and compute `IAdminAlertBadge`
- support filters by severity/category/acknowledged state
- expose `acknowledge(alertId)` mutation with optimistic seen-state
- poll active alerts every `ADMIN_ALERTS_POLL_MS`
- expose `refresh()` and deterministic loading/error states

Cache keys:

- `['admin-alerts', 'active']`
- `['admin-alerts', 'history', range]`

---

## `useInfrastructureProbes`

Responsibilities:

- load latest probe snapshot for truth-layer dashboards
- expose probe status map and aggregate health
- poll on configurable cadence in Expert mode; manual refresh in Standard mode
- expose `runNow()` mutation for manual probe trigger

Cache keys:

- `['infra-probes', 'latest']`
- `['infra-probes', 'history', range]`

---

## `useApprovalAuthority`

Responsibilities:

- fetch all rules and index by `ApprovalContext`
- expose `upsertRule`, `deleteRule`, `testEligibility`
- keep optimistic state for table/editor workflows
- invalidate approval-dependent consumers after changes

Cache keys:

- `['approval-authority', 'rules']`
- `['approval-authority', 'eligibility', context, userId]`

---

## State Guarantees

- hooks return stable object shape across loading/success/error
- badge counts never show negative transitions during polling races
- approval rule updates are last-write-wins by `lastModifiedAt`
- probe snapshots are monotonic by `capturedAt`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin test -- hooks
pnpm --filter @hbc/features-admin check-types
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T04 completed: 2026-03-11
- Constants: ADMIN_ALERTS_QUERY_KEY, INFRA_PROBES_QUERY_KEY, APPROVAL_RULES_QUERY_KEY added
- API: ApprovalAuthorityApi typed with getRules, upsertRule, deleteRule, testEligibility stubs
- Helpers: computeAlertBadge (monotonic), buildProbeStatusMap, resolveEligibility created
- Hooks: useAdminAlerts, useInfrastructureProbes, useApprovalAuthority implemented with TanStack Query
- Tests: 11 helper tests + 18 hook tests (all passing)
- Barrel exports updated in hooks/index.ts and src/index.ts
- vitest.config.ts: removed src/hooks/** from coverage.exclude
- package.json: added @tanstack/react-query dependency
- All gates pass: check-types, build, lint (zero errors), test (53 passed)
-->
