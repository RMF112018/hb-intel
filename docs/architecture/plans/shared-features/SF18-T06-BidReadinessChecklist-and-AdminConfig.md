# SF18-T06 - BidReadinessChecklist and Admin Config UX

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF18-T06 checklist/admin-config task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define checklist/admin UX for blockers-first execution, inline AI actions, and offline-safe interaction states.

---

## `BidReadinessChecklist`

Behavior:

- blockers first, then non-blockers by effective weight
- row fields: completion status, label, assignee avatar, deep-link action, completion text
- row-level sync status badges: `Saved locally`, `Queued to sync`
- completion and ownership actions use optimistic UI with background replay

Complexity:

- Essential: checklist hidden
- Standard: checklist visible with status/actions/avatars
- Expert: Standard + weights + provenance/version context

Inline AI actions:

- rendered as row-level contextual buttons only
- no sidecar or chat panel
- each suggestion includes source citation references
- applying AI suggestions requires explicit user approval

---

## Admin Configuration UX Contract

Admin controls:

- modify criterion weights and blocker flags
- adjust trade coverage threshold
- manage criterion visibility by complexity tier
- freeze readiness snapshot at submission

Validation:

- normalized weight set remains deterministic
- blocker coverage is preserved for submission safety
- threshold ordering is valid before save

Audit and provenance:

- all config writes persist via `@hbc/versioned-record`
- immutable metadata includes version, author, and timestamp

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- BidReadinessChecklist
pnpm --filter @hbc/features-estimating test -- BidReadinessConfig
```
