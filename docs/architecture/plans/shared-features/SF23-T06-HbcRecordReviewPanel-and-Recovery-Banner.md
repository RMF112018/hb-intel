# SF23-T06 - HbcRecordReviewPanel and HbcRecordRecoveryBanner

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-23-Shared-Feature-Record-Form.md`
**Decisions Applied:** L-03, L-04, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF23-T06 review/recovery task; sub-plan of `SF23-Record-Form.md`.

---

## Objective

Define review and recovery contracts for role-aware validation review, offline resume safety, and expert-level preview controls.

---

## `HbcRecordReviewPanel`

Behavior:
- read-only review presentation for Standard mode
- full preview with retrospective adjustments in Expert mode
- ownership, approval, and handoff BIC projection markers
- deep-links to related records, blockers, and routed downstream actions

---

## `HbcRecordRecoveryBanner`

Behavior:
- indicates recovered draft, version snapshot, and last sync outcome
- resolves merge/replay conflicts using immutable version metadata
- provides one-click resume to pending section or review gate

Offline semantics:
- deterministic queue replay and conflict-safe recovery
- visible status states: `Saved locally`, `Queued to sync`

---

## Admin Configuration Contracts

- form-definition revisions and approval-state policy remain admin-configurable
- recovery behavior and retention rules honor governance constraints
- audit events include approver identity and timestamp for status transitions

---

## Verification Commands

```bash
pnpm --filter @hbc/record-form test -- HbcRecordReviewPanel
pnpm --filter @hbc/record-form test -- HbcRecordRecoveryBanner
pnpm --filter @hbc/record-form test -- recovery
pnpm --filter @hbc/record-form test -- approvals
```
