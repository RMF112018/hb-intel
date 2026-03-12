# SF20-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-20-Module-Feature-BD-Heritage-Panel.md`
**Decisions Applied:** L-01 through L-10
**Estimated Effort:** 1.15 sprint-weeks
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF20-T08 testing task; sub-plan of `SF20-BD-Heritage-Panel.md`.

---

## Objective

Define fixture exports and quality matrix for trust-aware lifecycle, handoff acknowledgment workflows, commitment governance, sensitivity/redaction behavior, conflict/supersession flows, proactive reuse suggestions, explainability rendering, offline replay, and expanded telemetry.

---

## Testing Exports

Primitive (`@hbc/strategic-intelligence/testing`):
- `createMockHeritageSnapshot(overrides?)`
- `createMockStrategicIntelligenceEntry(overrides?)`
- `createMockCommitmentRegisterItem(overrides?)`
- `createMockHandoffReviewState(overrides?)`
- `createMockIntelligenceApprovalItem(overrides?)`
- `createMockIntelligenceConflict(overrides?)`
- `createMockSuggestedIntelligenceMatch(overrides?)`
- `mockStrategicIntelligenceStates`

Adapter (`@hbc/features-business-development/testing`):
- `createMockStrategicIntelligenceProfile(overrides?)`
- `createMockBdStrategicIntelligenceView(overrides?)`

Canonical states:
1. heritage snapshot only
2. living intelligence approved feed
3. pending/rejected/revision-requested queue states
4. trust tiers (`high/moderate/low/review-required`)
5. provenance classes including `ai-assisted-draft`
6. stale/review-due entry variants
7. handoff acknowledgment incomplete vs complete
8. commitment register unresolved vs fulfilled
9. supersession/contradiction with resolution notes
10. sensitivity redacted vs full projection views
11. suggested heritage/intelligence with explainability
12. saved locally / queued to sync / replay reconciled

---

## Unit Tests

- snapshot immutability vs additive living-entry behavior
- trust/reliability derivation and AI-draft downgrade rules
- acknowledgment completion gate and commitment status transitions
- stale detection/review-due computations
- supersession/contradiction resolution state transitions
- redaction policy predicates and projection shape guarantees
- suggestion trigger + explainability payload correctness
- telemetry emission schema and threshold mapping (legacy + expanded workflow metrics)

---

## Hook/Component Tests

- primitive and adapter hook transitions for trust/workflow/conflict/suggestion state
- panel/feed/form/queue/review rendering and behavior
- handoff review acknowledgment interactions
- commitment register update and escalation behavior
- stale-review and conflict-resolution action flows
- complexity-gated render paths
- inline AI citation + approval + trust-state callbacks
- My Work projection behavior for commitments/stale/conflicts

---

## Storybook and Playwright

Storybook matrix:
- complexity tier x panel/feed/form/queue/review depth
- inherited/approved/pending/rejected/stale/conflicted states
- trust tier/provenance variants
- redacted/full visibility variants
- suggestion/explainability variants
- offline variants

Playwright scenarios:
1. handoff review workflow completes only after required acknowledgments
2. commitment register unresolved item escalates to My Work/BIC
3. AI-assisted draft remains downgraded until approval
4. stale review queue surfaces due entries and renewal actions
5. conflict/supersession entries render resolution guidance
6. suggested intelligence card shows explainability and action outcomes
7. redacted cross-module projection hides restricted content but keeps context
8. offline queue shows `Saved locally` then `Queued to sync` and replay reconciliation

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
