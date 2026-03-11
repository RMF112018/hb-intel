# SF18-T06 - BidReadinessChecklist and Admin Config UX

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** D-05 through D-07, D-09
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T04

> **Doc Classification:** Canonical Normative Plan - SF18-T06 checklist/admin-config task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define criterion-level checklist rendering and admin configuration interaction patterns.

---

## `BidReadinessChecklist`

Behavior:

- blockers first, then non-blocker criteria by descending weight
- row fields: completion icon, label, assignee avatar, action link, completion description
- blocker rows include `BLOCKING` badge
- completed rows may include completion timestamp

Complexity:

- Essential: hidden
- Standard: visible checklist with status/actions
- Expert: includes weights and diagnostics metadata

---

## Admin Configuration UX Contract

Admin controls:

- modify criterion weights
- toggle blocker flags
- adjust trade-coverage threshold
- add optional custom criteria

Validation:

- normalized weight total must equal 1
- at least one blocker criterion must exist
- threshold ordering must be valid before save

Audit:

- config changes capture `modifiedBy` and `modifiedAt`

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- BidReadinessChecklist
pnpm --filter @hbc/features-estimating test -- BidReadinessConfig
```
