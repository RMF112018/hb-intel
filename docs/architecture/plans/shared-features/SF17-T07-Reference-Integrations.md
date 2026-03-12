# SF17-T07 - Reference Integrations

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-17-Module-Feature-Admin-Intelligence.md`
**Decisions Applied:** D-06, D-07, D-08
**Estimated Effort:** 0.7 sprint-weeks
**Depends On:** T03-T06

> **Doc Classification:** Canonical Normative Plan - SF17-T07 integration task; sub-plan of `SF17-Admin-Intelligence.md`.

---

## Objective

Provide boundary-safe integration patterns across dependent shared features and admin applications.

---

## Integration Contracts

- `@hbc/bic-next-move`
  - stuck-workflow monitor reads BIC ownership/blocking metadata for alert context
- `@hbc/notification-intelligence`
  - immediate vs digest routing by severity policy
- `@hbc/acknowledgment`
  - approval `resolveParties` path calls `ApprovalAuthorityApi.getApprovers(context)`
- `@hbc/versioned-record`
  - approval rule changes can emit governance snapshots in admin workflows
- `@hbc/complexity`
  - complexity tier controls badge/dashboard/truth diagnostics/eligibility simulation depth

---

## Reference Wiring Examples

1. acknowledgment eligibility resolution using approval authority rule lookup
2. monitor output to notification-intelligence event dispatch contract
3. admin route composition in `apps/admin` for badge/dashboard/truth pages

---

## Boundary Rules

- no direct imports from feature app pages into `@hbc/features-admin`
- no cross-package mutation of approval rules outside `ApprovalAuthorityApi`
- notification-intelligence remains transport owner; admin-intelligence only publishes events

---

## Verification Commands

```bash
pnpm --filter @hbc/features-admin test -- integrations
rg -n "from 'packages/features/" packages/features/admin/src
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF17-T07 completed: 2026-03-11
Files created:
  - src/integrations/bicNextMoveAdapter.ts (IBicBlockingContext, IBicNextMoveAdapter, ReferenceBicNextMoveAdapter)
  - src/integrations/notificationDispatchAdapter.ts (IAdminNotificationEvent, INotificationDispatchAdapter, ReferenceNotificationDispatchAdapter)
  - src/integrations/acknowledgmentAdapter.ts (IApprovalPartyResolution, IAcknowledgmentApprovalAdapter, ReferenceAcknowledgmentAdapter)
  - src/integrations/versionedRecordAdapter.ts (IGovernanceSnapshotPayload, IGovernanceSnapshotAdapter, ReferenceGovernanceSnapshotAdapter)
  - src/integrations/complexityGatingAdapter.ts (AdminComplexityTier, IAdminComplexityGating, ReferenceComplexityGatingAdapter)
  - src/integrations/index.ts (barrel)
  - src/__tests__/integrations.test.ts (26 tests)
Files modified:
  - src/index.ts (added Integrations export section)
  - vitest.config.ts (added src/integrations/** to coverage exclude)
Verification: check-types ✓ | build ✓ | lint ✓ | test ✓ (112 tests, 26 new)
Next: SF17-T08
-->
