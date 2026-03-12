# SF24-T06 - ExportProgressToast and ExportReceiptCard

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-24-Shared-Feature-Export-Runtime.md`
**Decisions Applied:** L-03, L-04, L-05, L-06
**Estimated Effort:** 0.9 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF24-T06 progress/receipt task; sub-plan of `SF24-Export-Runtime.md`.

---

## Objective

Define progress and receipt contracts for lifecycle feedback, artifact traceability, offline resume safety, and expert-level context stamping.

---

## `ExportProgressToast`

Behavior:
- projects lifecycle transitions for queued/rendering/complete/failed states
- links to artifact receipt when available
- displays deterministic replay status during reconnect recovery

---

## `ExportReceiptCard`

Behavior:
- shows artifact metadata and immutable context stamps (record/view/version/user/time/format/file)
- projects BIC ownership avatars and downstream My Work handoff metadata
- includes deep-links to related records, approvals, and follow-up tasks

Offline semantics:
- deterministic queue replay and conflict-safe recovery
- visible status states: `Saved locally`, `Queued to sync`

---

## Admin Configuration Contracts

- naming convention templates remain admin-configurable with audited revisions
- branding template versions and approval-state policy remain traceable
- receipt retention and visibility rules honor governance constraints

---

## Verification Commands

```bash
pnpm --filter @hbc/export-runtime test -- ExportProgressToast
pnpm --filter @hbc/export-runtime test -- ExportReceiptCard
pnpm --filter @hbc/export-runtime test -- receipts
pnpm --filter @hbc/export-runtime test -- approvals
```

