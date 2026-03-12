# SF25-T06 - PublishApprovalChecklist and PublishReceiptCard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-25-Shared-Feature-Publish-Workflow.md`
**Decisions Applied:** L-02, L-04, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF25-T06 checklist/receipt task; sub-plan of `SF25-Publish-Workflow.md`.

---

## Objective

Define approval checklist and receipt contracts for deterministic publish gates, acknowledgment flow, supersession/revocation traceability, and offline status continuity.

---

## `PublishApprovalChecklist`

Behavior:
- displays readiness and approval rules as deterministic pass/fail gates
- projects ownership avatars and due-state markers for unresolved steps
- includes supersession warnings, revocation prerequisites, and acknowledgment requirements

---

## `PublishReceiptCard`

Behavior:
- shows publish ID, issue label, actor, timestamp, target outcomes, and supersession chain links
- projects deep-links to source records and downstream governance actions
- includes BIC ownership and My Work handoff metadata

Offline semantics:
- deterministic queue replay and conflict-safe recovery
- visible status states: `Saved locally`, `Queued to sync`

---

## Admin Configuration Contracts

- approval rules and acknowledgment policies remain admin-configurable with audited revisions
- supersession/revocation policy controls remain traceable and enforceable
- receipt retention and visibility rules honor governance constraints

---

## Verification Commands

```bash
pnpm --filter @hbc/publish-workflow test -- PublishApprovalChecklist
pnpm --filter @hbc/publish-workflow test -- PublishReceiptCard
pnpm --filter @hbc/publish-workflow test -- receipts
pnpm --filter @hbc/publish-workflow test -- acknowledgments
```

