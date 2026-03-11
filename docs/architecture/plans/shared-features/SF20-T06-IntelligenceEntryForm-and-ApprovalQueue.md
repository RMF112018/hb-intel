# SF20-T06 - IntelligenceEntryForm and IntelligenceApprovalQueue

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** D-04 through D-07
**Estimated Effort:** 0.85 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T06 form/queue task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define contributor submission and approver queue interfaces for governed strategic intelligence lifecycle.

---

## `IntelligenceEntryForm`

Behavior:

- available to project-permissioned users
- required fields: type, title, body
- optional fields: tags, supporting attachment links
- submission transitions entry to `pending-approval`
- contributor sees pending/rejected status and rejection reason (if any)

---

## `IntelligenceApprovalQueue`

Behavior:

- approver-only list of pending entries
- row actions: approve, reject (reason required on reject)
- approval writes `approver` and `approvedAt`
- rejection writes `rejectionReason`; allows contributor revision/resubmission

Complexity:

- Essential: hidden
- Standard: approver queue list
- Expert: queue + historical decision trail

Accessibility:

- keyboard-operable approve/reject actions
- rejection reason form focus and validation messages

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- IntelligenceEntryForm
pnpm --filter @hbc/features-business-development test -- IntelligenceApprovalQueue
```
