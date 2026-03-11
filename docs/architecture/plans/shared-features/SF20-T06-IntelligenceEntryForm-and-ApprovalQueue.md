# SF20-T06 - IntelligenceEntryForm and IntelligenceApprovalQueue

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-03, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T06 form/queue task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define contributor form and approver queue behavior, including inline AI actions, approval governance, and BIC projection contracts.

---

## `IntelligenceEntryForm`

Behavior:
- available to project-permissioned users
- required fields: type, title, body
- optional fields: tags, supporting links
- submission transitions to `pending-approval`
- contributor sees pending/rejected status and rejection reason

Inline AI constraints:
- AI actions/placeholders available inline only (no sidecar chat)
- suggestions must include citation metadata
- suggestions require explicit user approval before persistence
- approved AI suggestions can auto-create/link BIC records where risk/gap is detected

---

## `IntelligenceApprovalQueue`

Behavior:
- approver-only queue of pending entries
- row actions: approve, reject (reason required on reject)
- approval writes approver + approvedAt + provenance metadata
- rejection writes reason and enables contributor revision/resubmission

Complexity:
- Essential: hidden
- Standard: read-only queue summary for authorized approvers
- Expert: full queue + historical decision trail + configure-approver route

Accessibility:
- keyboard-operable approve/reject actions
- rejection reason focus + validation messaging

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- IntelligenceEntryForm
pnpm --filter @hbc/features-business-development test -- IntelligenceApprovalQueue
pnpm --filter @hbc/strategic-intelligence test -- approval
```
