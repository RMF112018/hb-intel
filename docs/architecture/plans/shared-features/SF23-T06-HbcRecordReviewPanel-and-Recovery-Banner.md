# SF23-T06 - HbcRecordReviewPanel and HbcRecordRecoveryBanner

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-03, L-04, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF23-T06 review/recovery task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define review and recovery contracts for role-aware validation review, stale-draft comparison, trust-aware restore/discard flows, and explicit retry guidance.

---

## `HbcRecordReviewPanel`

Behavior:

- read-only review presentation for Standard mode
- full preview with retrospective adjustments in Expert mode
- ownership, approval, and handoff BIC projection markers
- deep-links to related records, blockers, and routed downstream actions
- explicit review-step preview including:
  - why the step exists
  - whether it is blocking or non-blocking
  - whether it is pre-submit or post-submit
  - who currently owns it
  - what happens next when it is completed

---

## `HbcRecordRecoveryBanner`

Behavior:

- indicates recovered draft, version snapshot, last sync outcome, and trust state
- resolves merge/replay conflicts using immutable version metadata
- provides compare, restore, discard, retry, and resume actions as appropriate
- provides one-click resume to pending section or review gate only when safe

Trust and explainability requirements:

- explains why recovery is shown
- distinguishes local draft, server draft, restored draft, and stale restored draft
- marks stale restored drafts as `recovered-needs-review`
- preserves prior validation metadata and warnings where still relevant
- makes destructive discard behavior explicit and guarded

Offline semantics:

- deterministic queue replay and conflict-safe recovery
- visible status states: `Saved locally`, `Queued to sync`
- degraded or partially recovered states must explain what remains unresolved

---

## Exceptional and Admin Semantics

- form-definition revisions and approval-state policy remain admin-configurable
- recovery behavior and retention rules honor governance constraints
- manual override or exceptional handling stays visible, attributable, and auditable
- audit events include actor identity and timestamp for restore, discard, retry, replay-conflict, and status transitions

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- HbcRecordReviewPanel
pnpm --filter @hbc/record-form test -- HbcRecordRecoveryBanner
pnpm --filter @hbc/record-form test -- recovery
pnpm --filter @hbc/record-form test -- approvals
```
