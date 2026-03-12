# SF21-T08 - Testing Strategy

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)  
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-21-Module-Feature-Project-Health-Pulse.md`  
**Decisions Applied:** D-02 through D-14  
**Estimated Effort:** 1.0 sprint-weeks  
**Depends On:** T01-T07

> **Doc Classification:** Canonical Normative Plan - SF21-T08 testing task; sub-plan of `SF21-Project-Health-Pulse.md`.

---

## Objective

Define fixtures and quality matrix for pulse computation, confidence/compound-risk behavior, explainability, recommendation prioritization, manual governance, Office suppression, portfolio triage, and telemetry quality.

---

## Testing Exports (`@hbc/features-project-hub/testing`)

- `createMockProjectHealthPulse(overrides?)`
- `createMockHealthDimension(overrides?)`
- `createMockHealthMetric(overrides?)`
- `mockProjectHealthStates`

Canonical states:

1. on-track with high confidence and complete data
2. watch with moderate confidence and early warning indicators
3. at-risk with low confidence and stale/excluded metrics
4. critical with compound-risk escalation and high-priority action
5. data-pending / unreliable confidence due to data quality
6. portfolio mixed-status triage set
7. manual-influence-heavy governance-risk set
8. Office suppression active set (noise-reduction behavior)

---

## Unit Tests

- 70/30 dimension compute math
- composite weighted score and status boundaries
- stale/missing exclusion and re-normalization
- confidence-tier derivation and reason generation
- compound-risk rule detection and severity mapping
- top recommended action prioritization and reason-code assignment
- Office suppression logic and severity weighting
- admin config validation including governance/suppression/triage policies

---

## Hook/Component Tests

- hook refresh/mutation and invalidation behavior
- confidence/explainability payload availability in hook state
- card/detail/tab/inline-edit interactions
- explainability drawer rendering
- reason-code display behavior for top action
- permission gates and override-approval visibility
- portfolio triage bucket/sort/filter behavior

---

## Storybook and Playwright

Storybook matrix:

- status x confidence x complexity states
- explainability variants (`why/changed/contributors/matters-most`)
- compound-risk warning variants
- governance and suppression indicator variants
- portfolio triage mode variants

Playwright flow:

1. open detail tab with stale metric warning
2. submit manual override with governance metadata
3. recompute pulse and observe confidence/reason changes
4. verify top action reason code and compound-risk warning
5. verify triage bucket movement in portfolio view

---

## Telemetry Verification

Must validate events/metrics for:

- intervention lead time
- false alarm rate
- pre-lag detection rate
- action adoption rate
- portfolio review cycle time
- suppression impact rate

---

## Coverage Gates

- lines >= 95
- branches >= 95
- functions >= 95
- statements >= 95
