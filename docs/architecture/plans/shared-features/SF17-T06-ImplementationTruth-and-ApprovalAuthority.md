# SF17-T06 - Implementation Truth and Approval Authority

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-04 through D-07, D-09
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF17-T06 truth-layer and policy UX task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Define UI contracts for truth-layer probe visibility and approval authority administration.

---

## `ImplementationTruthDashboard`

Sections:

1. SharePoint infrastructure
2. Azure Functions backend
3. Azure search health
4. notification system
5. module record health

Behavior:

- each section renders status chip, summary, key metrics, anomalies
- probe timestamp and staleness warning are always visible
- manual `Run probes now` action exposed in Expert mode

---

## `ApprovalAuthorityTable` and `ApprovalRuleEditor`

`ApprovalAuthorityTable` behavior:

- one row per `ApprovalContext`
- columns: context, users, groups, mode, last modified
- action: edit rule

`ApprovalRuleEditor` behavior:

- edit approver users/groups
- switch `any`/`all` mode
- save validates at least one user or group
- test eligibility action for sample user
- audit metadata updates on successful save

Complexity gating:

- Essential: hidden
- Standard: table + editor
- Expert: table + editor + eligibility simulation details

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin test -- ImplementationTruthDashboard
pnpm --filter @hbc/features-admin test -- ApprovalAuthority
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T06 completed: 2026-03-11
- ImplementationTruthDashboard: 5 probe sections, staleness warning, run-probes button, loading/error/empty states
- ApprovalAuthorityTable: rule table with edit action, loading/error/empty states
- ApprovalRuleEditor: form with validation (≥1 user/group), save/cancel actions
- Helper additions: probeStatusToVariant(), PROBE_STALENESS_MS constant
- Tests: 6 ImplementationTruthDashboard, 5 ApprovalAuthorityTable, 4 ApprovalRuleEditor tests added
Files modified:
  src/components/helpers.ts — probeStatusToVariant + PROBE_STALENESS_MS
  src/components/ImplementationTruthDashboard.tsx — full implementation
  src/components/ApprovalAuthorityTable.tsx — full implementation
  src/components/ApprovalRuleEditor.tsx — full implementation
  src/__tests__/components.test.tsx — T06 test suites added
Next: SF17-T07
-->
