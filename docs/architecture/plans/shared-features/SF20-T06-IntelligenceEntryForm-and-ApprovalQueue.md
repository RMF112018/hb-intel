# SF20-T06 - IntelligenceEntryForm and IntelligenceApprovalQueue

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-03, L-04, L-07, L-08, L-09, L-10
**Estimated Effort:** 1.25 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF20-T06 form/queue/workflow task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define contributor form and approver queue behavior plus handoff review mode, participant acknowledgment workflow, commitment register interactions, stale-review renewal flow, and conflict-resolution actions.

---

## `IntelligenceEntryForm`

Behavior:
- available to project-permissioned users
- required fields: type, title, body, normalized metadata dimensions
- optional fields: supporting links, related commitments
- submission transitions to `pending-approval`
- contributor sees pending/rejected/revision-requested status and reasons

Inline AI constraints:
- AI actions available inline only (no sidecar chat)
- suggestions must include citation metadata
- suggestions require explicit user approval before persistence
- AI-assisted entries are marked with provenance `ai-assisted-draft` and trust-downgraded until approved
- approved AI suggestions can auto-create/link BIC records where risk/gap is detected

---

## `IntelligenceApprovalQueue`

Behavior:
- approver-only queue of pending entries
- row actions: approve, reject (reason required), request revision
- approval writes approver + approvedAt + provenance metadata
- rejection and revision requests write rationale and reopen contributor workflow
- queue includes stale-review and conflict-resolution action rows

Complexity:
- Essential: hidden
- Standard: read-only queue summary for authorized approvers
- Expert: full queue + historical decision trail + configure-approver route

Accessibility:
- keyboard-operable actions
- focus + validation messaging for rejection/revision reasons

---

## `HandoffReviewMode`

Behavior:
- participants: PM, PX, Estimating Lead, BD Lead
- workflow steps:
  1. heritage snapshot walkthrough
  2. commitment register verification
  3. strategic risk discussion
  4. acknowledgment confirmation
- each participant records acknowledgment status
- completion requires all required acknowledgments and step completion

---

## `CommitmentRegisterPanel`

Behavior:
- displays explicit/implied commitments from pursuit context
- supports fulfillment status updates and unresolved escalation linkage to BIC
- highlights commitments at risk during handoff and stale-review cycles

---

## Verification Commands

```bash
pnpm --filter @hbc/features-business-development test -- IntelligenceEntryForm
pnpm --filter @hbc/features-business-development test -- IntelligenceApprovalQueue
pnpm --filter @hbc/features-business-development test -- HandoffReviewPanel
pnpm --filter @hbc/features-business-development test -- CommitmentRegisterPanel
pnpm --filter @hbc/strategic-intelligence test -- approval
pnpm --filter @hbc/strategic-intelligence test -- workflows
```
