# SF18-T06 - BidReadinessChecklist and Admin Config UX

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-18-Module-Feature-Estimating-Bid-Readiness.md`
**Decisions Applied:** L-01 through L-06
**Estimated Effort:** 0.75 sprint-weeks
**Depends On:** T05 + primitive extraction checkpoint (`@hbc/health-indicator`) before T06 completion

> **Doc Classification:** Canonical Normative Plan - SF18-T06 checklist/admin-config task; sub-plan of `SF18-Estimating-Bid-Readiness.md`.

---

## Objective

Define checklist/admin UX for blockers-first execution, eligibility-profile governance, bid-day/team-state operations, inline AI actions, and offline-safe interaction states.
T06 must operationalize coordinated signals: `Submission Eligibility`, `Bid Readiness Score`, and `Estimate Confidence`.

---

## Blocking Classification

- This task is `required before T06` for:
  - bid-day mode state model adoption
  - eligibility profile model by project/bid type
  - immutable vs conditional gate enforcement
  - subcontractor coverage quality and addenda impact model expansion
  - team bid-room overlays and telemetry schema realignment
  - primitive extraction completion gate

---

## Transitional Compatibility Rules (T06)

- Preserve compatibility aliases from T02 while introducing coordinated-signal-first contracts.
- Maintain backward-compatible hook fields until checklist/admin consumers fully migrate.
- Do not remove T03/T04 deterministic helpers; extend them with eligibility, confidence, bid-day, and team-state overlays.
- Migrate boolean inputs to richer domain models via additive fields first, then staged deprecation post-T06.

---

## `BidReadinessChecklist`

Behavior:

- blockers first, then non-blockers by effective weight
- row fields: completion status, label, assignee avatar, deep-link action, completion text
- row-level sync status badges: `Saved locally`, `Queued to sync`
- completion and ownership actions use optimistic UI with background replay
- include eligibility gate sections:
  - immutable gates
  - conditional gates
- include bid-day overlays (`72h`, `24h`, `4h`, `1h`) with handoff and unresolved blocker emphasis
- include team bid-room overlays (`waiting-on`, reviewer assignments, signoff progression)

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

- manage eligibility profiles by project/bid type (delivery method, owner type, project category, procurement type, optional jurisdiction)
- edit immutable and conditional gate definitions with governance controls
- modify readiness criterion weights and blocker flags
- adjust subcontractor coverage quality thresholds
- manage criterion visibility by complexity tier
- manage addenda impact workflow policy
- freeze readiness snapshot at submission

Validation:

- normalized weight set remains deterministic
- blocker coverage is preserved for submission safety
- threshold ordering is valid before save
- immutable gate contracts cannot be bypassed by runtime checklist edits
- conditional gate evaluation must remain deterministic and traceable

Audit and provenance:

- all config writes persist via `@hbc/versioned-record`
- immutable metadata includes version, author, and timestamp
- profile publish/promote actions preserve governance lineage and evaluation traceability

---

## Completion Gate

Canonical evaluation runtime must be extracted to `@hbc/health-indicator` before T06 can be marked complete.

---

## Primitive Extraction Gate (Non-Negotiable)

T06 cannot be marked complete until canonical evaluation/profile/telemetry runtime ownership is moved to `@hbc/health-indicator` and `@hbc/features-estimating` consumes that runtime as a domain adapter.

---

## Verification Commands

```bash
pnpm --filter @hbc/features-estimating test -- BidReadinessChecklist
pnpm --filter @hbc/features-estimating test -- BidReadinessConfig
```

---

## Progress Notes

### 2026-03-12 - T06a + T06b implementation complete

- Implemented checklist model layer in `packages/features/estimating/src/bid-readiness/checklist/` with deterministic ordering/grouping, blocker support, recompute triggers, and partial/missing snapshot fallback handling.
- Implemented checklist/admin hooks (`useBidReadinessChecklist`, `useBidReadinessAdminConfig`) and checklist/admin UI surfaces in `packages/features/estimating/src/bid-readiness/components/` with deterministic loading/success/empty/error/degraded behavior.
- Added T06 contracts in `src/types/` for checklist items, admin config, and hook result envelopes as additive compatibility-safe extensions.
- Completed T06b extraction gate by introducing canonical runtime ownership in `packages/health-indicator` and rewiring estimating profile/scoring/telemetry runtime wrappers to consume `@hbc/health-indicator`.
- Verification gates passed with zero errors:
  - `pnpm --filter @hbc/features-estimating check-types`
  - `pnpm --filter @hbc/features-estimating build`
  - `pnpm --filter @hbc/features-estimating test`
- T06 completion gate satisfied: canonical evaluation runtime has been extracted to `@hbc/health-indicator` before marking T06 complete.
